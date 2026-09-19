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

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 shrink-0 text-accent"
      aria-hidden="true"
    >
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  );
}

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
    <div className="flex flex-col gap-7">
      <fieldset className="flex flex-col gap-3">
        <legend className={captionClasses}>Availability</legend>
        <div className="flex flex-col gap-1.5">
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
                  "flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active
                    ? "border-accent/50 bg-accent/5 text-foreground"
                    : "border-border text-muted-foreground hover:border-accent/40 hover:text-foreground",
                )}
              >
                {option.label}
                {active ? <CheckIcon /> : null}
              </a>
            );
          })}
        </div>
      </fieldset>

      <form className="flex flex-col gap-3" action="/products" method="get">
        <span className={captionClasses}>Price range</span>
        {preserveParams(base).map((field) => (
          <input
            key={field.name}
            type="hidden"
            name={field.name}
            value={field.value}
          />
        ))}
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
              ₹
            </span>
            <Input
              aria-label="Minimum price in rupees"
              className="h-10 pl-6"
              defaultValue={minPrice ?? ""}
              max={MAX_PRICE_DOLLARS}
              min={0}
              name="min"
              placeholder="Min"
              type="number"
            />
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
              ₹
            </span>
            <Input
              aria-label="Maximum price in rupees"
              className="h-10 pl-6"
              defaultValue={maxPrice ?? ""}
              max={MAX_PRICE_DOLLARS}
              min={0}
              name="max"
              placeholder="Max"
              type="number"
            />
          </div>
        </div>
        <button
          className="h-10 cursor-pointer rounded-sm border border-border bg-card text-sm font-medium text-foreground transition-colors hover:border-accent/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          type="submit"
        >
          Apply price
        </button>
      </form>
    </div>
  );
}
