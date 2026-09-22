import type { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { handleApiError, ok, parseJsonBody } from "@/lib/api";
import { readCustomerSession } from "@/lib/auth/customer";
import { CART_COOKIE, parseCartCookie } from "@/lib/storefront/cart";
import { createOrder } from "@/lib/services/order-service";

export async function POST(request: NextRequest) {
  try {
    const body = (await parseJsonBody(request)) as Record<
      string,
      unknown
    > | null;
    const session = await readCustomerSession();
    const lines = parseCartCookie(request.cookies.get(CART_COOKIE)?.value);
    const result = await createOrder({
      idempotencyKey: body?.idempotencyKey,
      form: body ?? {},
      lines,
      customerId: session
        ? new ObjectId(session.customerId)
        : undefined,
    });

    const response = ok({ order: result.order, duplicate: !result.created });
    // The cart's contents now belong to the order; clear the cookie so they
    // cannot be ordered again.
    response.cookies.set(CART_COOKIE, "", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
    });
    return response;
  } catch (error) {
    return handleApiError(error, { method: request.method, url: request.url });
  }
}