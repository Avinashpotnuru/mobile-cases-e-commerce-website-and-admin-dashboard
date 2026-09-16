import Link from "next/link";
import { listBrands } from "@/lib/services/brand-service";
import { Container } from "@/components/ui/container";
import { ErrorState } from "@/components/ui/states";
import { Reveal } from "./reveal";
import type { Brand } from "@/lib/database/models";

const FEATURED_LIMIT = 20;

function MarqueeStrip({ brands }: { brands: Brand[] }) {
  const doubled = [...brands, ...brands];
  return (
    <div className="overflow-hidden border-b border-white/10 bg-[#0c0a09] py-11">
      <h2 className="sr-only">Popular brands</h2>
      <div
        aria-hidden="true"
        className="marquee flex w-max items-center [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
      >
        {doubled.map((brand, index) => (
          <span key={`${brand._id.toString()}-${index}`} className="flex items-center">
            <span
              className={
                index % 2 === 0
                  ? "px-10 font-display text-3xl font-semibold tracking-wide text-amber-400 sm:text-4xl"
                  : "px-10 font-display text-3xl font-medium tracking-wide text-transparent [-webkit-text-stroke:1px_rgb(250_250_249/0.35)] sm:text-4xl"
              }
            >
              {brand.name}
            </span>
            <span className="h-2 w-2 shrink-0 rotate-45 bg-amber-500/60" />
          </span>
        ))}
      </div>
    </div>
  );
}

export async function BrandDiscovery() {
  let brands: Brand[] = [];
  let loadError = false;

  try {
    ({ items: brands } = await listBrands({
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
            title="Unable to load brands"
            description="Please try again shortly."
          />
        </Container>
      </section>
    );
  }

  return (
    <>
      {brands.length > 0 ? <MarqueeStrip brands={brands} /> : null}

      <section
        aria-labelledby="brands-heading"
        className="border-b border-border bg-background py-20 sm:py-28"
      >
        <Container>
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
                  Trusted names
                </p>
                <h2
                  id="brands-heading"
                  className="mt-3 max-w-md font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl"
                >
                  Shop by brand
                </h2>
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                Five heritage makers. One obsession — a perfect fit for your
                device.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {brands.map((brand, index) => (
              <Reveal key={brand._id.toString()} delay={index * 70} className="h-full">
                <Link
                  href={`/brands?brand=${brand.slug}`}
                  className="group relative flex h-full flex-col items-center gap-3 overflow-hidden rounded-lg border border-border bg-card p-7 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 -top-14 h-28 bg-[radial-gradient(ellipse_at_top,rgb(161_98_7/0.16),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-accent/30 font-display text-2xl font-semibold text-accent transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground">
                    {brand.name.charAt(0)}
                  </span>
                  <span className="font-display text-xl font-medium text-card-foreground">
                    {brand.name}
                  </span>
                  <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {brand.description}
                  </span>
                  <span className="arrow-slide mt-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
                    Shop
                    <span className="arrow" aria-hidden="true">
                      &rarr;
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}