"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  countWishlist,
  WISHLIST_CHANGE_EVENT,
} from "@/lib/storefront/wishlist";

export function useWishlistCount(): number {
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(countWishlist());
    const id = window.setTimeout(sync, 0);
    window.addEventListener(WISHLIST_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener(WISHLIST_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [pathname]);

  return count;
}