import type { NextRequest } from "next/server";
import { handleApiError, ok, parseJsonBody } from "@/lib/api";
import { initiateOrderPayment } from "@/lib/payments/payment-service";

export async function POST(request: NextRequest) {
  try {
    const body = (await parseJsonBody(request)) as Record<
      string,
      unknown
    > | null;
    const orderId = body?.orderId;
    if (typeof orderId !== "string") {
      return Response.json(
        { ok: false, error: { code: "VALIDATION_ERROR", fields: { orderId: "Invalid order id." } } },
        { status: 400 },
      );
    }
    const payment = await initiateOrderPayment(orderId);
    return ok({ payment });
  } catch (error) {
    return handleApiError(error);
  }
}