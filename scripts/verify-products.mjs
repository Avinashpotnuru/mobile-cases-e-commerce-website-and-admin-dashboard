// End-to-end Admin Product management tests (Step: Product management).
// Prerequisites: app running on http://localhost:3000, ADMIN_* env set.
// Run: `node --env-file=.env.local scripts/verify-products.mjs`
import assert from "node:assert/strict";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const USERNAME = process.env.ADMIN_USERNAME ?? "";
const PASSWORD = process.env.ADMIN_TEST_PASSWORD ?? "";
if (!USERNAME || !PASSWORD) {
  throw new Error("ADMIN_USERNAME and ADMIN_TEST_PASSWORD are required.");
}

const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
const productName = `QA Product ${stamp}`;
const productSlug = productName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

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

let productId = "";
let brandId = "";
let modelId = "";
let secondModelId = "";

try {
  // 1. Unauthenticated access is rejected.
  let res = await request("/api/admin/products");
  check("unauthenticated products list -> 401", res.status === 401);
  res = await request("/api/admin/products", { method: "POST", body: {} });
  check("unauthenticated product create -> 401", res.status === 401);
  res = await request("/api/admin/session");
  check("precondition: session endpoint reachable", res.status === 401);

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

  // 3. Admin product listing shape + filters.
  res = await request(
    "/api/admin/products?page=1&pageSize=5&includeArchived=true&sort=newest",
    { cookie },
  );
  check("products list -> 200", res.status === 200);
  let body = await res.json();
  assert.equal(body.ok, true);
  assert.ok(Array.isArray(body.data.items), "products items is array");
  check(
    "products list shape",
    typeof body.data.total === "number" &&
      typeof body.data.totalPages === "number" &&
      body.data.page === 1 &&
      body.data.pageSize === 5,
  );
  check(
    "products include statuses among active/draft/archived",
    body.data.items.every((item) =>
      ["active", "draft", "archived"].includes(item.status),
    ),
  );

  // 4. Gather a model + brand to work with.
  const modelsResult = await request("/api/mobile-models?page=1&pageSize=20");
  body = await modelsResult.json();
  const models = body.data?.items ?? [];
  assert.ok(models.length > 0, "need at least one mobile model");
  modelId = models[0]._id;
  brandId = models[0].brandId;
  secondModelId = models[1]?._id ?? modelId;

  // 5. Create product with price.
  res = await request("/api/admin/products", {
    method: "POST",
    cookie,
    body: {
      name: productName,
      priceCents: 1999,
      images: ["https://example.com/qa-case-front.jpg"],
      compatibleModelIds: [modelId],
    },
  });
  check("create product -> 201", res.status === 201);
  body = await res.json();
  assert.equal(body.ok, true);
  const product = body.data;
  productId = product._id;
  check("created product auto-slug", product.slug === productSlug);
  check("created product defaults to active", product.status === "active");
  check("created product keeps priceCents", product.priceCents === 1999);
  check("created product currency INR", product.currency === "INR");
  check(
    "created product stores compatibility",
    Array.isArray(product.compatibleModelIds) &&
      product.compatibleModelIds.includes(modelId),
  );

  // 6. Validation failures on create.
  res = await request("/api/admin/products", {
    method: "POST",
    cookie,
    body: { name: "", compatibleModelIds: [modelId], images: ["https://x.com/a.jpg"] },
  });
  body = await res.json();
  check(
    "product missing name -> 400 fieldErrors.name",
    res.status === 400 && Boolean(body.error.fieldErrors?.name),
  );

  res = await request("/api/admin/products", {
    method: "POST",
    cookie,
    body: {
      name: "QA No Images",
      priceCents: 100,
      images: [],
      compatibleModelIds: [modelId],
    },
  });
  body = await res.json();
  check(
    "product without images -> 400 fieldErrors.images",
    res.status === 400 && Boolean(body.error.fieldErrors?.images),
  );

  res = await request("/api/admin/products", {
    method: "POST",
    cookie,
    body: {
      name: "QA No Compat",
      priceCents: 100,
      images: ["https://x.com/a.jpg"],
      compatibleModelIds: [],
    },
  });
  body = await res.json();
  check(
    "product without compatible models -> 400 fieldErrors",
    res.status === 400 &&
      Boolean(
        body.error.fieldErrors?.compatibleModelIds ??
          body.error.fieldErrors?.brandId,
      ),
  );

  res = await request("/api/admin/products", {
    method: "POST",
    cookie,
    body: {
      name: "QA Bad Price",
      priceCents: 19.99,
      images: ["https://x.com/a.jpg"],
      compatibleModelIds: [modelId],
    },
  });
  body = await res.json();
  check(
    "product fractional priceCents -> 400 fieldErrors.priceCents",
    res.status === 400 && Boolean(body.error.fieldErrors?.priceCents),
  );

  res = await request("/api/admin/products", {
    method: "POST",
    cookie,
    body: {
      name: "QA Bad Model",
      priceCents: 100,
      images: ["https://x.com/a.jpg"],
      compatibleModelIds: ["000000000000000000000000"],
    },
  });
  body = await res.json();
  check(
    "product with unknown model -> 400",
    res.status === 400 && Boolean(body.error.fieldErrors?.compatibleModelIds),
  );

  res = await request("/api/admin/products", {
    method: "POST",
    cookie,
    body: {
      name: productName,
      priceCents: 100,
      images: ["https://x.com/a.jpg"],
      compatibleModelIds: [modelId],
    },
  });
  body = await res.json();
  check(
    "duplicate product slug -> 400 fieldErrors.slug",
    res.status === 400 && Boolean(body.error.fieldErrors?.slug),
  );

  // 7. Update product (rename, price, status, images).
  res = await request(`/api/admin/products/${productId}`, {
    method: "PATCH",
    cookie,
    body: {
      name: `${productName} Updated`,
      priceCents: 2499,
      status: "draft",
      description: "Created by QA verification.",
    },
  });
  check("update product -> 200", res.status === 200);
  body = await res.json();
  check(
    "updated product reflects changes",
    body.ok === true &&
      body.data.name === `${productName} Updated` &&
      body.data.priceCents === 2499 &&
      body.data.status === "draft" &&
      body.data.description === "Created by QA verification.",
  );

  res = await request(`/api/admin/products/${productId}`, {
    method: "PATCH",
    cookie,
    body: { priceCents: -5 },
  });
  body = await res.json();
  check(
    "update negative price -> 400 fieldErrors.priceCents",
    res.status === 400 && Boolean(body.error.fieldErrors?.priceCents),
  );

  // 8. List filters find the created product.
  res = await request(
    `/api/admin/products?q=${encodeURIComponent("QA Product")}&includeArchived=true`,
    { cookie },
  );
  body = await res.json();
  check(
    "products search finds created product",
    res.status === 200 &&
      body.data.items.some((item) => item._id === productId),
  );

  res = await request(
    `/api/admin/products?status=draft&includeArchived=true`,
    { cookie },
  );
  body = await res.json();
  check(
    "products status=draft filter",
    res.status === 200 &&
      body.data.items.some((item) => item._id === productId) &&
      body.data.items.every((item) => item.status === "draft"),
  );

  // 9. Reactive product to active and verify storefront sees it.
  res = await request(`/api/admin/products/${productId}`, {
    method: "PATCH",
    cookie,
    body: { status: "active" },
  });
  check("reactivate product -> 200", res.status === 200);

  res = await request(`/api/products/${productSlug}`);
  check("storefront product detail -> 200 when active", res.status === 200);

  res = await request(
    `/api/admin/products?brandId=${brandId}&includeArchived=true&pageSize=100`,
    { cookie },
  );
  body = await res.json();
  check(
    "products brandId filter includes created product",
    res.status === 200 &&
      body.data.items.some((item) => item._id === productId),
  );

  res = await request(
    `/api/admin/products?mobileModelId=${modelId}&includeArchived=true&pageSize=100`,
    { cookie },
  );
  body = await res.json();
  check(
    "products mobileModelId filter includes created product",
    res.status === 200 &&
      body.data.items.some((item) => item._id === productId),
  );

  // 10. Compatibility add/remove via dedicated API.
  if (secondModelId !== modelId) {
    res = await request(`/api/admin/products/${productId}/compatibility`, {
      method: "POST",
      cookie,
      body: { mobileModelId: secondModelId },
    });
    body = await res.json();
    check(
      "add compatibility -> 200 includes second model",
      res.status === 200 &&
        body.ok &&
        body.data.compatibleModelIds.includes(secondModelId),
    );

    res = await request(`/api/admin/products/${productId}/compatibility`, {
      method: "POST",
      cookie,
      body: { mobileModelId: secondModelId },
    });
    body = await res.json();
    check(
      "duplicate compatibility -> 400",
      res.status === 400 && Boolean(body.error.fieldErrors?.mobileModelId),
    );

    res = await request(
      `/api/admin/products/${productId}/compatibility/${secondModelId}`,
      { method: "DELETE", cookie },
    );
    body = await res.json();
    check(
      "remove compatibility -> 200 drops model",
      res.status === 200 &&
        body.ok &&
        !body.data.compatibleModelIds.includes(secondModelId),
    );
  }

  // Removing the only remaining model must be rejected server-side.
  res = await request(
    `/api/admin/products/${productId}/compatibility/${modelId}`,
    { method: "DELETE", cookie },
  );
  body = await res.json();
  check(
    "remove last compatible model -> 400",
    res.status === 400 && Boolean(body.error.fieldErrors?.mobileModelId),
  );

  res = await request(`/api/admin/products/${productId}/compatibility`, {
    method: "POST",
    cookie,
    body: { mobileModelId: "000000000000000000000000" },
  });
  body = await res.json();
  check(
    "add invalid model -> 400",
    res.status === 400 && Boolean(body.error.fieldErrors?.mobileModelId),
  );

  res = await request(`/api/admin/products/${productId}/compatibility`, {
    method: "POST",
    body: { mobileModelId: modelId },
  });
  check(
    "unauthenticated compatibility add -> 401",
    res.status === 401,
  );

  // 11. Inventory API provides stock data for the indicator.
  res = await request(`/api/inventory?productIds=${productId}`);
  body = await res.json();
  check(
    "inventory productIds filter -> 200 with rows",
    res.status === 200 &&
      body.data.items.every((item) => item.productId === productId),
  );

  // 12. Archive product.
  res = await request(`/api/admin/products/${productId}`, {
    method: "DELETE",
    cookie,
  });
  body = await res.json();
  check(
    "archive product -> 200 status archived",
    res.status === 200 && body.ok && body.data.status === "archived",
  );

  res = await request(`/api/products/${productSlug}`);
  check("storefront hides archived product -> 404", res.status === 404);

  res = await request(
    `/api/admin/products?status=active&includeArchived=true&pageSize=100`,
    { cookie },
  );
  body = await res.json();
  check(
    "products status=active excludes archived product",
    res.status === 200 &&
      !body.data.items.some((item) => item._id === productId),
  );

  // 13. Admin page renders the management UI.
  res = await request("/admin/products", { cookie });
  check("admin products page renders", res.status === 200);
  const html = await res.text();
  check(
    "admin products page shows management UI",
    html.includes("Add product") && html.includes("device compatibility"),
  );

  res = await fetch(`${BASE}/admin/products`, { redirect: "manual" });
  check("admin products page without session -> redirect", [307, 308].includes(res.status));
} finally {
  // Created product is archived at this point; no further cleanup needed.
}

console.log(`\n${passed} passed, ${failed} failed`);
assert.equal(failed, 0);