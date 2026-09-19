import Link from "next/link";
import { buildListingUrl } from "@/components/storefront/product-listing/listing-url";
import type { ActiveFilters } from "@/lib/storefront/product-listing";

const AVAILABILITY_LABELS: Record<string, string> = {
  in_stock: "In stock",
  out_of_stock: "Out of stock",
};

export function ActiveFilters({
  filters,
  base,
}: {
  filters: ActiveFilters;
  base: Record<string, string>;
}) {
  const chips: Array<{ key: string; label: string; href: string }> = [];

  if (filters.q) {
    chips.push({
      key: "q",
      label: `\u201c${filters.q}\u201d`,
      href: buildListingUrl(base, { q: null, page: null }),
    });
  }

  if (filters.availability !== "any") {
    chips.push({
      key: "availability",
      label: AVAILABILITY_LABELS[filters.availability] ?? filters.availability,
      href: buildListingUrl(base, { availability: "any", page: null }),
    });
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const minLabel =
      filters.minPrice !== undefined ? `₹${filters.minPrice}` : "";
    const maxLabel =
      filters.maxPrice !== undefined ? `₹${filters.maxPrice}` : "";
    chips.push({
      key: "price",
      label: `${minLabel}\u2013${maxLabel || "max"}`,
      href: buildListingUrl(base, { min: null, max: null, page: null }),
    });
  }

  if (chips.length === 0) {
    return null;
  }

  const clearAllHref = buildListingUrl(base, {
    sort: null,
    availability: "any",
    q: null,
    min: null,
    max: null,
    page: null,
  });

  return (
    <div
      aria-label="Active filters"
      className="flex flex-wrap items-center gap-2"
    >
      <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-accent"
        />
        Active filters
      </span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/5 px-3 py-1 text-xs font-medium text-foreground"
        >
          {chip.label}
          <Link
            aria-label={`Remove filter: ${chip.label}`}
            className="-mr-1 ml-0.5 rounded-full p-0.5 text-accent transition-colors hover:bg-accent/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href={chip.href}
          >
            &times;
          </Link>
        </span>
      ))}
      <Link
        className="text-xs font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        href={clearAllHref}
      >
        Clear all
      </Link>
    </div>
  );
}