import { PaymentNotConfiguredError } from "@/lib/services/errors";
import type { PaymentProvider } from "../provider";
import type { PaymentInitiation, PaymentVerification, PaymentWebhookEvent } from "../types";

function unavailable(method: string): never {
  throw new PaymentNotConfiguredError(
    `Payment ${method} is unavailable: no payment provider is configured.`,
  );
}

export class NoopPaymentProvider implements PaymentProvider {
  readonly id = "noop";

  initiate(): Promise<PaymentInitiation> {
    return unavailable("initiation");
  }

  verify(): Promise<PaymentVerification> {
    return unavailable("verification");
  }

  verifyWebhook(): Promise<PaymentWebhookEvent | null> {
    return unavailable("webhook");
  }
}