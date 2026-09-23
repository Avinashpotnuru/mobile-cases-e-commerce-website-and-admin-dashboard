import {
  handleApiError,
  ok,
  parseJsonBody,
} from "@/lib/api";
import { getCoupon, validateCoupon } from "@/lib/services/coupon-service";
import { ValidationError } from "@/lib/services/errors";

export async function POST(request: Request) {
  try {
    const body = (await parseJsonBody(request)) as Record<string, unknown>;
    const code =
      typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
    const subtotalCents = body.subtotalCents;

    const fieldErrors: Record<string, string> = {};
    if (!code) {
      fieldErrors.code = "Enter a coupon code.";
    }
    if (
      typeof subtotalCents !== "number" ||
      !Number.isInteger(subtotalCents) ||
      subtotalCents < 0 ||
      !Number.isSafeInteger(subtotalCents)
    ) {
      fieldErrors.subtotalCents =
        "subtotalCents must be a non-negative integer.";
    }
    if (Object.keys(fieldErrors).length > 0) {
      throw new ValidationError(fieldErrors);
    }

    const coupon = await getCoupon(code);
    const discountCents = validateCoupon(coupon, subtotalCents as number);

    return ok({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountCents,
    });
  } catch (error) {
    return handleApiError(error);
  }
}