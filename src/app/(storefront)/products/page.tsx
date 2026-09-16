import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/ui/states";
import { ProductListingContent } from "@/components/storefront/product-listing/product-listing-content";

export const metadata: Metadata = {
  title: "Cases",
  description:
    "Browse the full collection of precision-fit protective cases and find the perfect match for your mobile model.",
};

type SearchParams = Promise<{
  brand?: string;
  model?: string;
  page?: string;
  sort?: string;
  availability?: string;
  q?: string;
  min?: string;
  max?: string;
}>;

export default async function ProductListingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  return (
    <section className="bg-background">
      <Suspense fallback={<LoadingState className="min-h-96" label="Loading cases…" />}>
        <ProductListingContent
          query={{
            brand: sp.brand,
            model: sp.model,
            page: sp.page,
            sort: sp.sort,
            availability: sp.availability,
            q: sp.q,
            min: sp.min,
            max: sp.max,
          }}
        />
      </Suspense>
    </section>
  );
}