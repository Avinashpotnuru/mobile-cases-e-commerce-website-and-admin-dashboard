import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Container } from "@/components/ui/container";
import { CartView } from "@/components/storefront/cart/cart-view";
import {
  CART_COOKIE,
  loadCartState,
  parseCartCookie,
} from "@/lib/storefront/cart";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review the cases in your cart before checking out.",
};

export default async function CartPage() {
  const store = await cookies();
  const cart = await loadCartState(
    parseCartCookie(store.get(CART_COOKIE)?.value),
  );

  return (
    <section className="bg-background pb-24 pt-8">
      <Container>
        <div className="border-b border-border pb-6">
          <p className="text-[11px] font-bold tracking-[0.28em] text-accent uppercase">
            Mobile Cases
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Your Cart
          </h1>
        </div>
        <CartView initialCart={cart} />
      </Container>
    </section>
  );
}