"use client";

import { ButtonLink } from "@/components/ui/button";
import { CartItemRow } from "./cart-item";
import type { CartItem } from "@/lib/storefront/cart";

type CartListProps = {
  items: CartItem[];
  busyId: string | null;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
};

export function CartList({
  items,
  busyId,
  onUpdateQuantity,
  onRemove,
}: CartListProps) {
  if (items.length === 0) return null;

  return (
    <div>
      <ul className="divide-y divide-border rounded-2xl border border-border bg-card shadow-sm">
        {items.map((item) => (
          <li key={item.productId}>
            <CartItemRow
              item={item}
              busy={busyId === item.productId}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
            />
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center justify-between gap-4">
        <ButtonLink href="/products" variant="outline" size="md">
          <span aria-hidden="true">&#8592;</span> Continue Shopping
        </ButtonLink>
        <p className="hidden text-xs text-muted-foreground sm:block">
          Prices are recalculated from live inventory at checkout.
        </p>
      </div>
    </div>
  );
}