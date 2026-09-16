import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { LoadingState } from "@/components/ui/states";
import { BrandRail } from "@/components/storefront/brand-selection/brand-rail";
import { ModelPicker } from "@/components/storefront/brand-selection/model-picker";

export const metadata: Metadata = {
  title: "Find your case",
  description:
    "Choose a brand and mobile model to find compatible cases.",
};

export default async function BrandSelectionPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const { brand } = await searchParams;

  return (
    <section
      aria-labelledby="brand-selection-heading"
      className="border-b border-border bg-background py-16 sm:py-20"
    >
      <Container>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
          Find your case
        </p>
        <h1
          id="brand-selection-heading"
          className="mt-3 max-w-2xl font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl"
        >
          Choose your brand
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Pick a brand, then choose your mobile model to see compatible cases.
        </p>

        <BrandRail selectedSlug={brand} />

        <div className="mt-14">
          {brand ? (
            <Suspense
              fallback={
                <LoadingState
                  label="Loading models…"
                  className="rounded-md border border-border py-24"
                />
              }
            >
              <ModelPicker brandSlug={brand} />
            </Suspense>
          ) : (
            <p className="rounded-md border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Select a brand above to see its available models.
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}