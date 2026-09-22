import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMobileModel } from "@/lib/services/mobile-model-service";
import { getBrand } from "@/lib/services/brand-service";
import { NotFoundError } from "@/lib/services/errors";
import { loadProductListing } from "@/lib/storefront/product-listing";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { DeviceArt } from "@/components/storefront/device-art";
import { ProductCard } from "@/components/storefront/product-listing/product-card";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const model = await getMobileModel(slug);
    const brand = await getBrand(model.brandId.toHexString());
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://mobilecases.example.com";
    const url = new URL(`/models/${model.slug}`, baseUrl).toString();
    const title = `${brand.name} ${model.name} cases`;
    const description = `Precision-fit protective cases for the ${brand.name} ${model.name}.`;
    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        url,
        siteName: "Mobile Cases",
        type: "website",
      },
    };
  } catch {
    return { title: "Model" };
  }
}

export default async function ModelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let model;
  try {
    model = await getMobileModel(slug);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  let brand;
  try {
    brand = await getBrand(model.brandId.toHexString());
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  let listing;
  try {
    listing = await loadProductListing({ model: slug, page: "1", sort: "featured" });
  } catch {
    listing = null;
  }

  const heading = `${brand.name} ${model.name}`;

  return (
    <section aria-labelledby="model-showcase-heading" className="bg-background">
      <Container className="py-16 sm:py-20">
        <nav aria-label="Breadcrumb" className="text-xs font-medium text-muted-foreground">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/brands" className="transition-colors hover:text-accent">
                Brands
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={`/brands/${brand.slug}`}
                className="transition-colors hover:text-accent"
              >
                {brand.name}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">
              {model.name}
            </li>
          </ol>
        </nav>

        <div className="mt-10 grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-accent uppercase">
              {brand.name}
            </p>
            <h1
              id="model-showcase-heading"
              className="mt-4 font-display text-5xl font-medium tracking-tight text-foreground sm:text-6xl lg:text-7xl"
            >
              {heading}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Precision-fit protection designed specifically for the {heading}.
              Browse materials, colours and styles below.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground">
                {listing ? `${listing.total} ${listing.total === 1 ? "case" : "cases"} available` : "Cases available"}
              </span>
              {listing ? (
                <ButtonLink
                  href={`/products?${new URLSearchParams({ model: model.slug, brand: brand.slug }).toString()}`}
                  variant="primary"
                  className="group"
                >
                  View all {listing.total} cases
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                    &rarr;
                  </span>
                </ButtonLink>
              ) : null}
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
                Compatible cases
              </p>
              <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                Shop {heading} cases
              </h2>
            </div>
          </div>

          {!listing ? (
            <div className="mt-8">
              <ErrorState
                title="Unable to load cases"
                description="We couldn\u2019t load the cases for this model right now. Please try again shortly."
              />
            </div>
          ) : listing.total === 0 ? (
            <div className="mt-8">
              <EmptyState
                title={`No cases for the ${heading} yet`}
                description="We're adding new cases soon. Sign in later or explore another model."
                action={
                  <ButtonLink href="/products" variant="outline">
                    Browse all cases
                  </ButtonLink>
                }
              />
            </div>
          ) : (
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listing.products.map((product) => (
                <li key={product.id} className="flex">
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </section>
  );
}