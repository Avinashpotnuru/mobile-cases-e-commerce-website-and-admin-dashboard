"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { WishlistButton } from "@/components/storefront/product-listing/wishlist-button";

type ProductPurchaseProps = {
  productId: string;
  inStock: boolean;
  isLowStock: boolean;
  availableQuantity: number;
  productName: string;
};

export function ProductPurchase({
  productId,
  inStock,
  isLowStock,
  availableQuantity,
  productName,
}: ProductPurchaseProps) {
  const max = Math.max(1, availableQuantity);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddToCart = async () => {
    if (!inStock || adding) return;
    setAdding(true);
    setError(null);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: { message?: string };
      };
      if (!response.ok || payload.ok === false) {
        setError(
          payload.error?.message ?? "Couldn't add this item to your cart.",
        );
        return;
      }
      setAdded(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Availability badge */}
      {!inStock ? (
        <p className="flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-2.5 text-sm font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
          Currently out of stock
        </p>
      ) : isLowStock ? (
        <p className="flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Only {availableQuantity} left — order soon
        </p>
      ) : (
        <p className="flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/20 px-4 py-2.5 text-sm font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Ready to ship
        </p>
      )}

      {/* Quantity */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Quantity
        </span>
        <div
          className={cn(
            "flex h-10 items-center overflow-hidden rounded-lg border border-border",
            !inStock && "opacity-50",
          )}
          role="group"
          aria-label="Quantity"
        >
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={!inStock || quantity <= 1}
            onClick={() => {
              setQuantity((q) => Math.max(1, q - 1));
              setAdded(false);
            }}
            className="flex h-10 w-10 cursor-pointer items-center justify-center border-r border-border text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            &minus;
          </button>
          <span
            aria-live="polite"
            className="flex h-10 w-12 items-center justify-center text-center text-sm font-medium tabular-nums"
          >
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={!inStock || quantity >= max}
            onClick={() => {
              setQuantity((q) => Math.min(max, q + 1));
              setAdded(false);
            }}
            className="flex h-10 w-10 cursor-pointer items-center justify-center border-l border-border text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2.5">
        <Button
          type="button"
          size="lg"
          loading={adding}
          disabled={!inStock}
          onClick={handleAddToCart}
          className={cn(
            "btn-sheen w-full",
            added && "bg-success text-success-foreground",
          )}
        >
          {added ? "Added \u2713" : "Add to Cart"}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="secondary"
          disabled={!inStock}
          className="btn-sheen w-full"
        >
          Buy Now
        </Button>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive"
        >
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-center gap-2.5 border-t border-border pt-4">
        <WishlistButton
          productId={productId}
          productName={productName}
          className="[&_svg]:h-5 [&_svg]:w-5"
        />
        <span className="text-sm text-muted-foreground">
          {added ? "Added to cart" : "Save this case for later"}
        </span>
      </div>

      {/* Screen reader announcement */}
      <p
        aria-live="polite"
        className="sr-only"
      >
        {added ? `${quantity} \u00D7 ${productName} added to cart` : ""}
      </p>
    </div>
  );
}
