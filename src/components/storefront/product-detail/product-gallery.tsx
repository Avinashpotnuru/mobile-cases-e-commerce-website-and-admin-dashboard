"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/components/ui/cn";
import {
  PRODUCT_VIEWS,
  ProductView,
} from "./product-visuals";

type ProductGalleryProps = {
  images: string[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);

  const hasRealImages = images.length > 0;

  if (!hasRealImages) {
    const view = (PRODUCT_VIEWS[selected] ?? PRODUCT_VIEWS[0]).id;
    const currentLabel =
      PRODUCT_VIEWS[selected]?.label ?? PRODUCT_VIEWS[0].label;

    return (
      <div>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card via-muted/10 to-card shadow-sm">
          <div className="mx-auto aspect-[4/5] w-full max-w-lg p-5 sm:aspect-square sm:p-6">
            <div key={view} className="hero-rise h-full w-full">
              <ProductView view={view} className="h-full w-full" />
            </div>
          </div>

          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-foreground uppercase backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {currentLabel}
          </div>
          <div className="absolute right-4 bottom-4 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-[11px] font-medium text-muted-foreground tabular-nums backdrop-blur-sm">
            {selected + 1} / {PRODUCT_VIEWS.length}
          </div>
        </div>

        <div
          className="mt-4 grid grid-cols-5 gap-3"
          role="group"
          aria-label="Product views from different angles"
        >
          {PRODUCT_VIEWS.map((v, i) => (
            <button
              key={v.id}
              type="button"
              aria-label={`${v.label} view, image ${i + 1} of ${PRODUCT_VIEWS.length}`}
              aria-pressed={i === selected}
              onClick={() => setSelected(i)}
              className={cn(
                "group aspect-[4/5] overflow-hidden rounded-xl border-2 bg-card transition-all duration-300",
                i === selected
                  ? "border-accent shadow-md ring-2 ring-accent/20"
                  : "border-border hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-sm",
              )}
            >
              <ProductView
                view={v.id}
                className="h-full w-full transition-transform duration-300 group-hover:scale-[1.06]"
              />
            </button>
          ))}
        </div>

        <p className="mt-3 text-center text-[11px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
          Front &middot; Back &middot; Side &middot; Top &middot; Camera
        </p>
      </div>
    );
  }

  const current = images[selected] ?? images[0];
  const hasMultiple = images.length > 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/20 shadow-sm">
        <div className="relative aspect-square w-full">
          <Image
            key={current}
            src={current}
            alt={`${productName} — image ${selected + 1}`}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="hero-rise object-contain p-6"
          />
        </div>
        <div className="absolute right-4 bottom-4 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-[11px] font-medium text-muted-foreground tabular-nums backdrop-blur-sm">
          {selected + 1} / {images.length}
        </div>
      </div>

      {hasMultiple ? (
        <div
          className="grid grid-cols-5 gap-3"
          role="group"
          aria-label="Product images"
        >
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Show image ${i + 1} of ${images.length}`}
              aria-pressed={i === selected}
              onClick={() => setSelected(i)}
              className={cn(
                "relative aspect-[4/5] overflow-hidden rounded-xl border-2 bg-card transition-all duration-300",
                i === selected
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