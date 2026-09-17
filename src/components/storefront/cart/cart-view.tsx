"use client";

import { useCallback, useState } from "react";
import type { CartState } from "@/lib/storefront/cart";
import { CartList } from "./cart-list";
import { CartSummary } from "./cart-summary";
import { CartEmpty } from "./cart-empty";

type CartViewProps = {
  initialCart: CartState;
};

type ApiShape = {
  ok?: boolean;
  data?: CartState;
  error?: { message?: string };
};

export function CartView({ initialCart }: CartViewProps) {
  const [cart, setCart] = useState(initialCart);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (
      method: "PATCH" | "DELETE",
      body: Record<string, unknown>,
    ): Promise<boolean> => {
      setError(null);
      try {
        const response = await fetch("/api/cart", {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const payload = (await response.json()) as ApiShape;
        if (!response.ok || payload.ok === false || !payload.data) {
          setError(
            payload.error?.message ??
              "We couldn't update your cart. Please try again.",
          );
          return false;
        }
        setCart(payload.data);
        return true;
      } catch {
        setError("Something went wrong. Please try again.");
        return false;
      }
    },
    [],
  );

  const handleUpdateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      setBusyId(productId);
      try {
        await mutate("PATCH", { productId, quantity });
      } finally {
        setBusyId(null);
      }
    },
    [mutate],
  );

  const handleRemove = useCallback(
    async (productId: string) => {
      setBusyId(productId);
      try {
        await mutate("DELETE", { productId });
      } finally {
        setBusyId(null);
      }
    },
    [mutate],
  );

  if (cart.items.length === 0) {
    return <CartEmpty />;
  }

  return (
    <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive lg:col-span-2"
        >
          {error}
        </div>
      ) : null}

      <CartList
        items={cart.items}
        busyId={busyId}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemove}
      />

      <CartSummary cart={cart} />
    </div>
  );
}