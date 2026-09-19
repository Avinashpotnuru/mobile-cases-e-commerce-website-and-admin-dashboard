"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/components/ui/cn";

type ProductGalleryProps = {
  images: string[];
  productName: string;
};

function NoImagesPlaceholder() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center sm:min-h-[480px]">
      <span
        aria-hidden="true"
        className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card text-muted-foreground"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.34-3.34a2 2 0 0 0-2.83 0L5 21" />
        </svg>
      </span>
      <p className="font-display text-base font-medium text-foreground">
        No product images yet
      </p>
      <p className="max-w-xs text-sm text-muted-foreground">
        Photos of this case are not added yet. Check back soon.
      </p>
    </div>
  );
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return <NoImagesPlaceholder />;
  }

  const safeSelected = selected >= images.length ? 0 : selected;
  const current = images[safeSelected] ?? images[0];
  const hasMultiple = images.length > 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/20 shadow-sm">
        <div className="relative aspect-square w-full">
          <Image
            key={current}
            src={current}
            alt={`${productName} — image ${safeSelected + 1}`}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="hero-rise object-contain p-6"
          />
        </div>
        <div className="absolute right-4 bottom-4 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-[11px] font-medium text-muted-foreground tabular-nums backdrop-blur-sm">
          {safeSelected + 1} / {images.length}
        </div>
      </div>

      {hasMultiple ? (
        <div
          className="grid grid-cols-3 gap-3 sm:grid-cols-5"
          role="group"
          aria-label="Product images"
        >
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Show image ${i + 1} of ${images.length}`}
              aria-pressed={i === safeSelected}
              onClick={() => setSelected(i)}
              className={cn(
                "relative aspect-[4/5] overflow-hidden rounded-xl border-2 bg-card transition-all duration-300",
                i === safeSelected
                  ? "border-accent shadow-md ring-2 ring-accent/20"
                  : "border-border hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-sm",
              )}
            >
              <Image src={src} alt="" fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}