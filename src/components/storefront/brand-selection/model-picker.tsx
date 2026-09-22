import Link from "next/link";
import { getBrand } from "@/lib/services/brand-service";
import { listMobileModels } from "@/lib/services/mobile-model-service";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { DeviceArt } from "@/components/storefront/device-art";
import type { Brand, MobileModel } from "@/lib/database/models";

function modelHref(brandSlug: string, modelSlug: string): string {
  return `/products?${new URLSearchParams({ brand: brandSlug, model: modelSlug }).toString()}`;
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
        className="rounded-2xl border border-border py-20"
        title="Unable to load models"
        description="The brand may no longer be available, or we're having trouble connecting. Please try again."
      />
    );
  }

  if (models.length === 0) {
    return (
      <EmptyState
        className="rounded-2xl border border-border py-20"
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
    <section
      aria-labelledby="models-heading"
      className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-[0_30px_70px_-40px_rgb(0_0_0/0.4)]"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 bottom-0 select-none font-display text-[16rem] leading-none font-semibold tracking-tighter text-foreground/[0.04]"
      >
        {brand.name.charAt(0)}
      </span>

      <div className="relative grid gap-10 p-6 sm:p-8 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-12 lg:p-10">
        <aside className="lg:border-r lg:border-border lg:pr-8">
          <p className="text-[11px] font-semibold tracking-[0.25em] text-muted-foreground uppercase">
            Now viewing
          </p>

          <div className="mt-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/30 bg-accent/5">
            <span className="font-display text-2xl font-semibold text-accent">
              {brand.name.charAt(0)}
            </span>
          </div>

          <h2
            id="models-heading"
            className="mt-5 font-display text-4xl font-medium tracking-tight text-card-foreground"
          >
            {brand.name}
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {brand.description || "Precision-engineered cases crafted for every device this maker has released."}
          </p>

          <span className="mt-5 inline-flex items-center rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            {models.length} {models.length === 1 ? "model" : "models"} covered
          </span>

          <div className="mt-8 flex flex-col gap-2">
            <ButtonLink
              href={`/products?${new URLSearchParams({ brand: brandSlug }).toString()}`}
              variant="outline"
              size="sm"
              className="group justify-start"
            >
              Browse all {brand.name} cases
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                &rarr;
              </span>
            </ButtonLink>
            <a
              href="#brand-index"
              className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-sm px-3 text-sm font-medium text-muted-foreground transition-colors select-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span aria-hidden="true">&larr;</span> Back to the directory
            </a>
          </div>
        </aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase">
              Select a device
            </p>
            <span className="rounded-full border border-border bg-background px-3 py-1 text-[11px] font-semibold text-muted-foreground tabular-nums">
              {models.length} {models.length === 1 ? "device" : "devices"}
            </span>
          </div>

          <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {models.map((model, index) => (
              <li key={model._id.toString()}>
                <Link
                  href={modelHref(brandSlug, model.slug)}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background p-5 pt-4 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/50 hover:shadow-[0_28px_54px_-30px_rgb(0_0_0/0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground tabular-nums">
                      MDL {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-success" />
                      In stock
                    </span>
                  </div>

                  <div className="mt-4">
                    <DeviceArt />
                  </div>

                  <div className="mt-auto pt-5">
                    <span className="font-display block text-2xl font-medium tracking-tight text-card-foreground transition-colors duration-300 group-hover:text-accent">
                      {model.name}
                    </span>
                    <span
                      aria-hidden="true"
                      className="mx-auto mt-3 block h-px w-8 bg-accent/50 transition-all duration-500 group-hover:w-16"
                    />
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-accent uppercase">
                      View cases
                      <span className="arrow-slide">
                        <span className="arrow inline-block" aria-hidden="true">
                          &rarr;
                        </span>
                      </span>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}