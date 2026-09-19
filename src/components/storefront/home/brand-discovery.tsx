import Link from "next/link";
import { listBrands } from "@/lib/services/brand-service";
import { Container } from "@/components/ui/container";
import { ErrorState } from "@/components/ui/states";
import { Reveal } from "./reveal";
import type { Brand } from "@/lib/database/models";

const FEATURED_LIMIT = 20;

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

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {brands.map((brand, index) => (
            <Reveal key={brand._id.toString()} delay={index * 70} className="h-full">
              <Link
                href={`/brands?brand=${brand.slug}`}
                className="group relative flex h-full min-h-[15rem] flex-col overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_28px_60px_-34px_rgb(0_0_0/0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-8 -right-3 select-none font-display text-[7.5rem] leading-none font-semibold tracking-tighter text-foreground/[0.04] transition-all duration-700 group-hover:-translate-y-2 group-hover:text-accent/10"
                >
                  {brand.name.charAt(0)}
                </span>

                <div className="relative flex items-center justify-between">
                  <span className="text-[11px] font-medium tracking-[0.2em] text-muted-foreground tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 -translate-x-1 items-center justify-center rounded-full border border-accent/30 text-accent opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </div>

                <div className="relative mt-auto pt-14">
                  <h3 className="font-display text-2xl leading-tight font-medium tracking-tight text-card-foreground">
                    {brand.name}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="mt-3 block h-px w-8 bg-accent/60 transition-all duration-500 group-hover:w-16"
                  />
                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {brand.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
                    Explore
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    >
                      &rarr;
                    </span>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
