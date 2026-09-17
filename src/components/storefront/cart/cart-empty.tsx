"use client";

import { ButtonLink } from "@/components/ui/button";

function BagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M6 8 4.5 20a1.5 1.5 0 0 0 1.5 1.6h12a1.5 1.5 0 0 0 1.5-1.6L18 8" />
      <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      <path d="M9.5 11v2M14.5 11v2" />
    </svg>
  );
}

export function CartEmpty() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-accent/25 bg-accent/10">
        <BagIcon className="h-9 w-9 text-accent" />
      </div>
      <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight text-foreground">
        Your cart is empty
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        You haven&apos;t added any cases yet. Browse the collection and find a
        case that fits your device perfectly.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/products" size="lg" className="btn-sheen">
          Start Shopping
        </ButtonLink>
        <ButtonLink href="/brands" variant="outline" size="lg">
          Browse by Brand
        </ButtonLink>
      </div>
    </div>
  );
}