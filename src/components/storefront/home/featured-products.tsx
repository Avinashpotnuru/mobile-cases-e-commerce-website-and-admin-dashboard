import Link from "next/link";
import { listProducts } from "@/lib/services/product-service";
import { Container } from "@/components/ui/container";
import { ErrorState, EmptyState } from "@/components/ui/states";
import { Reveal } from "./reveal";
import { ProductCardView } from "@/components/storefront/product-listing/product-card";
import { resolveProductImage } from "@/lib/storefront/product-listing";
import type { Product } from "@/lib/database/models";

const FEATURED_LIMIT = 6;

export async function FeaturedProducts() {
  let products: Product[] = [];
  let loadError = false;

  try {
    ({ items: products } = await listProducts({
      page: 1,
      pageSize: FEATURED_LIMIT,
    }));
  } catch {
    loadError = true;
  }

  if (loadError) {
    return (
      <section className="border-b border-border bg-background py-16 sm:py-20">
        <Container>
          <ErrorState
            title="Unable to load products"
            description="Please try again shortly."
          />
        </Container>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="border-b border-border bg-background py-16 sm:py-20">
        <Container>
          <EmptyState
            title="No products yet"
            description="New cases are on the way — check back soon."
          />
        </Container>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="featured-heading"
      className="border-b border-border bg-background py-20 sm:py-28"
    >
      <Container>
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
                New arrivals
              </p>
              <h2
                id="featured-heading"
                className="mt-3 max-w-lg font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl"
              >
                Featured cases
              </h2>
            </div>
            <Link
              href="/products"
              className="arrow-slide inline-flex items-center gap-1.5 text-sm font-semibold text-accent"
            >
              View all
              <span className="arrow" aria-hidden="true">
                &rarr;
              </span>
            </Link>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <Reveal key={product._id.toString()} delay={index * 90} className="h-full">
              <ProductCardView
                productId={product._id.toHexString()}
                slug={product.slug}
                name={product.name}
                priceCents={product.priceCents}
                currency={product.currency}
                image={resolveProductImage(product.images[0])}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}