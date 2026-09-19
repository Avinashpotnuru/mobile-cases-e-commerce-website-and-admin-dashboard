import Image from "next/image";
import Link from "next/link";
import { cn } from "@/components/ui/cn";
import { formatPrice } from "@/components/storefront/home/price";
import type { ListingProduct, ProductAvailability } from "@/lib/storefront/product-listing";

const availabilityLabels: Record<ProductAvailability, string> = {
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
};

const availabilityDotStyles: Record<ProductAvailability, string> = {
  in_stock: "bg-success",
  low_stock: "bg-amber-500",
  out_of_stock: "bg-muted-foreground",
};

function HeartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

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

export type ProductCardViewProps = {
  slug: string;
  name: string;
  priceCents: number;
  currency: string;
  image?: string | null;
  availability?: ProductAvailability;
};

export function ProductCardView({
  slug,
  name,
  priceCents,
  currency,
  image,
  availability,
}: ProductCardViewProps) {
  const soldOut = availability === "out_of_stock";
  const href = `/products/${slug}`;

  return (
    <article className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl">
      <Link
        href={href}
        aria-label={`View ${name}`}
        className="relative flex flex-1 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="flex h-44 w-full items-center justify-center pl-14 pr-6 transition-[padding] duration-500 ease-out sm:h-48 lg:pl-6 lg:group-hover:pl-16">
          <div className="flex h-full items-center justify-center transition-transform duration-500 ease-out group-hover:rotate-[30deg]">
            {image ? (
              <Image
                src={image}
                alt={name}
                width={240}
                height={240}
                sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="h-full w-auto object-contain"
              />
            ) : (
              <PhoneSilhouette />
            )}
          </div>
        </div>
        {soldOut ? (
          <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/50">
            <span className="rounded-full bg-foreground/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-background">
              Sold out
            </span>
          </span>
        ) : null}
      </Link>

      <Link
        href={href}
        className="absolute inset-y-0 left-0 z-10 flex w-12 items-center justify-center bg-foreground text-background transition-transform duration-500 ease-out lg:-translate-x-full lg:group-hover:translate-x-0"
      >
        <span className="max-h-[80%] overflow-hidden whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.18em] [writing-mode:vertical-rl] rotate-180">
          {name}
        </span>
      </Link>

      <div className="mt-4 flex w-full items-center justify-between pl-14 transition-[padding] duration-500 ease-out lg:pl-0 lg:group-hover:pl-14">
        <span
          className="text-muted-foreground transition-colors duration-300 group-hover:text-accent"
          aria-hidden="true"
        >
          <HeartIcon />
        </span>
        <div className="text-center">
          <span className="block text-base font-semibold text-foreground">
            {formatPrice({ priceCents, currency })}
          </span>
          {availability ? (
            <span className="mt-1 flex items-center justify-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  availabilityDotStyles[availability],
                )}
              />
              {availabilityLabels[availability]}
            </span>
          ) : null}
        </div>
        <Link
          href={href}
          aria-label={`View ${name}`}
          className="text-muted-foreground transition-colors duration-300 hover:text-accent focus-visible:text-accent focus-visible:outline-none"
        >
          <CartIcon />
        </Link>
      </div>
    </article>
  );
}

export function ProductCard({ product }: { product: ListingProduct }) {
  return (
    <ProductCardView
      slug={product.slug}
      name={product.name}
      priceCents={product.priceCents}
      currency={product.currency}
      image={product.image}
      availability={product.availability}
    />
  );
}
