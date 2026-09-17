// End-to-end Brand & Mobile Model management tests (Step: Catalog management).
// Prerequisites: app running on http://localhost:3000, ADMIN_* env set.
// Run: `node --env-file=.env.local scripts/verify-catalog.mjs`
import assert from "node:assert/strict";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const USERNAME = process.env.ADMIN_USERNAME ?? "";
const PASSWORD = process.env.ADMIN_TEST_PASSWORD ?? "";
if (!USERNAME || !PASSWORD) {
  throw new Error("ADMIN_USERNAME and ADMIN_TEST_PASSWORD are required.");
}

const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
const brandName = `QA Brand ${stamp}`;
const brandSlug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const modelName = `QA Model ${stamp}`;
const modelSlug = modelName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

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

const brand = { name: brandName };
const model = { brandId: "", name: modelName };

try {
  let res = await request("/api/admin/brands");
  check("unauthenticated brands list -> 401", res.status === 401);
  res = await request("/api/admin/mobile-models");
  check("unauthenticated models list -> 401", res.status === 401);

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

  res = await request("/api/admin/brands?page=1&pageSize=5", { cookie });
  check("brands list -> 200", res.status === 200);
  let body = await res.json();
  assert.equal(body.ok, true);
  assert.ok(Array.isArray(body.data.items), "brands items is array");
  check(
    "brands list shape",
    typeof body.data.total === "number" &&
      typeof body.data.totalPages === "number" &&
      body.data.page === 1 &&
      body.data.pageSize === 5,
  );
  check(
    "brands default (active only)",
    body.data.items.every((item) => item.status === "active"),
  );
  check(
    "brands default pageSize 20",
    (await (await request("/api/admin/brands", { cookie })).json()).data
      .pageSize === 20,
  );

  res = await request("/api/admin/brands?includeArchived=true&pageSize=100", {
    cookie,
  });
  assert.equal(res.status, 200);
  check("brands includeArchived flag accepted", true);

  res = await request("/api/admin/brands?pageSize=999", { cookie });
  body = await res.json();
  check(
    "brands oversized pageSize clamps to 100",
    res.status === 200 && body.data.pageSize === 100,
  );

  res = await request("/api/admin/brands", {
    method: "POST",
    body: { name: brandName },
    cookie,
  });
  check("create brand -> 201", res.status === 201);
  body = await res.json();
  assert.equal(body.ok, true);
  const createdBrand = body.data;
  brand.id = createdBrand._id;
  brand.slug = createdBrand.slug;
  brand.status = createdBrand.status;
  check("created brand auto-slug", createdBrand.slug === brandSlug);
  check("created brand defaults to active", createdBrand.status === "active");

  res = await request("/api/admin/brands", {
    method: "POST",
    body: { name: brandName },
    cookie,
  });
  body = await res.json();
  check(
    "duplicate brand -> 400 fieldErrors",
    res.status === 400 && Boolean(body.error.fieldErrors?.slug) && Boolean(body.error.fieldErrors?.name),
  );

  res = await request("/api/admin/brands", {
    method: "POST",
    body: { slug: "Bad Slug!" },
    cookie,
  });
  body = await res.json();
  check(
    "brand with bad slug -> 400 fieldErrors.slug",
    res.status === 400 && Boolean(body.error.fieldErrors?.slug),
  );

  res = await request(`/api/admin/brands?search=${encodeURIComponent(brandSlug.slice(0, 10))}`, {
    cookie,
  });
  body = await res.json();
  check(
    "brands search finds created brand",
    res.status === 200 &&
      body.data.items.some((item) => item._id === createdBrand._id),
  );

  res = await request(`/api/admin/brands?status=archived`, { cookie });
  body = await res.json();
  check(
    "brands status=archived excludes active created brand",
    res.status === 200 &&
      body.data.items.every((item) => item.status === "archived") &&
      !body.data.items.some((item) => item._id === createdBrand._id),
  );

  res = await request(`/api/brands`);
  body = await res.json();
  const storeBrands = body.data?.items ?? [];
  check(
    "storefront lists new active brand",
    storeBrands.some((item) => item.slug === brandSlug),
  );

  res = await request(`/api/admin/brands/${brand.id}`, {
    method: "PATCH",
    body: { name: `${brandName} Updated`, description: "Created by QA verification." },
    cookie,
  });
  check("update brand -> 200", res.status === 200);
  body = await res.json();
  check(
    "updated brand reflects rename + description",
    body.ok === true &&
      body.data.name === `${brandName} Updated` &&
      body.data.description === "Created by QA verification.",
  );

  res = await request("/api/admin/mobile-models?page=1&pageSize=5", { cookie });
  check("models list -> 200", res.status === 200);
  body = await res.json();
  assert.equal(body.ok, true);
  assert.ok(Array.isArray(body.data.items), "models items is array");
  check(
    "models list shape",
    typeof body.data.total === "number" &&
      body.data.page === 1 &&
      body.data.pageSize === 5,
  );

  res = await request("/api/admin/mobile-models", {
    method: "POST",
    body: { brandId: "not-an-objectid", name: modelName },
    cookie,
  });
  body = await res.json();
  check(
    "model with invalid brandId -> 400 fieldErrors.brandId",
    res.status === 400 && Boolean(body.error.fieldErrors?.brandId),
  );

  res = await request("/api/admin/mobile-models", {
    method: "POST",
    body: { brandId: brand.id },
    cookie,
  });
  body = await res.json();
  check("model without name -> 400 fieldErrors.name", res.status === 400 && Boolean(body.error.fieldErrors?.name));

  res = await request("/api/admin/mobile-models", {
    method: "POST",
    body: { brandId: brand.id, name: modelName },
    cookie,
  });
  check("create model -> 201", res.status === 201);
  body = await res.json();
  assert.equal(body.ok, true);
  const createdModel = body.data;
  model.id = createdModel._id;
  model.slug = createdModel.slug;
  check("created model links to brand", createdModel.brandId === brand.id);
  check("created model auto-slug", createdModel.slug === modelSlug);
  check("created model defaults to active", createdModel.status === "active");

  res = await request(`/api/admin/mobile-models?brandId=${brand.id}`, { cookie });
  body = await res.json();
  check(
    "models filtered by brandId",
    res.status === 200 &&
      body.data.items.some((item) => item._id === createdModel._id) &&
      body.data.items.every((item) => item.brandId === brand.id),
  );

  res = await request(`/api/admin/mobile-models?search=${encodeURIComponent(modelSlug.slice(0, 10))}`, {
    cookie,
  });
  body = await res.json();
  check(
    "models search finds created model",
    res.status === 200 &&
      body.data.items.some((item) => item._id === createdModel._id),
  );

  res = await request(`/api/brands/${brandSlug}/models`, {});
  body = await res.json();
  const storeModels = body.data?.items ?? [];
  check(
    "storefront lists new active model under brand",
    res.status === 200 &&
      storeModels.some((item) => item.slug === modelSlug),
  );

  res = await request(`/api/admin/mobile-models/${model.id}`, {
    method: "DELETE",
    cookie,
  });
  body = await res.json();
  check("archive model -> 200 status archived", res.status === 200 && body.ok && body.data.status === "archived");

  res = await request("/api/admin/mobile-models", { cookie });
  body = await res.json();
  check(
    "models default list excludes archived model",
    body.ok === true &&
      !body.data.items.some((item) => item._id === createdModel._id),
  );

  res = await request(`/api/admin/brands/${brand.id}`, { method: "DELETE", cookie });
  body = await res.json();
  check("archive brand -> 200 status archived", res.status === 200 && body.ok && body.data.status === "archived");

  res = await request("/api/admin/brands", { cookie });
  body = await res.json();
  check(
    "brands default list excludes archived brand",
    body.ok === true && !body.data.items.some((item) => item._id === brand.id),
  );

  res = await request("/api/admin/brands", { cookie });
  body = await res.json();
  check(
    "archived brand visible with includeArchived",
    (await (await request(`/api/admin/brands?includeArchived=true&pageSize=100`, { cookie })).json()).data.items.some((item) => item._id === brand.id),
  );

  res = await request("/admin/brands", { cookie });
  check("admin brands page renders", res.status === 200);
  const html = await res.text();
  check(
    "admin brands page shows management UI",
    html.includes("Add brand") && html.includes("Manage the manufacturers"),
  );

  res = await request("/admin/models", { cookie });
  check("admin models page renders", res.status === 200);
  const modelHtml = await res.text();
  check(
    "admin models page shows management UI",
    modelHtml.includes("Add model") && modelHtml.includes("grouped by brand"),
  );
} finally {
  // Cleanup handled by archiving inside the test; no admin account is created here.
}

console.log(`\n${passed} passed, ${failed} failed`);
assert.equal(failed, 0);