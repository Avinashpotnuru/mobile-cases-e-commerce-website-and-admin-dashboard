// End-to-end Admin Order Management tests.
// Prerequisites:
//   1. Seeded database and PAYMENT_PROVIDER=dummy (see .env.example).
//   2. App running on http://localhost:3000.
// Run:  `node --env-file=.env.local scripts/verify-orders.mjs`
import assert from "node:assert/strict";
import { MongoClient, ObjectId } from "mongodb";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const USERNAME = process.env.ADMIN_USERNAME ?? "";
const PASSWORD = process.env.ADMIN_TEST_PASSWORD ?? "";
const uri = process.env.MONGODB_URI ?? "";
const dbName = process.env.MONGODB_DB ?? "mobile-cases-ecommerce";
if (!USERNAME || !PASSWORD || !uri) {
  throw new Error(
    "ADMIN_USERNAME, ADMIN_TEST_PASSWORD and MONGODB_URI required (run with --env-file=.env.local).",
  );
}

const stamp = Date.now().toString(36).toUpperCase();
const KEYS = [`verify-orders-${stamp}-a`, `verify-orders-${stamp}-b`];

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

function toDateParam(date) {
  return date.toISOString().slice(0, 10);
}

let client;
let originalQty = 0;
let orders = [];

try {
  client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const product = await db
    .collection("products")
    .findOne({ slug: "silicone-case-iphone-15", status: "active" });
  assert.ok(product, "Seed product missing - run npm run db:seed first.");
  const productId = product._id.toHexString();
  const unitPrice = product.priceCents;

  const inventory = await db
    .collection("inventory")
    .findOne({ productId: product._id });
  assert.ok(inventory, "Inventory missing for seed product.");
  originalQty = inventory.quantity;

  const FORM = {
    email: "orders.qa@example.com",
    firstName: "Order",
    lastName: "Qa",
    phone: "+15550009999",
    addressLine1: "1 Main Street",
    addressLine2: "",
    city: "Portland",
    region: "OR",
    postalCode: "97202",
    country: "US",
    deliveryMethod: "standard",
  };
  const cookify = (lines) =>
    `cart=${encodeURIComponent(JSON.stringify(lines))}`;
  const placeOrder = async (productQty, key, overrides = {}) => {
    const res = await request("/api/orders", {
      method: "POST",
      body: { ...FORM, ...overrides, idempotencyKey: key },
      cookie: cookify([{ productId, quantity: productQty }]),
    });
    assert.equal(res.status, 200, `order create failed: ${res.status}`);
    const body = await res.json();
    assert.equal(body.ok, true);
    return body.data.order;
  };

  // 0. Unauthenticated admin operations are rejected.
  let res = await request("/api/admin/orders");
  check("unauthenticated order list -> 401", res.status === 401);

  // 1. Create two test orders through the real storefront API.
  const orderA = await placeOrder(1, KEYS[0], {
    email: "alpha.orders@example.com",
    firstName: "Alpha",
    lastName: "Order",
  });
  const orderB = await placeOrder(2, KEYS[1], {
    email: "beta.orders@example.com",
    firstName: "Beta",
    lastName: "Order",
  });
  orders = [orderA, orderB];
  const expectedShippingA = unitPrice >= 5000 ? 0 : 499;
  const expectedShippingB = unitPrice * 2 >= 5000 ? 0 : 499;
  check(
    "storefront snapshots server-calculated totals",
    orderA.subtotalCents === unitPrice &&
      orderA.totalCents === unitPrice + expectedShippingA &&
      orderB.totalCents === unitPrice * 2 + expectedShippingB,
  );

  // 2. Login.
  res = await request("/api/admin/login", {
    method: "POST",
    body: { username: USERNAME, password: PASSWORD },
  });
  check("admin login -> 200", res.status === 200);
  const sessionValue = (res.headers.get("set-cookie") ?? "").match(
    /admin_session=([^;]+)/,
  )?.[1];
  assert.ok(sessionValue, "session cookie value missing");
  const cookie = `admin_session=${sessionValue}`;

  // 3. Order list shape + newest-first ordering.
  res = await request(
    `/api/admin/orders?page=1&pageSize=10`,
    { cookie },
  );
  check("order list -> 200", res.status === 200);
  let body = await res.json();
  assert.equal(body.ok, true);
  assert.ok(Array.isArray(body.data.items), "items is an array");
  check(
    "order list shape",
    typeof body.data.total === "number" &&
      typeof body.data.totalPages === "number" &&
      body.data.page === 1 &&
      body.data.pageSize === 10,
  );
  check(
    "order list items do not expose accessCode",
    body.data.items.every(
      (item) => item.accessCode === undefined && item.idempotencyKey === undefined,
    ),
  );
  const listOrderNumbers = body.data.items.map((item) => item.orderNumber);
  const aIdx = listOrderNumbers.indexOf(orderA.orderNumber);
  const bIdx = listOrderNumbers.indexOf(orderB.orderNumber);
  check(
    "list contains both test orders, newest first",
    aIdx !== -1 &&
      bIdx !== -1 &&
      new Date(body.data.items[bIdx].createdAt).getTime() >=
        new Date(body.data.items[aIdx].createdAt).getTime(),
  );
  check(
    "list item items only carry quantity",
    body.data.items.every(
      (item) =>
        item.items.every(
          (line) => typeof line.quantity === "number" && line.productId === undefined,
        ),
    ),
  );

  // 4. Search by order number / customer.
  const searches = [
    ["order number", orderA.orderNumber, (item) => item.orderNumber === orderA.orderNumber],
    ["customer email", "beta.orders@example.com", (item) => item._id === orderB._id],
    ["customer name", "Alpha", (item) => item._id === orderA._id],
  ];
  for (const [label, query, matches] of searches) {
    res = await request(
      `/api/admin/orders?q=${encodeURIComponent(query)}&pageSize=50`,
      { cookie },
    );
    body = await res.json();
    check(
      `search by ${label} finds the order`,
      res.status === 200 && body.data.items.some(matches),
    );
  }

  // 5. Status + payment status filters.
  res = await request(`/api/admin/orders?status=pending&pageSize=50`, { cookie });
  body = await res.json();
  check(
    "status=pending filter",
    res.status === 200 &&
      body.data.items.some((item) => item._id === orderA._id) &&
      body.data.items.every((item) => item.status === "pending"),
  );

  res = await request(
    `/api/admin/orders?paymentStatus=unpaid&pageSize=50`,
    { cookie },
  );
  body = await res.json();
  check(
    "paymentStatus=unpaid filter",
    res.status === 200 &&
      body.data.items.some((item) => item._id === orderB._id) &&
      body.data.items.every((item) => item.paymentStatus === "unpaid"),
  );

  // 6. Invalid filter values are ignored gracefully; invalid dates rejected.
  res = await request(`/api/admin/orders?status=bogus`, { cookie });
  check("invalid status filter ignored -> 200", res.status === 200);

  const now = new Date();
  const yesterday = new Date(now.getTime() - 86400000);
  const tomorrow = new Date(now.getTime() + 86400000);
  res = await request(
    `/api/admin/orders?dateFrom=${toDateParam(yesterday)}&dateTo=${toDateParam(tomorrow)}&pageSize=50`,
    { cookie },
  );
  body = await res.json();
  check(
    "date range includes today's orders",
    res.status === 200 &&
      body.data.items.some((item) => item._id === orderA._id),
  );

  res = await request(
    `/api/admin/orders?dateFrom=2020-01-01&dateTo=2020-01-02`,
    { cookie },
  );
  body = await res.json();
  check(
    "date range before order excludes order",
    res.status === 200 &&
      !body.data.items.some((item) => item._id === orderA._id),
  );

  res = await request(`/api/admin/orders?dateFrom=12-34-56`, { cookie });
  check("invalid dateFrom -> 400", res.status === 400);
  res = await request(
    `/api/admin/orders?dateFrom=${toDateParam(tomorrow)}&dateTo=${toDateParam(yesterday)}`,
    { cookie },
  );
  check("dateFrom after dateTo -> 400", res.status === 400);

  // 7. Order detail.
  res = await request(`/api/admin/orders/${orderA._id}`, { cookie });
  check("order detail -> 200", res.status === 200);
  body = await res.json();
  const detail = body.data;
  check(
    "detail exposes customer/shipping/items/totals",
    detail.customer.email === "alpha.orders@example.com" &&
      detail.shippingAddress.city === "Portland" &&
      detail.items.length === 1 &&
      detail.items[0].productName === product.name &&
      detail.items[0].unitPriceCents === unitPrice &&
      detail.items[0].lineTotalCents === unitPrice &&
      detail.items[0].modelNames.length > 0 &&
      typeof detail.subtotalCents === "number" &&
      typeof detail.shippingCents === "number" &&
      typeof detail.totalCents === "number",
  );
  check("detail does not expose accessCode", detail.accessCode === undefined);

  res = await request(`/api/admin/orders/nope`, { cookie });
  check("detail invalid id -> 400", res.status === 400);
  res = await request(
    `/api/admin/orders/000000000000000000000000`,
    { cookie },
  );
  check("detail unknown order -> 404", res.status === 404);

  // 8. Status transition rules.
  res = await request(`/api/admin/orders/${orderA._id}`, {
    method: "PATCH",
    cookie,
    body: { status: "shipped" },
  });
  body = await res.json();
  check(
    "PATCH invalid status value -> 400",
    res.status === 400 && Boolean(body.error.fieldErrors?.status),
  );

  res = await request(`/api/admin/orders/${orderA._id}`, {
    method: "PATCH",
    cookie,
    body: { status: "pending" },
  });
  body = await res.json();
  check(
    "PATCH same status -> 400",
    res.status === 400 && Boolean(body.error.fieldErrors?.status),
  );

  res = await request(`/api/admin/orders/${orderA._id}`, {
    method: "PATCH",
    cookie,
    body: { status: "cancelled" },
  });
  body = await res.json();
  check(
    "PATCH pending -> cancelled -> 200",
    res.status === 200 && body.data.status === "cancelled",
  );

  res = await request(`/api/admin/orders/${orderA._id}`, {
    method: "PATCH",
    cookie,
    body: { status: "confirmed" },
  });
  body = await res.json();
  check(
    "PATCH cancelled (terminal) -> 400",
    res.status === 400 && Boolean(body.error.fieldErrors?.status),
  );

  // 9. Confirm order B, then pay it, then try to cancel the paid order.
  res = await request(`/api/admin/orders/${orderB._id}`, {
    method: "PATCH",
    cookie,
    body: { status: "confirmed" },
  });
  body = await res.json();
  check(
    "PATCH pending -> confirmed -> 200",
    res.status === 200 && body.data.status === "confirmed",
  );

  res = await request(`/api/admin/orders/${orderB._id}`, {
    method: "PATCH",
    cookie,
    body: { status: "pending" },
  });
  body = await res.json();
  check(
    "PATCH confirmed -> pending -> 400",
    res.status === 400 && Boolean(body.error.fieldErrors?.status),
  );

  res = await request("/api/payments", {
    method: "POST",
    body: { orderId: orderB._id, accessCode: orderB.accessCode },
  });
  check("initiate payment -> 200", res.status === 200);
  res = await request("/api/payments/verify", {
    method: "POST",
    body: { orderId: orderB._id, accessCode: orderB.accessCode },
  });
  body = await res.json();
  check(
    "verify payment marks order paid",
    res.status === 200 && body.data.orderPaid === true,
  );

  res = await request(`/api/admin/orders/${orderB._id}`, {
    method: "PATCH",
    cookie,
    body: { status: "cancelled" },
  });
  body = await res.json();
  check(
    "PATCH paid order -> cancelled -> 400",
    res.status === 400 && Boolean(body.error.fieldErrors?.status),
  );

  res = await request(
    `/api/admin/orders?paymentStatus=paid&pageSize=50`,
    { cookie },
  );
  body = await res.json();
  check(
    "paymentStatus=paid filter finds order B",
    res.status === 200 &&
      body.data.items.some((item) => item._id === orderB._id),
  );

  // 10. Historical snapshots and totals stay untouched by status updates.
  const snapA = await db.collection("orders").findOne({ _id: new ObjectId(orderA._id) });
  const snapB = await db.collection("orders").findOne({ _id: new ObjectId(orderB._id) });
  check(
    "snapshots preserved for cancelled order A",
    snapA.items[0].unitPriceCents === orderA.items[0].unitPriceCents &&
      snapA.items[0].lineTotalCents === orderA.items[0].lineTotalCents &&
      snapA.items[0].productName === orderA.items[0].productName &&
      snapA.subtotalCents === orderA.subtotalCents &&
      snapA.shippingCents === orderA.shippingCents &&
      snapA.totalCents === orderA.totalCents &&
      snapA.items[0].modelNames.length === orderA.items[0].modelNames.length,
  );
  check(
    "snapshots preserved for confirmed/paid order B",
    snapB.items[0].unitPriceCents === orderB.items[0].unitPriceCents &&
      snapB.totalCents === orderB.totalCents &&
      snapB.status === "confirmed",
  );

  // 11. Unauthorized mutation rejected.
  res = await request(`/api/admin/orders/${orderA._id}`, {
    method: "PATCH",
    body: { status: "confirmed" },
  });
  check("unauthenticated status update -> 401", res.status === 401);

  // 12. DB-backed change is visible in the list API.
  res = await request(
    `/api/admin/orders?q=${encodeURIComponent(orderB.orderNumber)}`,
    { cookie },
  );
  body = await res.json();
  check(
    "list reflects confirmed order B",
    res.status === 200 &&
      body.data.items.length === 1 &&
      body.data.items[0].status === "confirmed",
  );

  // 13. Admin page renders + auth redirect.
  res = await request("/admin/orders", { cookie });
  check("admin orders page renders", res.status === 200);
  const html = await res.text();
  check(
    "admin orders page shows management UI",
    html.includes("Orders") && html.includes("Search"),
  );
  res = await fetch(`${BASE}/admin/orders`, { redirect: "manual" });
  check("admin orders page without session -> redirect", [307, 308].includes(res.status));
} finally {
  if (client) {
    try {
      const db = client.db(dbName);
      const orderIds = orders.map((order) => order._id);
      await db.collection("payment_requests").deleteMany({ orderId: { $in: orderIds } });
      await db.collection("orders").deleteMany({ _id: { $in: orderIds } });
      const product = await db
        .collection("products")
        .findOne({ slug: "silicone-case-iphone-15", status: "active" });
      if (product) {
        await db
          .collection("inventory")
          .updateOne({ productId: product._id }, { $set: { quantity: originalQty } });
      }
      await client.close();
    } catch {
      // Best-effort cleanup.
    }
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
assert.equal(failed, 0);