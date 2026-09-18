import { cn } from "@/components/ui/cn";
import { Input } from "@/components/ui/input";
import { buildListingUrl } from "@/components/storefront/product-listing/listing-url";
import { MAX_PRICE_DOLLARS } from "@/lib/storefront/product-listing";
import type { AvailabilityFilter } from "@/lib/storefront/product-listing";

const AVAILABILITY_OPTIONS: { value: AvailabilityFilter; label: string }[] = [
  { value: "any", label: "All availability" },
  { value: "in_stock", label: "In stock" },
  { value: "out_of_stock", label: "Out of stock" },
];

const captionClasses =
  "text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground";

function preserveParams(
  base: Record<string, string>,
): Array<{ name: string; value: string }> {
  return Object.entries(base)
    .filter(([key]) => key !== "page" && key !== "min" && key !== "max")
    .map(([name, value]) => ({ name, value }));
}

export function ListingFilters({
  availability,
  minPrice,
  maxPrice,
  base,
}: {
  availability: AvailabilityFilter;
  minPrice?: number;
  maxPrice?: number;
  base: Record<string, string>;
}) {
  return (
    <div className="flex flex-wrap items-end gap-x-10 gap-y-5">
      <fieldset className="flex flex-col gap-2">
        <legend className={captionClasses}>Availability</legend>
        <div className="flex flex-wrap gap-1.5">
          {AVAILABILITY_OPTIONS.map((option) => {
            const active = option.value === availability;
            return (
              <a
                key={option.value}
                aria-current={active ? "true" : undefined}
                href={buildListingUrl(base, {
                  availability: option.value,
                  page: null,
                })}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "border border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-foreground",
                )}
              >
                {option.label}
              </a>
            );
          })}
        </div>
      </fieldset>

      <form
        className="flex flex-col gap-2"
        action="/products"
        method="get"
      >
        <span className={captionClasses}>Price range</span>
        <div className="flex flex-wrap items-center gap-2.5">
          {preserveParams(base).map((field) => (
            <input
              key={field.name}
              type="hidden"
              name={field.name}
              value={field.value}
            />
          ))}
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm font-medium text-muted-foreground">
              $
            </span>
            <Input
              aria-label="Minimum price in dollars"
              className="w-20 pl-7 sm:w-28"
              defaultValue={minPrice ?? ""}
              max={MAX_PRICE_DOLLARS}
              min={0}
              name="min"
              placeholder="Min"
              type="number"
            />
          </div>
          <span aria-hidden="true" className="text-sm text-muted-foreground">
            {"\u2013"}
          </span>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm font-medium text-muted-foreground">
              $
            </span>
            <Input
              aria-label="Maximum price in dollars"
              className="w-20 pl-7 sm:w-28"
              defaultValue={maxPrice ?? ""}
              max={MAX_PRICE_DOLLARS}
              min={0}
              name="max"
              placeholder="Max"
              type="number"
            />
          </div>
          <button
            className="h-10 cursor-pointer rounded-sm border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:border-accent/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            type="submit"
          >
            Apply
          </button>
        </div>
      </form>
    </div>
  );
}