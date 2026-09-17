// End-to-end tests for the Order Confirmation page (Step 20).
// Prerequisites: seeded DB + app running on http://localhost:3000.
// Run: `npm run test:confirmation`
import assert from "node:assert/strict";
import { MongoClient } from "mongodb";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is required (load .env.local).");
}

const TEST_KEY = `order-confirmation-${String(Date.now())}`;
const FORM = {
  email: "pat@example.com",
  firstName: "Pat",
  lastName: "Test",
  phone: "+15550001111",
  addressLine1: "1 Main Street",
  addressLine2: "",
  city: "Portland",
  region: "OR",
  postalCode: "97202",
  country: "US",
  deliveryMethod: "standard",
  idempotencyKey: TEST_KEY,
};

let client;
let orderId;
let accessCode;
let originalQty = 0;

try {
  client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB ?? "mobile-cases-ecommerce");

  const product = await db
    .collection("products")
    .findOne({ slug: "silicone-case-iphone-15", status: "active" });
  assert.ok(product, "Seed product missing - run npm run db:seed first.");
  const inventory = await db
    .collection("inventory")
    .findOne({ productId: product._id });
  originalQty = inventory.quantity;

  const cart = `cart=${encodeURIComponent(
    JSON.stringify([{ productId: product._id.toHexString(), quantity: 1 }]),
  )}`;
  const res = await fetch(`${BASE}/api/orders`, {
    method: "POST",
    headers: { "content-type": "application/json", Cookie: cart },
    body: JSON.stringify(FORM),
  });
  assert.equal(res.status, 200, "order creation should succeed");
  const order = (await res.json()).data.order;
  orderId = order._id;
  accessCode = order.accessCode;

  // 1. Valid access code renders the confirmation.
  const page = await fetch(`${BASE}/order-confirmation/${orderId}?access=${accessCode}`);
  const raw = await page.text();
  const html = raw.replaceAll("<!-- -->", "");
  assert.equal(page.status, 200, "valid access should render the page");
  assert.ok(html.includes(order.orderNumber), "order number must be visible");
  assert.ok(html.includes("Thanks, Pat"), "confirmation greeting must render");
  assert.ok(html.includes("Payment pending"), "pending payment state must show");
  assert.match(html, /name="robots"[^>]*content="[^"]*noindex/, "page must be noindexed");

  // 2. Wrong access code -> 404.
  const denied = await fetch(`${BASE}/order-confirmation/${orderId}?access=${"0".repeat(32)}`);
  assert.equal(denied.status, 404, "wrong access code must not expose the order");

  // 3. Missing access code -> 404.
  const missing = await fetch(`${BASE}/order-confirmation/${orderId}`);
  assert.equal(missing.status, 404, "missing access code must not expose the order");

  console.log("PASS valid access renders confirmation (200, noindex)");
  console.log("PASS wrong access code -> 404");
  console.log("PASS missing access code -> 404");
  console.log("\nAll confirmation tests passed.");
} finally {
  if (client) {
    try {
      const db = client.db(process.env.MONGODB_DB ?? "mobile-cases-ecommerce");
      await db.collection("orders").deleteOne({ idempotencyKey: TEST_KEY });
      const product = await db
        .collection("products")
        .findOne({ slug: "silicone-case-iphone-15", status: "active" });
      if (product) {
        await db.collection("inventory").updateOne(
          { productId: product._id },
          { $set: { quantity: originalQty } },
        );
      }
      await client.close();
    } catch {
      // best-effort cleanup
    }
  }
}