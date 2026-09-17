"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/components/ui/cn";
import { formatPrice } from "@/components/storefront/home/price";
import { CartQuantity } from "./cart-quantity";
import type { CartItem } from "@/lib/storefront/cart";

type CartItemRowProps = {
  item: CartItem;
  busy: boolean;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
};

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M6 7l1 12h10l1-12" />
      <path d="M10 11v5M14 11v5" />
    </svg>
  );
}

function PhoneGlyph() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="relative h-[62%] w-[34%] rounded-[1.1rem] border-2 border-border/70 bg-gradient-to-b from-muted/80 to-muted/40">
        <div className="absolute top-[6%] left-1/2 h-[2px] w-[26%] -translate-x-1/2 rounded-full bg-border/50" />
        <div className="absolute bottom-[5%] left-1/2 h-[2px] w-[30%] -translate-x-1/2 rounded-full bg-border/40" />
      </div>
    </div>
  );
}

export function CartItemRow({
  item,
  busy,
  onUpdateQuantity,
  onRemove,
}: CartItemRowProps) {
  const modelLabel = item.modelNames.slice(0, 2).join(" \u00B7 ");

  return (
    <div
      className={cn(
        "flex flex-col gap-4 p-5 transition-opacity sm:flex-row sm:items-center",
        busy && "pointer-events-none opacity-60",
      )}
    >
      <Link
        href={`/products/${item.slug}`}
        aria-label={item.name}
        className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/20 transition-colors hover:border-accent/40"
      >
        {item.image ? (
          <Image
            src={item.image}
            alt=""
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : (
          <PhoneGlyph />
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/products/${item.slug}`}
              className="text-sm font-semibold text-foreground transition-colors hover:text-accent"
            >
              {item.name}
            </Link>
            {modelLabel ? (
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                Fits {modelLabel}
              </p>
            ) : null}
            {item.inStock && item.lowStock ? (
              <p className="mt-1 text-xs font-medium text-amber-700">
                Only {item.availableQuantity} left in stock
              </p>
            ) : null}
            {!item.inStock ? (
              <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Out of stock — remove to continue
              </p>
            ) : null}
          </div>
          <p className="font-display text-base font-semibold text-foreground tabular-nums">
            {formatPrice({
              priceCents: item.priceCents,
              currency: item.currency,
            })}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <CartQuantity
            value={item.quantity}
            max={item.availableQuantity}
            disabled={!item.inStock || busy}
            label={item.name}
            onDecrease={() => onUpdateQuantity(item.productId, item.quantity - 1)}
            onIncrease={() => onUpdateQuantity(item.productId, item.quantity + 1)}
          />

          <div className="flex items-center gap-4">
            {item.inStock ? (
              <p className="text-sm text-muted-foreground">
                Subtotal:{" "}
                <span className="font-semibold text-foreground tabular-nums">
                  {formatPrice({
                    priceCents: item.lineTotalCents,
                    currency: item.currency,
                  })}
                </span>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Unavailable</p>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => onRemove(item.productId)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <TrashIcon className="h-4 w-4" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}