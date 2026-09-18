import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { MongoClient, ObjectId } from "mongodb";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const uri = process.env.MONGODB_URI ?? "";
const dbName = process.env.MONGODB_DB ?? "mobile-cases-ecommerce";
const secret = process.env.DUMMY_WEBHOOK_SECRET ?? "";

if (!uri || !secret) {
  throw new Error(
    "MONGODB_URI and DUMMY_WEBHOOK_SECRET required (run with --env-file=.env.local)",
  );
}

const client = new MongoClient(uri);
await client.connect();
const db = client.db(dbName);
const orders = db.collection("orders");
const payments = db.collection("payment_requests");

const orderIds = [new ObjectId(), new ObjectId()];
const TEST_KEY = `payment-dummy-${String(Date.now())}`;
const accessCode = "a".repeat(32);
const insertOrder = (_id) =>
  orders.insertOne({
    _id,
    orderNumber: `MC-TEST-${String(Date.now())}`,
    idempotencyKey: `${TEST_KEY}-${_id.toHexString()}`,
    accessCode,
    status: "pending",
    paymentStatus: "unpaid",
    totalCents: 5499,
    currency: "eur",
    updatedAt: new Date(),
    createdAt: new Date(),
  });

function post(path, body) {
  return fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const sign = (rawBody) =>
  `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
const postWebhook = (body, signature) =>
  fetch(`${BASE}/api/payments/webhook`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-payment-signature": signature,
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
  const [orderA, orderB] = orderIds;
  await insertOrder(orderA);
  await insertOrder(orderB);

  // 1-4. Input validation + order ownership.
  let res = await post("/api/payments", {});
  check("missing orderId -> 400", res.status === 400);
  res = await post("/api/payments", { orderId: "nope" });
  check("missing accessCode -> 400", res.status === 400);
  res = await post("/api/payments", { orderId: "nope", accessCode });
  check("invalid orderId -> 400", res.status === 400);
  res = await post("/api/payments", { orderId: new ObjectId().toHexString(), accessCode });
  check("unknown order -> 404", res.status === 404);
  res = await post("/api/payments", { orderId: orderA.toHexString(), accessCode: "wrong" });
  check("too-short accessCode -> 400", res.status === 400);
  res = await post("/api/payments", { orderId: orderA.toHexString(), accessCode: "b".repeat(32) });
  check("wrong accessCode -> 404", res.status === 404);
  res = await post("/api/payments/verify", { orderId: orderB.toHexString(), accessCode });
  check("verify without record -> 404", res.status === 404);

  // 5. Initiate -> pending, client-safe only, amount from DB.
  res = await post("/api/payments", { orderId: orderA.toHexString(), accessCode });
  const initiate = await res.json();
  check("initiate -> 200", res.status === 200);
  check(
    "payment id is dummy_ prefixed",
    typeof initiate?.data?.payment?.paymentId === "string" &&
      initiate.data.payment.paymentId.startsWith("dummy_"),
  );
  check(
    "initiate returns verified amount from DB",
    initiate.data.payment.amountCents === 5499 &&
      initiate.data.payment.currency === "eur",
  );
  check(
    "initiate returns no secrets",
    !JSON.stringify(initiate).includes(secret),
  );
  const providerPaymentId = initiate.data.payment.paymentId;
  const record = await payments.findOne({ orderId: orderA });
  check(
    "payment record persisted with pending status",
    record?.providerPaymentId === providerPaymentId && record?.status === "pending",
  );

  // 6. Server-side verify -> payment succeeded, order marked paid.
  res = await post("/api/payments/verify", { orderId: orderA.toHexString(), accessCode });
  const verify = await res.json();
  check(
    "verify -> succeeded + order paid",
    verify.data.paymentStatus === "succeeded" && verify.data.orderPaid === true,
  );
  const paidOrder = await orders.findOne({ _id: orderA });
  check("order paymentStatus -> paid", paidOrder.paymentStatus === "paid");
  check("order status unchanged (separate lives)", paidOrder.status === "pending");

  // 7. Idempotent re-verification -> no double update.
  res = await post("/api/payments/verify", { orderId: orderA.toHexString(), accessCode });
  const verifyAgain = await res.json();
  check(
    "re-verify idempotent (no further order update)",
    verifyAgain.data.orderPaid === false,
  );

  // 8. A paid order cannot be re-initiated (record-level guard).
  res = await post("/api/payments", { orderId: orderA.toHexString(), accessCode });
  check("re-initiate paid order -> 409", res.status === 409);

  // 9. Webhook with bad signature -> 400.
  res = await postWebhook({ providerPaymentId, status: "succeeded" }, "sha256=deadbeef");
  check("invalid webhook signature -> 400", res.status === 400);

  // 10. Valid webhook for a failed payment -> record failed, order stays unpaid.
  const failedRecordId = new ObjectId();
  await payments.insertOne({
    _id: failedRecordId,
    orderId: orderB,
    provider: "dummy",
    providerPaymentId: `dummy_failed_${TEST_KEY}`,
    amountCents: 5499,
    currency: "eur",
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const failedEvent = JSON.stringify({
    providerPaymentId: `dummy_failed_${TEST_KEY}`,
    status: "failed",
  });
  res = await fetch(`${BASE}/api/payments/webhook`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-payment-signature": sign(failedEvent),
    },
    body: failedEvent,
  });
  check("valid failed webhook -> 200", res.status === 200);
  const failedRecord = await payments.findOne({ _id: failedRecordId });
  const failedOrder = await orders.findOne({ _id: orderB });
  check("failed webhook -> record failed", failedRecord.status === "failed");
  check("failed webhook -> order still unpaid", failedOrder.paymentStatus === "unpaid");
} finally {
  await payments.deleteMany({ orderId: { $in: orderIds } });
  await orders.deleteMany({ _id: { $in: orderIds } });
  await client.close();
}

console.log(`\n${passed} passed, ${failed} failed`);
assert.equal(failed, 0);