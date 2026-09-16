import Link from "next/link";
import { getBrand } from "@/lib/services/brand-service";
import { listMobileModels } from "@/lib/services/mobile-model-service";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/states";
import type { Brand, MobileModel } from "@/lib/database/models";

function modelHref(brandSlug: string, modelSlug: string): string {
  return `/products?${new URLSearchParams({ brand: brandSlug, model: modelSlug }).toString()}`;
}

function PhoneMark() {
  return (
    <div
      aria-hidden="true"
      className="flex h-16 w-16 items-center justify-center rounded-full border border-accent/30 bg-accent/5 transition-all duration-300 group-hover:border-accent group-hover:bg-accent/10"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-7 w-7 text-accent"
      >
        <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
        <path d="M10 18.5h4" />
      </svg>
    </div>
  );
}

export async function ModelPicker({ brandSlug }: { brandSlug: string }) {
  let brand: Brand | undefined;
  let models: MobileModel[] = [];
  let loadError = false;

  try {
    brand = await getBrand(brandSlug);
    const result = await listMobileModels({
      page: 1,
      pageSize: 100,
      brandId: brand._id,
    });
    models = result.items;
  } catch {
    loadError = true;
  }

  if (loadError || !brand) {
    return (
      <ErrorState
        title="Unable to load models"
        description="The brand may no longer be available, or we're having trouble connecting. Please try again."
      />
    );
  }

  if (models.length === 0) {
    return (
      <EmptyState
        title={`No models for ${brand.name} yet`}
        description="We're adding new mobile models soon. In the meantime, explore another brand."
        action={
          <ButtonLink href="/brands" variant="outline">
            Browse all brands
          </ButtonLink>
        }
      />
    );
  }

  return (
    <section aria-labelledby="models-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            {brand.name}
          </p>
          <h2
            id="models-heading"
            className="mt-3 font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl"
          >
            Choose your model
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {models.length} {models.length === 1 ? "model" : "models"}
        </p>
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {models.map((model) => (
          <li key={model._id.toString()}>
            <Link
              href={modelHref(brandSlug, model.slug)}
              className="group flex h-full items-center gap-4 rounded-lg border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <PhoneMark />
              <span className="flex flex-1 flex-col">
                <span className="font-display text-xl font-medium text-card-foreground transition-colors duration-300 group-hover:text-accent">
                  {model.name}
                </span>
                <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
                  View cases
                  <span className="arrow-slide">
                    <span className="arrow inline-block" aria-hidden="true">
                      &rarr;
                    </span>
                  </span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}