import type { NextRequest } from "next/server";
import { handleApiError, ok, parseJsonBody } from "@/lib/api";
import {
  CART_COOKIE,
  loadCartState,
  parseCartCookie,
} from "@/lib/storefront/cart";
import {
  computeCheckoutCosts,
  normalizeCheckoutForm,
  validateCheckoutForm,
} from "@/lib/storefront/checkout";
import { NotFoundError, ValidationError } from "@/lib/services/errors";
import { CouponValidationError } from "@/lib/services/errors";
import { getCoupon, validateCoupon } from "@/lib/services/coupon-service";

export async function POST(request: NextRequest) {
  try {
    const cart = await loadCartState(
      parseCartCookie(request.cookies.get(CART_COOKIE)?.value),
    );

    const body = (await parseJsonBody(request)) as Record<string, unknown> | null;
    const form = normalizeCheckoutForm(body ?? {});
    const fieldErrors = validateCheckoutForm(form);
    if (Object.keys(fieldErrors).length > 0) {
      throw new ValidationError(fieldErrors);
    }

    if (cart.itemCount <= 0) {
      throw new ValidationError({
        cart: "Your cart has no items ready for checkout.",
      });
    }

    const couponCode =
      typeof body?.couponCode === "string" &&
      body.couponCode.trim().length > 0
        ? body.couponCode.trim().toUpperCase()
        : undefined;

    let coupon: { couponCode: string; discountCents: number } | undefined;
    if (couponCode) {
      let couponDoc;
      try {
        couponDoc = await getCoupon(couponCode);
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw new CouponValidationError(
            "This coupon code doesn't exist.",
          );
        }
        throw error;
      }
      const discountCents = validateCoupon(couponDoc, cart.subtotalCents);
      coupon = { couponCode: couponDoc.code, discountCents };
    }

    const costs = computeCheckoutCosts(cart, coupon);
    return ok({ cart, costs });
  } catch (error) {
    return handleApiError(error, { method: request.method, url: request.url });
  }
}