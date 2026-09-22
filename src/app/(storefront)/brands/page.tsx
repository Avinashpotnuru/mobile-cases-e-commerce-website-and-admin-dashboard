import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { LoadingState } from "@/components/ui/states";
import { BrandsHero } from "@/components/storefront/brand-selection/brands-hero";
import { BrandDirectory } from "@/components/storefront/brand-selection/brand-directory";
import { ModelPicker } from "@/components/storefront/brand-selection/model-picker";
import { ScrollTarget } from "@/components/storefront/brand-selection/scroll-target";

const DEFAULT_BRAND = "apple";

export const metadata: Metadata = {
  title: "Shop by brand — Mobile Cases",
  description:
    "Choose a brand, then a mobile model, to find cases engineered for a perfect fit.",
};

export default async function BrandSelectionPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const { brand: requestedBrand } = await searchParams;
  const brand = requestedBrand ?? DEFAULT_BRAND;

  return (
    <>
      <BrandsHero />

      <section
        id="brand-index"
        aria-labelledby="brand-index-heading"
        className="scroll-mt-24 border-b border-border bg-background py-16 sm:py-20"
      >
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase">
                The catalogue
              </p>
              <h2
                id="brand-index-heading"
                className="mt-3 font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl"
              >
                Shop the index
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Every major maker in one place. Pick a brand to reveal its device
              line-up.
            </p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-10">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <Suspense
                fallback={
                  <LoadingState
                    label="Loading brands…"
                    className="rounded-md border border-border"
                  />
                }
              >
                <BrandDirectory selectedSlug={brand} />
              </Suspense>
            </aside>

            <div className="relative min-w-0 scroll-mt-28">
              {requestedBrand ? <ScrollTarget /> : null}
              <Suspense
                fallback={
                  <LoadingState
                    label="Loading models…"
                    className="rounded-2xl border border-border py-24"
                  />
                }
              >
                <ModelPicker brandSlug={brand} />
              </Suspense>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}