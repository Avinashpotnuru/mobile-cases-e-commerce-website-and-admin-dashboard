import Link from "next/link";
import { listProducts } from "@/lib/services/product-service";
import { Container } from "@/components/ui/container";
import { ErrorState, EmptyState } from "@/components/ui/states";
import { Reveal } from "./reveal";
import { formatPrice } from "./price";
import type { Product } from "@/lib/database/models";

const FEATURED_LIMIT = 6;

const badges = ["New", "Bestseller", "Limited", "Editors\u2022Pick"] as const;

function PhoneSilhouette() {
  return (
    <div className="relative mx-auto flex h-32 w-18 items-center justify-center transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-hover:rotate-6 sm:h-36">
      <div
        aria-hidden="true"
        className="absolute h-24 w-24 rounded-full bg-amber-500/15 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="relative block h-28 w-14 rounded-xl border-2 border-accent/30 bg-gradient-to-b from-accent/10 to-transparent shadow-sm transition-colors duration-300 group-hover:border-accent/60 sm:h-32 sm:w-16 sm:rounded-2xl">
        <div className="absolute top-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full border border-accent/40 bg-accent/20" />
        <div className="absolute inset-x-1.5 bottom-1.5 top-4 rounded-lg bg-muted/60 transition-colors duration-300 group-hover:bg-muted/40" />
      </div>
    </div>
  );
}

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
              <Link
                href={`/products/${product.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/50 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="relative h-44 overflow-hidden border-b border-border/60 bg-gradient-to-b from-muted/70 to-muted/20">
                  <span className="absolute top-4 left-4 z-10 rounded-full bg-foreground/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-background">
                    {badges[index % badges.length]}
                  </span>
                  <PhoneSilhouette />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-2xl font-medium text-card-foreground transition-colors duration-300 group-hover:text-accent">
                    {product.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-5">
                    <span className="text-base font-semibold text-foreground">
                      {formatPrice(product)}
                    </span>
                    <span className="arrow-slide inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
                      View
                      <span className="arrow" aria-hidden="true">
                        &rarr;
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}