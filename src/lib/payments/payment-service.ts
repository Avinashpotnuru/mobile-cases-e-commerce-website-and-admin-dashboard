import { ObjectId } from "mongodb";
import { getDb } from "@/lib/database";
import {
  PAYMENT_COLLECTION,
  ORDER_COLLECTION,
  type PaymentRecord,
  type PaymentRecordStatus,
} from "@/lib/database/models";
import { getPaymentProvider } from "./provider";
import type {
  PaymentWebhookContext,
  PaymentWebhookEvent,
} from "./types";
import {
  NotFoundError,
  PaymentProviderError,
  ValidationError,
} from "@/lib/services/errors";

function isRecordStatus(value: string): value is PaymentRecordStatus {
  return value === "pending"
    || value === "succeeded"
    || value === "failed"
    || value === "cancelled";
}

async function paymentsCollection() {
  const db = await getDb();
  return db.collection<PaymentRecord>(PAYMENT_COLLECTION);
}

export type ClientSafePayment = {
  paymentId: string;
  clientToken: string | null;
  clientUrl: string | null;
  amountCents: number;
  currency: string;
  status: PaymentRecordStatus;
};

// Step 3-4 of the flow: initiate with the provider, persist the request and
// return only client-safe fields. The amount always comes from the stored
// order - never from the client.
export async function initiateOrderPayment(
  orderId: string,
): Promise<ClientSafePayment> {
  if (!ObjectId.isValid(orderId)) {
    throw new ValidationError({ orderId: "Invalid order id." });
  }
  const objectId = new ObjectId(orderId);
  const db = await getDb();
  const orders = db.collection<{
    _id: ObjectId;
    paymentStatus: string;
    status: string;
    totalCents: number;
    currency: string;
  }>(ORDER_COLLECTION);

  const order = await orders.findOne({ _id: objectId });
  if (!order) {
    throw new NotFoundError("Order");
  }
  if (order.paymentStatus === "paid") {
    throw new PaymentProviderError(
      409,
      "PAYMENT_ALREADY_COMPLETED",
      "This order has already been paid.",
    );
  }
  if (order.status === "cancelled") {
    throw new PaymentProviderError(
      409,
      "ORDER_CANCELLED",
      "This order was cancelled and cannot be paid.",
    );
  }

  const provider = getPaymentProvider();
  const initiation = await provider.initiate({
    orderId: objectId.toHexString(),
    amountCents: order.totalCents,
    currency: order.currency,
  });

  // Persist provider result. Beneficiary/amount is taken from the provider,
  // which we requested server-side with the verified order amount.
  const status: PaymentRecordStatus = isRecordStatus(initiation.status)
    ? initiation.status
    : "pending";
  const records = await paymentsCollection();
  await records.updateOne(
    { orderId: objectId },
    {
      $set: {
        provider: provider.id,
        providerPaymentId: initiation.providerPaymentId,
        amountCents: order.totalCents,
        currency: order.currency,
        status,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        _id: new ObjectId(),
        orderId: objectId,
        createdAt: new Date(),
      },
    },
    { upsert: true },
  );

  return {
    paymentId: initiation.providerPaymentId,
    clientToken: initiation.clientToken,
    clientUrl: initiation.clientUrl,
    amountCents: order.totalCents,
    currency: order.currency,
    status,
  };
}

// Steps 5-6: re-verify with the provider server-side and only then update
// payment/order status. Updates are idempotent - re-verification of a
// succeeded payment never changes anything.
export async function verifyOrderPayment(
  orderId: string,
): Promise<{ paymentStatus: PaymentRecordStatus; orderPaid: boolean }> {
  if (!ObjectId.isValid(orderId)) {
    throw new ValidationError({ orderId: "Invalid order id." });
  }
  const objectId = new ObjectId(orderId);
  const records = await paymentsCollection();
  const record = await records.findOne({ orderId: objectId });
  if (!record) {
    throw new NotFoundError("Payment");
  }

  const provider = getPaymentProvider();
  const verification = await provider.verify(record.providerPaymentId, {
    amountCents: record.amountCents,
    currency: record.currency,
  });

  if (
    verification.amountCents !== record.amountCents ||
    verification.currency !== record.currency
  ) {
    throw new PaymentProviderError(
      409,
      "PAYMENT_AMOUNT_MISMATCH",
      "Verified payment amount does not match the order.",
    );
  }

  const nextStatus: PaymentRecordStatus = isRecordStatus(verification.status)
    ? verification.status
    : "pending";
  await records.updateOne(
    { _id: record._id },
    { $set: { status: nextStatus, updatedAt: new Date() } },
  );

  let orderPaid = false;
  if (nextStatus === "succeeded") {
    // Only a successful server-side verification marks the order as paid.
    const db = await getDb();
    const result = await db
      .collection<{ _id: ObjectId; paymentStatus: string }>(ORDER_COLLECTION)
      .updateOne({ _id: objectId, paymentStatus: { $ne: "paid" } }, {
        $set: { paymentStatus: "paid", updatedAt: new Date() },
      });
    orderPaid = (result.modifiedCount ?? 0) > 0;
  }

  return { paymentStatus: nextStatus, orderPaid };
}

function paymentRecordStatus(
  value: string | undefined,
): PaymentRecordStatus {
  const candidate = value ?? "";
  return isRecordStatus(candidate) ? candidate : "pending";
}

export async function upsertPaymentRecord(
  record: Omit<PaymentRecord, "_id" | "createdAt" | "updatedAt">,
): Promise<void> {
  const records = await paymentsCollection();
  await records.updateOne(
    { providerPaymentId: record.providerPaymentId },
    {
      $set: {
        status: record.status,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        _id: new ObjectId(),
        orderId: record.orderId,
        provider: record.provider,
        providerPaymentId: record.providerPaymentId,
        amountCents: record.amountCents,
        currency: record.currency,
        createdAt: new Date(),
      },
    },
    { upsert: true },
  );
}

// Webhook handling: verify the signature/event with the provider, apply the
// event idempotently, and never trust a client-provided status.
export async function processPaymentWebhook(
  context: PaymentWebhookContext,
): Promise<PaymentWebhookEvent> {
  const provider = getPaymentProvider();
  const event = await provider.verifyWebhook(context);
  if (!event) {
    throw new PaymentProviderError(
      400,
      "INVALID_WEBHOOK",
      "Unrecognized webhook payload or invalid signature.",
    );
  }

  const records = await paymentsCollection();
  const record = await records.findOne({
    providerPaymentId: event.providerPaymentId,
  });
  if (!record) {
    // Unknown payment (e.g., not initiated through this store). Ignore the
    // event rather than failing the whole webhook batch.
    return event;
  }

  if (record.status !== "succeeded" && event.status === "succeeded") {
    await verifyOrderPayment(record.orderId.toHexString());
  } else if (record.status !== event.status) {
    await records.updateOne(
      { _id: record._id },
      { $set: { status: paymentRecordStatus(event.status), updatedAt: new Date() } },
    );
  }

  return event;
}