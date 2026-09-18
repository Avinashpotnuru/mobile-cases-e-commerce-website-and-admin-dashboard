import type { NextRequest } from "next/server";
import { handleApiError, ok } from "@/lib/api";
import { processPaymentWebhook } from "@/lib/payments/payment-service";

export async function POST(request: NextRequest) {
  try {
    // Signature header names are provider-specific; forward the raw body and
    // any signature so the provider integration can verify it server-side.
    const rawBody = await request.text();
    const signature =
      request.headers.get("x-payment-signature") ??
      request.headers.get("stripe-signature");
    const event = await processPaymentWebhook({ rawBody, signature });
    return ok({ received: event });
  } catch (error) {
    return handleApiError(error, { method: request.method, url: request.url });
  }
}