import { Container } from "@/components/ui/container";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { loadProductListing } from "@/lib/storefront/product-listing";
import { ProductCard } from "@/components/storefront/product-listing/product-card";
import { Pagination } from "@/components/storefront/product-listing/pagination";
import { ListingSearch } from "@/components/storefront/product-listing/listing-search";
import { ListingSort } from "@/components/storefront/product-listing/listing-sort";
import { ListingFilters } from "@/components/storefront/product-listing/listing-filters";
import { ListingFilterDrawer } from "@/components/storefront/product-listing/listing-filter-drawer";
import { ActiveFilters } from "@/components/storefront/product-listing/active-filters";
import { ButtonLink } from "@/components/ui/button";

function clearAllHref(base: Record<string, string>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(base)) {
    if (key === "brand" || key === "model") {
      search.set(key, value);
    }
  }
  return `/products?${search.toString()}`;
}

export async function ProductListingContent({
  query,
}: {
  query: Record<string, string | undefined>;
}) {
  let result: Awaited<ReturnType<typeof loadProductListing>> | null = null;
  try {
    result = await loadProductListing(query);
  } catch {
    result = null;
  }

  if (!result) {
    return (
      <Container className="py-12">
        <ErrorState
          title="Unable to load cases"
          description="We couldn\u2019t load the product catalogue right now. Please try again shortly."
        />
      </Container>
    );
  }

  const { products, total, totalPages, page, sort, filters } = result;
  const heading = result.modelName
    ? `Cases for ${result.modelName}`
    : result.brandName === "All cases"
      ? "All cases"
      : `${result.brandName} cases`;

  const hasActiveFilters =
    Boolean(filters.q) ||
    filters.availability !== "any" ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined;

  const base: Record<string, string> = {};
  if (result.brandSlug) base.brand = result.brandSlug;
  if (result.modelSlug) base.model = result.modelSlug;
  base.sort = sort;
  base.availability = filters.availability;
  if (filters.q) base.q = filters.q;
  if (filters.minPrice !== undefined) base.min = String(filters.minPrice);
  if (filters.maxPrice !== undefined) base.max = String(filters.maxPrice);

  const paginationParams: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(base)) {
    paginationParams[key] = value;
  }

  const activeFilterCount =
    (filters.q ? 1 : 0) +
    (filters.availability !== "any" ? 1 : 0) +
    (filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0);

  const filterPanel = (
    <>
      <ListingSearch q={filters.q} base={base} />
      <div aria-hidden="true" className="h-px bg-border" />
      <ListingFilters
        availability={filters.availability}
        minPrice={filters.minPrice}
        maxPrice={filters.maxPrice}
        base={base}
      />
    </>
  );

  return (
    <Container className="py-12 sm:py-16">
      <header className="border-b border-border pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Compatible cases
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-medium leading-tight text-foreground sm:text-5xl">
          {heading}
        </h1>
        {result.modelName ? (
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Precision-fit protection designed specifically for the{" "}
            {result.modelName}. Browse materials, colours and styles below.
          </p>
        ) : null}
      </header>

      <div className="mt-10 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sticky top-24 flex flex-col gap-6 rounded-2xl border border-border bg-card p-6">
            {filterPanel}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <ListingFilterDrawer activeCount={activeFilterCount}>
                {filterPanel}
              </ListingFilterDrawer>
              <p className="text-sm text-muted-foreground" role="status">
                {total} {total === 1 ? "case" : "cases"}
              </p>
            </div>
            <ListingSort sort={sort} base={base} />
          </div>

          {hasActiveFilters ? (
            <div className="mt-5">
              <ActiveFilters filters={filters} base={base} />
            </div>
          ) : null}

          {total === 0 ? (
            <div className="py-12">
              <EmptyState
                title={
                  hasActiveFilters
                    ? "No cases match your filters"
                    : "No cases found"
                }
                description={
                  hasActiveFilters
                    ? "Try adjusting your search or removing a filter to see more results."
                    : "Explore the full collection of precision-fit protective cases."
                }
                action={
                  <ButtonLink
                    href={clearAllHref(base)}
                    variant="outline"
                    size="md"
                  >
                    {hasActiveFilters ? "Clear filters" : "View all cases"}
                  </ButtonLink>
                }
              />
            </div>
          ) : (
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <li key={product.id} className="flex">
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            params={paginationParams}
          />
        </div>
      </div>
    </Container>
  );
}