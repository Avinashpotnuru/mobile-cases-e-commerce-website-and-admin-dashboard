"use client";

import { cn } from "@/components/ui/cn";
import { ButtonLink } from "@/components/ui/button";
import { formatPrice } from "@/components/storefront/home/price";
import type { CartState } from "@/lib/storefront/cart";
import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  SHIPPING_FEE_CENTS,
} from "@/lib/storefront/cart-constants";

export function CartSummary({ cart }: { cart: CartState }) {
  const itemCount = cart.itemCount;
  const subtotalCents = cart.subtotalCents;
  const deliveryFree = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS;
  const deliveryCents = deliveryFree ? 0 : SHIPPING_FEE_CENTS;
  const totalCents = subtotalCents + deliveryCents;
  const checkoutReady = itemCount > 0;
  const currency = cart.currency ?? "INR";

  return (
    <aside className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:sticky lg:top-24">
      <p className="text-[11px] font-bold tracking-[0.28em] text-accent uppercase">
        Order summary
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
        Price details
      </h2>

      <dl className="mt-5 space-y-2.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">
            Item{subtotalCents === 0 && itemCount > 0 ? "" : "s"} subtotal
          </dt>
          <dd className="font-medium text-foreground tabular-nums">
            {formatPrice({ priceCents: subtotalCents, currency })}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Delivery</dt>
          <dd
            className={cn(
              "font-medium tabular-nums",
              deliveryFree && "text-success",
            )}
          >
            {deliveryFree
              ? "Free"
              : formatPrice({ priceCents: deliveryCents, currency })}
          </dd>
        </div>
        {!deliveryFree ? (
          <p className="text-[11px] leading-snug text-muted-foreground">
            Add another{" "}
            {formatPrice({
              priceCents: FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents,
              currency,
            })}{" "}
            to unlock free delivery.
          </p>
        ) : null}
        <div className="flex justify-between border-t border-border pt-3">
          <dt className="font-semibold text-foreground">Total</dt>
          <dd className="font-display text-xl font-semibold text-foreground tabular-nums">
            {formatPrice({ priceCents: totalCents, currency })}
          </dd>
        </div>
      </dl>

      <div className="mt-6">
        {checkoutReady ? (
          <ButtonLink
            href="/checkout"
            size="lg"
            className="btn-sheen w-full"
          >
            Proceed to Checkout
          </ButtonLink>
        ) : (
          <p className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-center text-xs text-muted-foreground">
            Add an in-stock item to continue to checkout.
          </p>
        )}
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Secure checkout · Prices and totals verified on the server.
        </p>
      </div>
    </aside>
  );
}