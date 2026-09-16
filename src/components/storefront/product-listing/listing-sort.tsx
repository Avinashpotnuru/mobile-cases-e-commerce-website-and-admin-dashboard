import { cn } from "@/components/ui/cn";
import { buildListingUrl } from "@/components/storefront/product-listing/listing-url";
import type { ProductListingSort } from "@/lib/services/product-service";

const SORT_OPTIONS: { value: ProductListingSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name A\u2013Z" },
];

const captionClasses =
  "text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground";

export function ListingSort({
  sort,
  base,
}: {
  sort: ProductListingSort;
  base: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className={captionClasses}>Sort by</span>
      <div
        aria-label="Sort products"
        className="inline-flex max-w-full flex-wrap gap-0.5 rounded-lg border border-border bg-muted/70 p-1"
        role="group"
      >
        {SORT_OPTIONS.map((option) => {
          const active = option.value === sort;
          return (
            <a
              key={option.value}
              aria-current={active ? "true" : undefined}
              href={buildListingUrl(base, { sort: option.value, page: null })}
              className={cn(
                "rounded-md px-3.5 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                active
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}