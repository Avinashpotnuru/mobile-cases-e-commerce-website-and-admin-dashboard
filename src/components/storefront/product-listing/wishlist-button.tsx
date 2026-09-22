"use client";

import { useEffect, useState } from "react";
import { cn } from "@/components/ui/cn";
import {
  isWishlisted,
  toggleWishlist,
  WISHLIST_CHANGE_EVENT,
} from "@/lib/storefront/wishlist";

function HeartGlyph({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={filled ? "currentColor" : "none"}
      className="h-6 w-6 transition-transform duration-200"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function WishlistButton({
  productId,
  productName,
  className,
}: {
  productId: string;
  productName: string;
  className?: string;
}) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(isWishlisted(productId));
    const id = window.setTimeout(sync, 0);
    window.addEventListener(WISHLIST_CHANGE_EVENT, sync);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener(WISHLIST_CHANGE_EVENT, sync);
    };
  }, [productId]);

  const handleToggle = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (busy) return;
    setBusy(true);
    const nowSaved = toggleWishlist(productId);
    setSaved(nowSaved);
    window.setTimeout(() => setBusy(false), 250);
  };

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={
        saved
          ? `Remove ${productName} from saved cases`
          : `Save ${productName} for later`
      }
      title={saved ? "Remove from saved cases" : "Save for later"}
      onClick={handleToggle}
      className={cn(
        "text-muted-foreground transition-all duration-200 hover:scale-110 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        saved && "scale-110 text-accent",
        busy && "scale-90 opacity-70",
        className,
      )}
    >
      <HeartGlyph filled={saved} />
    </button>
  );
}