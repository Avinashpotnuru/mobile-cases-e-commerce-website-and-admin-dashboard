import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/states";
import { formatPrice } from "@/components/storefront/home/price";
import {
  loadProductDetail,
  type CompatibleModel,
} from "@/lib/storefront/product-detail";
import type { ListingProduct } from "@/lib/storefront/product-listing";
import { NotFoundError } from "@/lib/services/errors";
import { ProductGallery } from "./product-gallery";
import { ProductPurchase } from "./product-purchase";
import { cn } from "@/components/ui/cn";

const FREE_SHIPPING_THRESHOLD_CENTS = 5000;
const SHIPPING_FEE_CENTS = 499;

type ProductContentProps = {
  productId: string;
};

export function ProductContent({ productId }: ProductContentProps) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductContentLoaded productId={productId} />
    </Suspense>
  );
}

function ProductDetailSkeleton() {
  return (
    <section className="bg-background pb-24 pt-8">
      <Container className="space-y-10">
        <Skeleton className="h-5 w-48" />
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr_340px]">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-6 py-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-10 w-4/5" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-44 w-full" />
          </div>
          <Skeleton className="aspect-[4/5] w-full rounded-2xl lg:aspect-auto lg:h-96" />
        </div>
      </Container>
    </section>
  );
}

