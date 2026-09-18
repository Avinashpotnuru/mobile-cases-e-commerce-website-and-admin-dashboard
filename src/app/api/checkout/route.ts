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
import { ValidationError } from "@/lib/services/errors";

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

    const costs = computeCheckoutCosts(cart);
    return ok({ cart, costs });
  } catch (error) {
    return handleApiError(error, { method: request.method, url: request.url });
  }
}