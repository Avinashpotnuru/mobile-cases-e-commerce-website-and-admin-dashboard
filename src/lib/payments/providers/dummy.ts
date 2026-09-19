import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import { PaymentProviderError } from "@/lib/services/errors";
import type { PaymentProvider } from "../provider";
import type {
  PaymentInitiation,
  PaymentVerification,
  PaymentWebhookContext,
  PaymentWebhookEvent,
} from "../types";

const SIGNATURE_PREFIX = "sha256=";

function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.DUMMY_WEBHOOK_SECRET;
  if (!secret || typeof signature !== "string") {
    return false;
  }
  if (!signature.startsWith(SIGNATURE_PREFIX)) {
    return false;
  }
  const provided = Buffer.from(signature.slice(SIGNATURE_PREFIX.length), "hex");
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  return (
    provided.length === expected.length &&
    timingSafeEqual(provided, expected)
  );
}

type DummyWebhookPayload = {
  providerPaymentId: string;
  status: string;
};

/**
 * Test-only provider. Never use in production - it always succeeds and never
 * moves money. It exists to exercise the full payment flow (initiate,
 * server-side verify, signed webhooks) without a real gateway.
 */
export class DummyPaymentProvider implements PaymentProvider {
  readonly id = "dummy";

  async initiate(): Promise<PaymentInitiation> {
    const providerPaymentId = `dummy_${randomBytes(12).toString("hex")}`;
    return {
      providerPaymentId,
      clientToken: null,
      clientUrl: null,
      status: "pending",
    };
  }

  async verify(
    providerPaymentId: string,
    expected?: { amountCents: number; currency: string },
  ): Promise<PaymentVerification> {
    const mode = process.env.DUMMY_PAYMENT_STATUS ?? "succeeded";
    return {
      providerPaymentId,
      amountCents: expected?.amountCents ?? 0,
      currency: expected?.currency ?? "INR",
      status: mode === "failed" ? "failed" : "succeeded",
    };
  }

  async verifyWebhook(
    context: PaymentWebhookContext,
  ): Promise<PaymentWebhookEvent | null> {
    if (!verifySignature(context.rawBody, context.signature)) {
      throw new PaymentProviderError(
        400,
        "INVALID_WEBHOOK_SIGNATURE",
        "Webhook signature verification failed.",
      );
    }
    let payload: DummyWebhookPayload;
    try {
      payload = JSON.parse(context.rawBody) as DummyWebhookPayload;
    } catch {
      throw new PaymentProviderError(
        400,
        "INVALID_WEBHOOK",
        "Malformed webhook payload.",
      );
    }
    if (
      typeof payload.providerPaymentId !== "string" ||
      typeof payload.status !== "string"
    ) {
      throw new PaymentProviderError(
        400,
        "INVALID_WEBHOOK",
        "Malformed webhook payload.",
      );
    }
    if (
      payload.status !== "succeeded" &&
      payload.status !== "failed" &&
      payload.status !== "cancelled" &&
      payload.status !== "pending"
    ) {
      throw new PaymentProviderError(
        400,
        "INVALID_WEBHOOK",
        "Unknown webhook status.",
      );
    }
    return {
      providerPaymentId: payload.providerPaymentId,
      status: payload.status,
    };
  }
}