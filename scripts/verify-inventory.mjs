// End-to-end Admin Inventory management tests (Step: Inventory management).
// Prerequisites: app running on http://localhost:3000, ADMIN_* + MONGODB_* env set.
// Run: `node --env-file=.env.local scripts/verify-inventory.mjs`
import assert from "node:assert/strict";
import { MongoClient, ObjectId } from "mongodb";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const USERNAME = process.env.ADMIN_USERNAME ?? "";
const PASSWORD = process.env.ADMIN_TEST_PASSWORD ?? "";
if (!USERNAME || !PASSWORD) {
  throw new Error("ADMIN_USERNAME and ADMIN_TEST_PASSWORD are required.");
}
const uri = process.env.MONGODB_URI ?? "";
const dbName = process.env.MONGODB_DB ?? "mobile-cases-ecommerce";
if (!uri) {
  throw new Error("MONGODB_URI is required.");
}

const request = (path, { method = "GET", body, cookie } = {}) =>
  fetch(`${BASE}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

let passed = 0;
let failed = 0;
function check(name, cond) {
  if (cond) {
    passed += 1;
    console.log(`PASS ${name}`);
  } else {
    failed += 1;
    console.log(`FAIL ${name}`);
  }
}

let originalQty = 0;
let originalThreshold = 0;
let originalStatus = "active";
let inventoryId = "";
let productId = "";
let productName = "";

const client = new MongoClient(uri);

try {
  // 1. Unauthenticated access to every inventory mutation is rejected.
  let res = await request("/api/admin/inventory");
  check("unauthenticated inventory list -> 401", res.status === 401);
  res = await request("/api/admin/inventory", { method: "POST", body: {} });
  check("unauthenticated inventory create -> 401", res.status === 401);
  res = await request("/api/admin/inventory/000000000000000000000000", {
    method: "PATCH",
    body: { lowStockThreshold: 1 },
  });
  check("unauthenticated inventory update -> 401", res.status === 401);
  res = await request("/api/admin/inventory/000000000000000000000000", {
    method: "DELETE",
  });
  check("unauthenticated inventory deactivate -> 401", res.status === 401);
  res = await request("/api/admin/inventory/000000000000000000000000/stock", {
    method: "PATCH",
    body: { quantity: 5 },
  });
  check("unauthenticated stock set -> 401", res.status === 401);
  res = await request("/api/admin/inventory/000000000000000000000000/adjust", {
    method: "POST",
    body: { delta: 5 },
  });
  check("unauthenticated stock adjust -> 401", res.status === 401);

  // 2. Login.
  res = await request("/api/admin/login", {
    method: "POST",
    body: { username: USERNAME, password: PASSWORD },
  });
  check("login -> 200", res.status === 200);
  const sessionValue = (res.headers.get("set-cookie") ?? "").match(
    /admin_session=([^;]+)/,
  )?.[1];
  assert.ok(sessionValue, "session cookie value missing");
  const cookie = `admin_session=${sessionValue}`;

  // Capture the seeded inventory record to mutate + restore.
  const db = client.db(dbName);
  const seedProduct = await db.collection("products").findOne({
    slug: "silicone-case-iphone-15",
    status: "active",
  });
  assert.ok(seedProduct, "seed product not found");
  productId = seedProduct._id.toHexString();
  productName = seedProduct.name;
  const seedInventory = await db
    .collection("inventory")
    .findOne({ productId: seedProduct._id });
  assert.ok(seedInventory, "seed inventory record not found");
  inventoryId = seedInventory._id.toHexString();
  originalQty = seedInventory.quantity;
  originalThreshold = seedInventory.lowStockThreshold;
  originalStatus = seedInventory.status;

  // 3. Admin inventory listing shape + server enrichment.
  res = await request(
    `/api/admin/inventory?page=1&pageSize=10&includeArchived=true`,
    { cookie },
  );
  check("inventory list -> 200", res.status === 200);
  let body = await res.json();
  assert.equal(body.ok, true);
  assert.ok(Array.isArray(body.data.items), "items is array");
  const firstEnriched = body.data.items[0];
  check(
    "inventory list shape + enrichment",
    typeof body.data.total === "number" &&
      Array.isArray(firstEnriched.modelNames) &&
      typeof firstEnriched.productName === "string" &&
      typeof firstEnriched.productSlug === "string" &&
      typeof firstEnriched.quantity === "number" &&
      typeof firstEnriched.lowStockThreshold === "number" &&
      ["active", "archived"].includes(firstEnriched.status),
  );

  // 4. Status filter precedence: explicit status wins over includeArchived.
  res = await request(
    `/api/admin/inventory?includeArchived=true&status=archived&pageSize=100`,
    { cookie },
  );
  body = await res.json();
  check(
    "status=archived returns only archived rows",
    body.data.items.every((row) => row.status === "archived"),
  );
  res = await request(
    `/api/admin/inventory?includeArchived=true&status=active&pageSize=100`,
    { cookie },
  );
  body = await res.json();
  check(
    "status=active returns only active rows",
    body.data.items.length > 0 &&
      body.data.items.every((row) => row.status === "active"),
  );
  res = await request(
    `/api/admin/inventory?pageSize=1000`,
    { cookie },
  );
  body = await res.json();
  check(
    "default list excludes archived",
    body.data.items.every((row) => row.status === "active"),
  );

  // 5. Search by product name.
  res = await request(
    `/api/admin/inventory?q=${encodeURIComponent("silicone")}&includeArchived=true&pageSize=100`,
    { cookie },
  );
  body = await res.json();
  check(
    "search by product name",
    res.status === 200 &&
      body.data.items.length >= 1 &&
      body.data.items.every((row) =>
        row.productName.toLowerCase().includes("silicone"),
      ),
  );
  res = await request(
    `/api/admin/inventory?q=${encodeURIComponent("zzz-no-such-product")}&includeArchived=true`,
    { cookie },
  );
  check("search with no matches -> empty list", res.status === 200);
  body = await res.json();
  check("no-match search returns zero items", body.data.items.length === 0);

  // 6. Mobile model filter (authoritative count resolved via DB).
  const modelId = seedProduct.compatibleModelIds[0];
  const modelProducts = await db
    .collection("products")
    .find({ compatibleModelIds: modelId })
    .toArray();
  const expectedProductIds = modelProducts.map((p) => p._id);
  const expectedInventory = await db
    .collection("inventory")
    .countDocuments({ productId: { $in: expectedProductIds } });
  res = await request(
    `/api/admin/inventory?mobileModelId=${modelId.toHexString()}&includeArchived=true&pageSize=100`,
    { cookie },
  );
  body = await res.json();
  check(
    "mobile model filter returns matching inventory",
    res.status === 200 && body.data.total === expectedInventory,
  );

  // 7. Product filter + invalid model id.
  res = await request(
    `/api/admin/inventory?productId=${productId}&includeArchived=true`,
    { cookie },
  );
  body = await res.json();
  check(
    "product filter returns single record",
    res.status === 200 &&
      body.data.total === 1 &&
      body.data.items[0].productId === productId,
  );
  res = await request(
    `/api/admin/inventory?mobileModelId=not-an-objectid`,
    { cookie },
  );
  check("invalid mobileModelId -> 400", res.status === 400);

  // 8. Set stock quantity (absolute).
  res = await request(`/api/admin/inventory/${inventoryId}/stock`, {
    method: "PATCH",
    body: { quantity: 9999 },
    cookie,
  });
  body = await res.json();
  check(
    "set quantity -> 200 with updated value",
    res.status === 200 && body.data.quantity === 9999,
  );

  // 9. DB-backed change appears via the storefront inventory API the UI uses.
  res = await request(`/api/inventory?productIds=${productId}`);
  body = await res.json();
  check(
    "storefront inventory reflects set quantity",
    res.status === 200 && body.data.items?.[0]?.quantity === 9999,
  );

  // 10. Invalid quantities are rejected.
  res = await request(`/api/admin/inventory/${inventoryId}/stock`, {
    method: "PATCH",
    body: { quantity: -1 },
    cookie,
  });
  check("negative quantity -> 400", res.status === 400);
  res = await request(`/api/admin/inventory/${inventoryId}/stock`, {
    method: "PATCH",
    body: { quantity: 3.5 },
    cookie,
  });
  check("non-integer quantity -> 400", res.status === 400);
  res = await request(`/api/admin/inventory/${inventoryId}/stock`, {
    method: "PATCH",
    body: { quantity: "5" },
    cookie,
  });
  check("string quantity -> 400", res.status === 400);
  res = await request(
    `/api/admin/inventory/000000000000000000000000/stock`,
    { method: "PATCH", body: { quantity: 5 }, cookie },
  );
  check("stock set on unknown id -> 404", res.status === 404);

  // 11. Adjust stock (relative).
  res = await request(`/api/admin/inventory/${inventoryId}/adjust`, {
    method: "POST",
    body: { delta: 5 },
    cookie,
  });
  body = await res.json();
  check("adjust +5 -> 10004", res.status === 200 && body.data.quantity === 10004);
  res = await request(`/api/admin/inventory/${inventoryId}/adjust`, {
    method: "POST",
    body: { delta: -4 },
    cookie,
  });
  body = await res.json();
  check("adjust -4 -> 10000", res.status === 200 && body.data.quantity === 10000);

  // 12. Negative stock can never be created.
  res = await request(`/api/admin/inventory/${inventoryId}/adjust`, {
    method: "POST",
    body: { delta: -100000 },
    cookie,
  });
  check("adjust below zero -> 400", res.status === 400);
  res = await request(
    `/api/admin/inventory?productId=${productId}`,
    { cookie },
  );
  body = await res.json();
  check(
    "stock unchanged after rejected adjust",
    body.data.items?.[0]?.quantity === 10000,
  );
  res = await request(`/api/admin/inventory/${inventoryId}/adjust`, {
    method: "POST",
    body: { delta: 2.5 },
    cookie,
  });
  check("non-integer delta -> 400", res.status === 400);
  res = await request(`/api/admin/inventory/${inventoryId}/stock`, {
    method: "PATCH",
    body: { quantity: 0 },
    cookie,
  });
  check("set quantity to 0 -> 200", res.status === 200);
  res = await request(`/api/admin/inventory/${inventoryId}/adjust`, {
    method: "POST",
    body: { delta: -1 },
    cookie,
  });
  check("negative adjust at zero stock -> 400", res.status === 400);
  res = await request(`/api/admin/inventory/${inventoryId}/adjust`, {
    method: "POST",
    body: { delta: 3 },
    cookie,
  });
  body = await res.json();
  check("adjust from zero works", res.status === 200 && body.data.quantity === 3);

  // 13. Low-stock threshold configuration.
  res = await request(`/api/admin/inventory/${inventoryId}`, {
    method: "PATCH",
    body: { lowStockThreshold: 25 },
    cookie,
  });
  body = await res.json();
  check(
    "update low-stock threshold -> 200",
    res.status === 200 && body.data.lowStockThreshold === 25,
  );
  res = await request(`/api/admin/inventory/${inventoryId}`, {
    method: "PATCH",
    body: { lowStockThreshold: -1 },
    cookie,
  });
  check("negative threshold -> 400", res.status === 400);
  res = await request(`/api/admin/inventory/${inventoryId}`, {
    method: "PATCH",
    body: { lowStockThreshold: 2.5 },
    cookie,
  });
  check("non-integer threshold -> 400", res.status === 400);

  // 14. Activate / deactivate lifecycle.
  res = await request(`/api/admin/inventory/${inventoryId}`, {
    method: "DELETE",
    cookie,
  });
  body = await res.json();
  check(
    "deactivate -> archived",
    res.status === 200 && body.data.status === "archived",
  );
  res = await request(`/api/admin/inventory/${inventoryId}/stock`, {
    method: "PATCH",
    body: { quantity: 50 },
    cookie,
  });
  check("stock set on archived inventory -> 400", res.status === 400);
  res = await request(
    `/api/admin/inventory?status=archived&includeArchived=true&productId=${productId}`,
    { cookie },
  );
  body = await res.json();
  check(
    "archived filter shows deactivated record",
    res.status === 200 && body.data.items[0]?.status === "archived",
  );
  res = await request(`/api/admin/inventory/${inventoryId}`, {
    method: "PATCH",
    body: { status: "active" },
    cookie,
  });
  body = await res.json();
  check("reactivate -> active", res.status === 200 && body.data.status === "active");
  res = await request(`/api/admin/inventory/${inventoryId}/stock`, {
    method: "PATCH",
    body: { quantity: 7 },
    cookie,
  });
  body = await res.json();
  check("stock set works after reactivation", res.status === 200 && body.data.quantity === 7);

  // 15. The admin listing (what the UI renders) reflects final DB state.
  res = await request(
    `/api/admin/inventory?includeArchived=true&q=${encodeURIComponent(
      productName.slice(0, 6),
    )}&pageSize=100`,
    { cookie },
  );
  body = await res.json();
  const row = body.data.items.find((item) => item._id === inventoryId);
  check(
    "UI dataset reflects stock + threshold",
    row &&
      row.quantity === 7 &&
      row.lowStockThreshold === 25 &&
      row.status === "active",
  );

  // 16. Admin page renders + auth redirect.
  res = await request("/admin/inventory", { cookie });
  check("admin inventory page renders", res.status === 200);
  const html = await res.text();
  check(
    "admin inventory page shows management UI",
    html.includes("Inventory") && html.includes("Search"),
  );
  res = await fetch(`${BASE}/admin/inventory`, { redirect: "manual" });
  check(
    "admin inventory page without session -> redirect",
    [307, 308].includes(res.status),
  );
} finally {
  try {
    const db = client.db(dbName);
    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(productId) });
    if (product && inventoryId) {
      await db.collection("inventory").updateOne(
        { _id: new ObjectId(inventoryId) },
        {
          $set: {
            quantity: originalQty,
            lowStockThreshold: originalThreshold,
            status: originalStatus,
          },
        },
      );
    }
  } catch {
    // Best-effort cleanup.
  }
  await client.close();
}

console.log(`\n${passed} passed, ${failed} failed`);
assert.equal(failed, 0);