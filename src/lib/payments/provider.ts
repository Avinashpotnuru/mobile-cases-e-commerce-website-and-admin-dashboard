import type {
  InitiatePaymentParams,
  PaymentInitiation,
  PaymentVerification,
  PaymentWebhookContext,
  PaymentWebhookEvent,
} from "./types";
import { NoopPaymentProvider } from "./providers/noop";
import { DummyPaymentProvider } from "./providers/dummy";

export interface PaymentProvider {
  readonly id: string;
  initiate(params: InitiatePaymentParams): Promise<PaymentInitiation>;
  verify(
    providerPaymentId: string,
    expected?: { amountCents: number; currency: string },
  ): Promise<PaymentVerification>;
  verifyWebhook(
    context: PaymentWebhookContext,
  ): Promise<PaymentWebhookEvent | null>;
}

export function getPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER?.trim().toLowerCase();
  if (!provider || provider === "noop") {
    return new NoopPaymentProvider();
  }
  if (provider === "dummy") {
    return new DummyPaymentProvider();
  }
  throw new Error(
    `Unknown PAYMENT_PROVIDER "${provider}". Configure one in environment variables.`,
  );
}