import type { NextRequest, NextResponse } from "next/server";
import { handleApiError, ok, parseJsonBody } from "@/lib/api";
import {
  CART_COOKIE,
  addCartItem,
  loadCartState,
  parseCartCookie,
  removeCartItem,
  serializeCartCookie,
  updateCartItemQuantity,
  type CartLineInput,
  type CartState,
} from "@/lib/storefront/cart";

const CART_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function readLines(request: NextRequest): CartLineInput[] {
  return parseCartCookie(request.cookies.get(CART_COOKIE)?.value);
}

function respond(cart: CartState, lines: CartLineInput[]): NextResponse {
  const response = ok(cart);
  response.cookies.set(CART_COOKIE, serializeCartCookie(lines), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: CART_MAX_AGE_SECONDS,
  });
  return response;
}

export async function GET(request: NextRequest) {
  try {
    const cart = await loadCartState(readLines(request));
    return ok(cart);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await parseJsonBody(request)) as
      | { productId?: unknown; quantity?: unknown }
      | null;
    const lines = await addCartItem(readLines(request), {
      productId: body?.productId,
      quantity: body?.quantity,
    });
    const cart = await loadCartState(lines);
    return respond(cart, lines);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await parseJsonBody(request)) as
      | { productId?: unknown; quantity?: unknown }
      | null;
    const lines = await updateCartItemQuantity(readLines(request), {
      productId: body?.productId,
      quantity: body?.quantity,
    });
    const cart = await loadCartState(lines);
    return respond(cart, lines);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = (await parseJsonBody(request)) as
      | { productId?: unknown }
      | null;
    const productId =
      typeof body?.productId === "string" ? body.productId : "";
    const lines = removeCartItem(readLines(request), productId);
    const cart = await loadCartState(lines);
    return respond(cart, lines);
  } catch (error) {
    return handleApiError(error);
  }
}