async function ProductContentLoaded({ productId }: ProductContentProps) {
  let result;
  try {
    result = await loadProductDetail(productId);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
  const { product, inStock, lowStock, availableQuantity, models, related } =
    result;
  const brandName = models[0]?.brandName ?? "Mobile Cases";
  const brandSlug = models[0]?.brandSlug ?? "";

  return (
    <section className="bg-background pb-24 pt-8">
      <Container>
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <li>
              <Link href="/" className="transition-colors hover:text-foreground">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-border">
              /
            </li>
            <li>
              <Link
                href="/products"
                className="transition-colors hover:text-foreground"
              >
                Cases
              </Link>
            </li>
            {brandSlug ? (
              <>
                <li aria-hidden="true" className="text-border">
                  /
                </li>
                <li>
                  <Link
                    href={`/products?brand=${brandSlug}`}
                    className="transition-colors hover:text-foreground"
                  >
                    {brandName}
                  </Link>
                </li>
              </>
            ) : null}
            <li aria-hidden="true" className="text-border">
              /
            </li>
            <li aria-current="page" className="text-foreground">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_minmax(0,1fr)_340px] lg:gap-10 xl:gap-12">
          <ProductGallery
            images={result.availableImages}
            productName={product.name}
          />

          <div className="flex flex-col gap-8 py-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-bold tracking-[0.28em] text-accent uppercase">
                  {brandName}
                </p>
                <AvailabilityDot
                  inStock={inStock}
                  isLowStock={lowStock}
                  quantity={availableQuantity}
                />
              </div>
              <h1 className="font-display text-4xl leading-[1.05] font-semibold tracking-tight text-foreground sm:text-5xl">
                {product.name}
              </h1>
            </div>

            <div className="border-l-2 border-accent pl-4">
              <p className="font-display text-3xl font-semibold text-foreground">
                {formatPrice({
                  priceCents: product.priceCents,
                  currency: product.currency,
                })}
                <span className="ml-2 align-middle font-sans text-xs font-normal text-muted-foreground">
                  tax included
                </span>
              </p>
              <p className="mt-1 font-sans text-xs text-muted-foreground">
                MRP inclusive of all taxes
              </p>
            </div>

            {product.description ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            ) : null}

            <Highlights deviceCount={models.length} />

            {models.length > 0 ? <CompatibleModels models={models} /> : null}
          </div>

          <RecapPanel
            productId={product.id}
            priceCents={product.priceCents}
            currency={product.currency}
            inStock={inStock}
            isLowStock={lowStock}
            availableQuantity={availableQuantity}
            productName={product.name}
          />
        </div>

        <div className="mt-16 grid gap-10 border-t border-border pt-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionEyebrow>Details</SectionEyebrow>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
              Crafted to protect, built to last
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Designed with a precise, form-fitting silhouette that keeps your
              device safe without adding bulk. Premium materials, clean lines,
              and a finish that looks as good as it feels.
            </p>
          </div>

          <SpecTable
            product={product}
            brandName={brandName}
            inStock={inStock}
            isLowStock={lowStock}
            quantity={availableQuantity}
            modelNames={models.map((m) => m.name)}
          />
        </div>

        <div className="mt-16 border-t border-border pt-12">
          <SectionEyebrow>Service</SectionEyebrow>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <ServiceCard
              icon={<TruckIcon />}
              title="Free Shipping"
              desc="Complimentary standard shipping on orders over $50. Express options at checkout."
            />
            <ServiceCard
              icon={<ReturnIcon />}
              title="30-Day Returns"
              desc="Changed your mind? Return within 30 days for a full refund — no questions asked."
            />
            <ServiceCard
              icon={<ShieldIcon />}
              title="1-Year Warranty"
              desc="Every case is covered against manufacturing defects for a full year from purchase."
            />
          </div>
        </div>

        {related.length > 0 ? (
          <div className="mt-16 border-t border-border pt-12">
            <div className="flex items-end justify-between gap-4">
              <div>
                <SectionEyebrow>You may also like</SectionEyebrow>
                <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
                  Pairs perfectly with
                </h2>
              </div>
              <Link
                href="/products"
                className="group hidden text-xs font-semibold tracking-wide text-accent uppercase sm:flex sm:items-center sm:gap-1.5"
              >
                View all cases
                <span className="arrow-slide flex">
                  <span className="arrow">→</span>
                </span>
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {related.map((item) => (
                <RelatedCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ) : null}
      </Container>
    </section>
  );
}

function AvailabilityDot({
  inStock,
  isLowStock,
  quantity,
}: {
  inStock: boolean;
  isLowStock: boolean;
  quantity: number;
}) {
  if (!inStock) {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-destructive">
        <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
        Out of stock
      </span>
    );
  }
  if (isLowStock) {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Only {quantity} left
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-success">
      <span className="h-1.5 w-1.5 rounded-full bg-success" />
      In stock
    </span>
  );
}

function Highlights({ deviceCount }: { deviceCount: number }) {
  const items = [
    `Precision fit for ${deviceCount} ${deviceCount === 1 ? "device" : "devices"}`,
    "Free shipping on orders over $50",
    "30-day easy returns",
    "1-year full-coverage warranty",
  ];
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm text-foreground/90">
          <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
            <CheckIcon className="h-3 w-3 text-accent" />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function RecapPanel({
  productId,
  priceCents,
  currency,
  inStock,
  isLowStock,
  availableQuantity,
  productName,
}: {
  productId: string;
  priceCents: number;
  currency: string;
  inStock: boolean;
  isLowStock: boolean;
  availableQuantity: number;
  productName: string;
}) {
  const deliveryLabel = deliveryEstimateLabel();
  const deliveryFree = priceCents >= FREE_SHIPPING_THRESHOLD_CENTS;
  const deliveryFee = deliveryFree ? 0 : SHIPPING_FEE_CENTS;
  const total = priceCents + deliveryFee;

  return (
    <aside className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm lg:sticky lg:top-24">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted">
          <PinIcon className="h-4 w-4 text-foreground" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {deliveryLabel
              ? `Free delivery by ${deliveryLabel}`
              : "Free standard delivery"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Standard shipping · 2–4 business days
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted/20 p-4">
        <p className="text-[11px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
          Price details
        </p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Item price</dt>
            <dd className="font-medium text-foreground tabular-nums">
              {formatPrice({ priceCents, currency })}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Delivery</dt>
            <dd className={cn("font-medium tabular-nums", deliveryFree && "text-success")}>
              {deliveryFree
                ? "Free"
                : formatPrice({ priceCents: deliveryFee, currency })}
            </dd>
          </div>
          {!deliveryFree ? (
            <p className="text-[11px] leading-snug text-muted-foreground">
              Add another{" "}
              {formatPrice({
                priceCents: FREE_SHIPPING_THRESHOLD_CENTS - priceCents,
                currency,
              })}{" "}
              to unlock free delivery.
            </p>
          ) : null}
          <div className="flex justify-between border-t border-border pt-2">
            <dt className="font-semibold text-foreground">Total</dt>
            <dd className="font-display text-lg font-semibold text-foreground tabular-nums">
              {formatPrice({ priceCents: total, currency })}
            </dd>
          </div>
        </dl>
      </div>

      <ProductPurchase
        productId={productId}
        inStock={inStock}
        isLowStock={isLowStock}
        availableQuantity={availableQuantity}
        productName={productName}
      />

      <div className="space-y-2.5 border-t border-border pt-4">
        <TrustIconRow icon={<TruckIcon />} label="Free returns" sub="30-day window" />
        <TrustIconRow icon={<ShieldIcon />} label="Secure checkout" sub="Protected payments" />
      </div>
    </aside>
  );
}

function TrustIconRow({
  icon,
  label,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted">
        {icon}
      </span>
      <div>
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

function deliveryEstimateLabel(): string | null {
  try {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    while (date.getDay() === 0 || date.getDay() === 6) {
      date.setDate(date.getDate() + 1);
    }
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return null;
  }
}

function SpecTable({
  product,
  brandName,
  inStock,
  isLowStock,
  quantity,
  modelNames,
}: {
  product: ListingProduct;
  brandName: string;
  inStock: boolean;
  isLowStock: boolean;
  quantity: number;
  modelNames: string[];
}) {
  const rows: { label: string; value: string }[] = [
    { label: "Brand", value: brandName },
    {
      label: "Fits",
      value: modelNames.length > 0 ? modelNames.join(", ") : "—",
    },
    {
      label: "Price",
      value: formatPrice({
        priceCents: product.priceCents,
        currency: product.currency,
      }),
    },
    {
      label: "Availability",
      value: !inStock
        ? "Out of stock"
        : isLowStock
          ? `Only ${quantity} left — order soon`
          : `In stock (${quantity} available)`,
    },
    { label: "SKU", value: product.slug.toUpperCase() },
    { label: "Currency", value: product.currency },
  ];

  return (
    <div>
      <SectionEyebrow>Specifications</SectionEyebrow>
      <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
        At a glance
      </h2>
      <dl className="mt-6">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={cn(
              "grid grid-cols-[1fr_1.4fr] items-baseline gap-4 py-3.5",
              i > 0 && "border-t border-border",
            )}
          >
            <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {row.label}
            </dt>
            <dd
              className={cn(
                "text-sm text-foreground",
                row.label === "Availability" && !inStock && "text-destructive",
                row.label === "Availability" && inStock && isLowStock && "text-amber-700",
              )}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold tracking-[0.28em] text-accent uppercase">
      {children}
    </p>
  );
}

function CompatibleModels({ models }: { models: CompatibleModel[] }) {
  const grouped = new Map<
    string,
    { brandSlug: string; models: CompatibleModel[] }
  >();
  for (const m of models) {
    const key = m.brandId;
    const entry = grouped.get(key);
    if (entry) {
      entry.models.push(m);
    } else {
      grouped.set(key, { brandSlug: m.brandSlug, models: [m] });
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-muted/10 p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
          Fits
        </p>
        <span className="text-[11px] text-muted-foreground">
          Compatible devices
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {[...grouped.values()].flatMap((g) =>
          g.models.map((m) => (
            <Link
              key={m.id}
              href={`/products?brand=${g.brandSlug}&model=${m.slug}`}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:text-foreground hover:shadow-sm"
            >
              {m.name}
            </Link>
          )),
        )}
      </div>
    </div>
  );
}

function ServiceCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md">
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/25 bg-accent/10">
        {icon}
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
        {title}
      </h3>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        {desc}
      </p>
    </div>
  );
}

function RelatedCard({ item }: { item: ListingProduct }) {
  return (
    <Link
      href={`/products/${item.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-md"
    >
      <div className="relative aspect-square w-full bg-muted/20">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-4">
            <div className="relative h-[55%] w-[32%] rounded-[1.4rem] border-[2px] border-border/60 bg-gradient-to-b from-muted/70 to-muted/40">
              <div className="absolute top-[5%] left-1/2 h-[2px] w-[26%] -translate-x-1/2 rounded-full bg-border/50" />
              <div className="absolute bottom-[4%] left-1/2 h-[2px] w-[32%] -translate-x-1/2 rounded-full bg-border/40" />
              <div className="absolute top-[8%] left-[7%] h-[7px] w-[7px] rounded-full border border-border/30 bg-background/30" />
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5 p-4">
        <p className="text-xs font-medium leading-snug text-foreground line-clamp-2 transition-colors group-hover:text-accent">
          {item.name}
        </p>
        <p className="font-display text-base font-semibold text-accent">
          {formatPrice({
            priceCents: item.priceCents,
            currency: item.currency,
          })}
        </p>
      </div>
    </Link>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 21s-6.5-5.6-6.5-10.3a6.5 6.5 0 1 1 13 0C18.5 15.4 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.5" />
    </svg>
  );
}

function TruckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M1.5 18.5h13v-11H1.5v11Z" />
      <path d="M14.5 9.5h4l3.5 4v5h-7.5v-9Z" />
      <circle cx="6" cy="18.5" r="1.8" />
      <circle cx="17" cy="18.5" r="1.8" />
    </svg>
  );
}

function ReturnIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M4.5 9h14a4 4 0 0 1 0 8h-3" />
      <path d="M9 4.5 4.5 9l4.5 4.5" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3Z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}