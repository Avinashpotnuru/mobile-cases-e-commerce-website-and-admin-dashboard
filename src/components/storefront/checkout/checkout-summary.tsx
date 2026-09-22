"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/components/ui/cn";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/components/storefront/home/price";
import type { CartState } from "@/lib/storefront/cart";
import type { CheckoutCosts } from "@/lib/storefront/checkout";

type CheckoutSummaryProps = {
  cart: CartState;
  costs: CheckoutCosts;
  submitting: boolean;
  verified: boolean;
};

function MiniPhoneGlyph() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="relative h-[58%] w-[36%] rounded-md border-2 border-border/70 bg-gradient-to-b from-muted/80 to-muted/40">
        <div className="absolute top-[8%] left-1/2 h-[2px] w-[30%] -translate-x-1/2 rounded-full bg-border/50" />
      </div>
    </div>
  );
}

export function CheckoutSummary({
  cart,
  costs,
  submitting,
  verified,
}: CheckoutSummaryProps) {
  const availableItems = cart.items.filter((item) => item.inStock);
  const excludedOutOfStock = cart.items.length - availableItems.length > 0;
  const suffix = costs.itemCount === 1 ? "" : "s";

  return (
    <aside className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:sticky lg:top-24">
      <p className="text-[11px] font-bold tracking-[0.28em] text-accent uppercase">
        Order summary
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
        Your items
      </h2>

      <ul className="mt-4 divide-y divide-border">
        {availableItems.map((item) => (
          <li key={item.productId} className="flex items-center gap-3 py-3">
            <Link
              href={`/products/${item.slug}`}
              aria-label={item.name}
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/20 transition-colors hover:border-accent/40"
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                <MiniPhoneGlyph />
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {item.name}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Qty {item.quantity}
              </p>
            </div>
            <p className="text-sm font-semibold text-foreground tabular-nums">
              {formatPrice({
                priceCents: item.lineTotalCents,
                currency: item.currency,
              })}
            </p>
          </li>
        ))}
      </ul>

      {excludedOutOfStock ? (
        <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
          Some items in your cart are out of stock and are not included.
        </p>
      ) : null}

      <dl className="mt-4 space-y-2.5 border-t border-border pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Item{suffix} subtotal</dt>
          <dd className="font-medium text-foreground tabular-nums">
            {formatPrice({
              priceCents: costs.subtotalCents,
              currency: costs.currency,
            })}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Delivery</dt>
          <dd
            className={cn(
              "font-medium tabular-nums",
              costs.shippingFree && "text-success",
            )}
          >
            {costs.shippingFree
              ? "Free"
              : formatPrice({
                  priceCents: costs.shippingCents,
                  currency: costs.currency,
                })}
          </dd>
        </div>
        <div className="flex justify-between border-t border-border pt-3">
          <dt className="font-semibold text-foreground">Total</dt>
          <dd className="font-display text-xl font-semibold text-foreground tabular-nums">
            {formatPrice({
              priceCents: costs.totalCents,
              currency: costs.currency,
            })}
          </dd>
        </div>
      </dl>

      <div className="mt-6">
        {verified ? (
          <p
            role="status"
            className="mb-3 rounded-lg border border-success/30 bg-success/5 px-3 py-2 text-xs font-medium text-success"
          >
            Details verified {"\u2014"} prices, stock and totals were
            reconfirmed on the server.
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          loading={submitting}
          className="btn-sheen w-full"
        >
          {verified ? "Place order" : "Continue to Payment"}
        </Button>

        <Link
          href="/cart"
          className="mt-3 block text-center text-xs font-medium text-muted-foreground transition-colors hover:text-accent"
        >
          Edit items in your cart
        </Link>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5"
            aria-hidden
          >
            <rect x="4.5" y="10.5" width="15" height="10" rx="1.5" />
            <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
          </svg>
          Secure checkout {"\u00B7"} Prices and totals verified on the server
        </p>
      </div>
    </aside>
  );
}