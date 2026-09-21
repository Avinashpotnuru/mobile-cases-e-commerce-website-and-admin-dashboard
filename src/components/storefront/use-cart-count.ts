"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CART_COOKIE } from "@/lib/storefront/cart-constants";

export const CART_CHANGE_EVENT = "cart:change";

function readCartCount(): number {
  if (typeof document === "undefined") return 0;
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CART_COOKIE}=`));
  if (!match) return 0;
  const raw = match.slice(CART_COOKIE.length + 1);
  try {
    const lines: unknown = JSON.parse(decodeURIComponent(raw));
    if (!Array.isArray(lines)) return 0;
    return lines.reduce<number>((total, line) => {
      if (typeof line !== "object" || line === null) return total;
      const quantity = (line as { quantity?: unknown }).quantity;
      if (typeof quantity !== "number") return total;
      return total + (Number.isInteger(quantity) ? quantity : 0);
    }, 0);
  } catch {
    return 0;
  }
}

export function useCartCount(): number {
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(readCartCount());
    sync();
    window.addEventListener(CART_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [pathname]);

  return count;
}

export function notifyCartChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CART_CHANGE_EVENT));
}
