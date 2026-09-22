import Link from "next/link";
import { getBrand } from "@/lib/services/brand-service";
import { listMobileModels } from "@/lib/services/mobile-model-service";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { DeviceArt } from "@/components/storefront/device-art";
import { cn } from "@/components/ui/cn";
import { EmptyState, ErrorState } from "@/components/ui/states";
import type { Brand, MobileModel } from "@/lib/database/models";

export async function BrandShowcase({ slug }: { slug: string }) {
  let brand: Brand | undefined;
  let models: MobileModel[] = [];
  let loadError = false;

  try {
    brand = await getBrand(slug);
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
      <Container className="py-16">
        <ErrorState
          title="Unable to load this brand"
          description="Please try again shortly."
        />
      </Container>
    );
  }

  return (
    <section aria-labelledby="brand-showcase-heading" className="bg-background">
      <Container className="py-16 sm:py-20">
        <nav aria-label="Breadcrumb" className="text-xs font-medium text-muted-foreground">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/brands" className="transition-colors hover:text-accent">
                Brands
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">
              {brand.name}
            </li>
          </ol>
        </nav>

        <div className="mt-10 grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-accent uppercase">
              The studio
            </p>
            <h1
              id="brand-showcase-heading"
              className="mt-4 flex items-center gap-5 font-display text-5xl font-medium tracking-tight text-foreground sm:text-6xl lg:text-7xl"
            >
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/5 font-display text-3xl font-semibold text-accent sm:h-20 sm:w-20 sm:text-4xl">
                {brand.name.charAt(0)}
              </span>
              {brand.name}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {brand.description || "Precision-engineered cases crafted for every device this maker has released."}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground">
                {models.length} {models.length === 1 ? "model" : "models"} covered
              </span>
              <ButtonLink
                href={`/products?${new URLSearchParams({ brand: brand.slug }).toString()}`}
                variant="primary"
                className="group"
              >
                Shop {brand.name} cases
                <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                  &rarr;
                </span>
              </ButtonLink>
            </div>
          </div>

          <div className="hidden lg:block">
            <DeviceArt className="h-72" />
          </div>
        </div>

        <div className="mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase">
                Select a device
              </p>
              <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                {brand.name} line-up
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Jump to any device to see the cases built for it — or browse the
              full collection.
            </p>
          </div>

          {models.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                title={`No models for ${brand.name} yet`}
                description="We're adding new mobile models soon."
              />
            </div>
          ) : (
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {models.map((model, index) => (
                <li key={model._id.toString()}>
                  <Link
                    href={`/models/${model.slug}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 pt-4 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/50 hover:shadow-[0_28px_54px_-30px_rgb(0_0_0/0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground tabular-nums">
                      MDL {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="mt-2">
                      <DeviceArt className="h-40" />
                    </div>
                    <span className={cn(
                      "font-display block text-2xl font-medium tracking-tight text-card-foreground transition-colors duration-300 group-hover:text-accent",
                      "mt-auto pt-5",
                    )}>
                      {model.name}
                    </span>
                    <span
                      aria-hidden="true"
                      className="mx-auto mt-3 block h-px w-8 bg-accent/50 transition-all duration-500 group-hover:w-16"
                    />
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-accent uppercase">
                      View model
                      <span className="arrow-slide">
                        <span className="arrow inline-block" aria-hidden="true">
                          &rarr;
                        </span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </section>
  );
}