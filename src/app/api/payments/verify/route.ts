import type { NextRequest } from "next/server";
import { handleApiError, ok, parseJsonBody } from "@/lib/api";
import { verifyOrderPayment } from "@/lib/payments/payment-service";
import { ValidationError } from "@/lib/services/errors";
import { collectFieldErrors } from "@/lib/validation";

function validatePaymentInput(body: Record<string, unknown> | null): {
  orderId: string;
  accessCode: string;
} {
  const orderId = body?.orderId;
  const accessCode = body?.accessCode;
  const fieldErrors = collectFieldErrors([
    [
      "orderId",
      typeof orderId === "string" && orderId.trim().length > 0
        ? null
        : "Invalid order id.",
    ],
    [
      "accessCode",
      typeof accessCode === "string" && accessCode.trim().length >= 16
        ? null
        : "Invalid order access code.",
    ],
  ]);
  if (fieldErrors) {
    throw new ValidationError(fieldErrors);
  }
  return {
    orderId: orderId as string,
    accessCode: accessCode as string,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await parseJsonBody(request)) as Record<
      string,
      unknown
    > | null;
    const { orderId, accessCode } = validatePaymentInput(body);
    const verification = await verifyOrderPayment(orderId, accessCode);
    return ok(verification);
  } catch (error) {
    return handleApiError(error, { method: request.method, url: request.url });
  }
}