import Image from "next/image";
import Link from "next/link";
import { cn } from "@/components/ui/cn";
import { formatPrice } from "@/components/storefront/home/price";
import type { ListingProduct, ProductAvailability } from "@/lib/storefront/product-listing";

const availabilityStyles: Record<ProductAvailability, string> = {
  in_stock: "border-success/30 bg-success/10 text-success",
  low_stock: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  out_of_stock: "border-border bg-muted text-muted-foreground",
};

const availabilityLabels: Record<ProductAvailability, string> = {
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
};

function PhoneSilhouette() {
  return (
    <div className="relative flex h-full items-center justify-center">
      <div
        aria-hidden="true"
        className="absolute h-28 w-28 rounded-full bg-amber-500/10 blur-2xl"
      />
      <div className="relative block h-32 w-16 rounded-2xl border-2 border-accent/30 bg-gradient-to-b from-accent/10 to-transparent shadow-sm sm:h-36 sm:w-[4.5rem]">
        <div className="absolute top-2 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full border border-accent/40 bg-accent/20" />
        <div className="absolute inset-x-1.5 bottom-1.5 top-5 rounded-lg bg-muted/60" />
      </div>
    </div>
  );
}

export function ProductCard({ product }: { product: ListingProduct }) {
  const soldOut = product.availability === "out_of_stock";

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg">
      <Link
        href={`/products/${product.slug}`}
        className="flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="relative h-44 overflow-hidden border-b border-border/60 bg-gradient-to-b from-muted/70 to-muted/20 sm:h-52">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <PhoneSilhouette />
          )}
          {soldOut ? (
            <span className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[2px]">
              <span className="rounded-full bg-foreground/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-background">
                Sold out
              </span>
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <span
            className={cn(
              "inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
              availabilityStyles[product.availability],
            )}
          >
            {availabilityLabels[product.availability]}
          </span>
          <h2 className="mt-3 font-display text-xl font-medium text-card-foreground transition-colors duration-300 group-hover:text-accent">
            {product.name}
          </h2>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
          <p className="mt-auto pt-4 text-base font-semibold text-foreground">
            {formatPrice(product)}
          </p>
        </div>
      </Link>
    </article>
  );
}