// End-to-end Admin Authentication tests (Step: Admin Authentication).
// Prerequisites: app running on http://localhost:3000 with ADMIN_* env set.
// Run: `npm run test:admin`
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const USERNAME = process.env.ADMIN_USERNAME ?? "";
const PASSWORD = process.env.ADMIN_TEST_PASSWORD ?? "";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET ?? "";
const HASH = process.env.ADMIN_PASSWORD_HASH ?? "";

if (!USERNAME || !PASSWORD || !SESSION_SECRET || !HASH) {
  throw new Error(
    "ADMIN_TEST_PASSWORD must be the plaintext for ADMIN_PASSWORD_HASH.",
  );
}

const post = (path, body, cookie) =>
  fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
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

try {
  // 1. Unauthenticated admin API -> 401.
  let res = await fetch(`${BASE}/api/admin/session`);
  check("admin API without session -> 401", res.status === 401);

  // 2. Unauthenticated admin page -> redirect to /admin/login.
  res = await fetch(`${BASE}/admin/dashboard`, { redirect: "manual" });
  check("admin page without session -> redirect", [307, 308].includes(res.status));
  const location = res.headers.get("location") ?? "";
  check("redirect targets /admin/login", location.includes("/admin/login"));

  // 3. Wrong password -> 401 and no session cookie.
  res = await post("/api/admin/login", {
    username: USERNAME,
    password: "definitely-wrong",
  });
  check("bad credentials -> 401", res.status === 401);
  check("bad credentials -> no cookie", !(res.headers.get("set-cookie") ?? "").includes("admin_session"));

  // 4. Login with correct credentials -> session cookie.
  res = await post("/api/admin/login", {
    username: USERNAME,
    password: PASSWORD,
  });
  check("valid login -> 200", res.status === 200);
  const setCookie = res.headers.get("set-cookie") ?? "";
  check("valid login -> sets admin_session cookie", setCookie.includes("admin_session="));
  check("cookie is httpOnly", setCookie.toLowerCase().includes("httponly"));
  check("cookie is sameSite=lax", setCookie.toLowerCase().includes("samesite=lax"));
  const sessionValue = setCookie.match(/admin_session=([^;]+)/)?.[1];
  assert.ok(sessionValue, "session cookie value missing");

  // 5. With session -> admin API authorized.
  res = await fetch(`${BASE}/api/admin/session`, {
    headers: { cookie: `admin_session=${sessionValue}` },
  });
  check("admin API with session -> 200", res.status === 200);

  // 6. With session -> admin page renders.
  res = await fetch(`${BASE}/admin/dashboard`, {
    headers: { cookie: `admin_session=${sessionValue}` },
  });
  check("admin page with session -> 200", res.status === 200);

  // 7. Tampered session -> 401 (signature mismatch).
  const hmac = createHmac("sha256", SESSION_SECRET)
    .update("tampered")
    .digest("hex");
  const forged = `tampered.${hmac}`;
  res = await fetch(`${BASE}/api/admin/session`, {
    headers: { cookie: `admin_session=${forged}` },
  });
  check("forged session -> 401", res.status === 401);

  // 8. Logout clears the session -> subsequent call 401.
  res = await post("/api/admin/logout", {}, `admin_session=${sessionValue}`);
  check("logout -> 200", res.status === 200);
  check("logout -> clears cookie", (res.headers.get("set-cookie") ?? "").includes("admin_session=;"));
  res = await fetch(`${BASE}/api/admin/session`, {
    headers: { cookie: `admin_session=${sessionValue}` },
  });
  check("session rejected after logout -> 401", res.status === 401);
} finally {
  // no persistent state to clean up
}

console.log(`\n${passed} passed, ${failed} failed`);
assert.equal(failed, 0);
