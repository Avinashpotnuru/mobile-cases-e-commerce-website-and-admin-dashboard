import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { CheckoutView } from "@/components/storefront/checkout/checkout-view";
import {
  CART_COOKIE,
  loadCartState,
  parseCartCookie,
} from "@/lib/storefront/cart";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your contact, shipping and delivery details.",
};

function CheckoutEmpty() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-accent/25 bg-accent/10">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-9 w-9 text-accent"
          aria-hidden
        >
          <path d="M6 8 4.5 20a1.5 1.5 0 0 0 1.5 1.6h12a1.5 1.5 0 0 0 1.5-1.6L18 8" />
          <path d="M8 8V6a4 4 0 0 1 8 0v2" />
          <path d="M9.5 11v2M14.5 11v2" />
        </svg>
      </div>
      <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight text-foreground">
        Nothing to check out yet
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Your cart needs at least one in-stock item before you can continue.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/cart" size="lg" className="btn-sheen">
          Review your cart
        </ButtonLink>
        <ButtonLink href="/products" variant="outline" size="lg">
          Continue Shopping
        </ButtonLink>
      </div>
    </div>
  );
}

export default async function CheckoutPage() {
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
            Checkout
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Enter your details below. Prices, delivery and totals are verified
            on the server before you continue to payment.
          </p>
        </div>

        {cart.itemCount > 0 ? (
          <CheckoutView initialCart={cart} />
        ) : (
          <CheckoutEmpty />
        )}
      </Container>
    </section>
  );
}