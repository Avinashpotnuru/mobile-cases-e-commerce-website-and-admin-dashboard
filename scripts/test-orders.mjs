// Focused integration tests for Order Creation (Step 18).
// Prerequisites:
//   1. Seeded database  ->  `$env:SEED_CONFIRM=1` then `npm run db:seed`
//   2. App running       ->  `npm run start` (or `dev`) on http://localhost:3000
// Run:  `npm run test:orders`
import assert from "node:assert/strict";
import { MongoClient, ObjectId } from "mongodb";

const BASE = "http://localhost:3000";
const dbName = process.env.MONGODB_DB ?? "mobile-cases-ecommerce";
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is required (load .env.local).");
}

const TEST_KEYS = [
  "order-create-success-cf8a",
  "order-create-retry-cf8a",
];

const FORM = {
  email: "pat@example.com",
  firstName: "Pat",
  lastName: "Test",
  phone: "+15550001111",
  addressLine1: "1 Main Street",
  addressLine2: "Apt 2B",
  city: "Portland",
  region: "OR",
  postalCode: "97202",
  country: "US",
  deliveryMethod: "standard",
};

const cookify = (lines) => `cart=${encodeURIComponent(JSON.stringify(lines))}`;
const postOrder = (cookie, idempotencyKey) =>
  fetch(`${BASE}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ ...FORM, idempotencyKey }),
  });

let client;
let originalQty = 0;
const results = [];
const report = (name) => {
  results.push(name);
  console.log(`\u2713 ${name}`);
};

try {
  client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  await db
    .collection("orders")
    .createIndex({ idempotencyKey: 1 }, { unique: true });

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

  // 1) Invalid product -> valid ObjectId that does not exist.
  {
    const fakeId = new ObjectId().toHexString();
    const response = await postOrder(cookify([{ productId: fakeId, quantity: 1 }]), TEST_KEYS[0]);
    const body = await response.json();
    assert.equal(response.status, 404, "invalid product should 404");
    assert.equal(body.ok, false);
    report("invalid product rejected (404)");
  }

  // 2) Insufficient inventory -> requested quantity exceeds stock.
  {
    const response = await postOrder(cookify([{ productId, quantity: 99 }]), TEST_KEYS[0]);
    const body = await response.json();
    assert.equal(response.status, 400, "oversell should 400");
    assert.equal(body.ok, false);
    assert.ok(body.error.fieldErrors.items, "expected an items field error");
    const after = await db.collection("inventory").findOne({ productId: product._id });
    assert.equal(after.quantity, originalQty, "stock must not change on failure");
    report("insufficient inventory rejected (400)");
  }

  // 3) Successful order creation with server-calculated totals.
  let createdOrder;
  {
    const cookie = cookify([{ productId, quantity: 2 }]);
    const response = await postOrder(cookie, TEST_KEYS[0]);
    const body = await response.json();
    assert.equal(response.status, 200, `unexpected status: ${response.status}`);
    assert.ok(body.ok, JSON.stringify(body));
    const order = body.data.order;
    createdOrder = order;
    assert.ok(order._id, "order id missing");
    assert.match(order.accessCode, /^[0-9a-f]{32}$/, "access code missing");
    assert.match(order.orderNumber, /^MC-/);
    assert.equal(order.idempotencyKey, TEST_KEYS[0]);

    const expectedSubtotal = unitPrice * 2;
    const expectedShipping = expectedSubtotal >= 5000 ? 0 : 499;
    assert.equal(order.subtotalCents, expectedSubtotal);
    assert.equal(order.shippingCents, expectedShipping);
    assert.equal(order.totalCents, expectedSubtotal + expectedShipping);

    assert.equal(order.items.length, 1);
    assert.equal(order.items[0].productId, productId);
    assert.equal(order.items[0].productName, product.name);
    assert.equal(order.items[0].unitPriceCents, unitPrice);
    assert.equal(order.items[0].lineTotalCents, unitPrice * 2);
    assert.equal(order.items[0].quantity, 2);
    assert.ok(order.items[0].modelNames.length > 0, "model snapshot missing");

    assert.equal(order.status, "pending");
    assert.equal(order.paymentStatus, "unpaid");
    assert.equal(order.customer.email, FORM.email);
    assert.ok(order.createdAt);
    assert.ok(order.delivery.method === "standard");
    assert.ok(response.headers.get("set-cookie")?.includes("cart="), "cart cookie not cleared");
    report("successful order created (snapshot + totals)");
  }

  // 4) Inventory was decremented exactly once.
  {
    const after = await db.collection("inventory").findOne({ productId: product._id });
    assert.equal(after.quantity, originalQty - 2, "inventory must drop by ordered qty");
    report("inventory decremented by ordered quantity");
  }

  // 5) Idempotent retry returns the same order without double-charging stock.
  {
    const cookie = cookify([{ productId, quantity: 2 }]);
    const response = await postOrder(cookie, TEST_KEYS[0]);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(body.data.duplicate, true);
    assert.equal(body.data.order._id, createdOrder._id, "retry must return the same order");
    const after = await db.collection("inventory").findOne({ productId: product._id });
    assert.equal(after.quantity, originalQty - 2, "retry must not decrement again");
    report("idempotent retry returns same order (no double decrement)");
  }

  console.log(`\nAll ${results.length} order tests passed.`);
} finally {
  if (client) {
    try {
      const db = client.db(dbName);
      await db.collection("orders").deleteMany({
        idempotencyKey: { $in: TEST_KEYS },
      });
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
      // Cleanup best-effort; the test results above already reported.
    }
  }
}