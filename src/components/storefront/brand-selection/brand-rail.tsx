import Link from "next/link";
import { listBrands } from "@/lib/services/brand-service";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { cn } from "@/components/ui/cn";
import type { Brand } from "@/lib/database/models";

function brandHref(slug: string): string {
  return `/brands?${new URLSearchParams({ brand: slug }).toString()}`;
}

export async function BrandRail({ selectedSlug }: { selectedSlug?: string }) {
  let brands: Brand[] = [];
  let loadError = false;

  try {
    ({ items: brands } = await listBrands({ page: 1, pageSize: 100 }));
  } catch {
    loadError = true;
  }

  if (loadError) {
    return (
      <ErrorState
        title="Unable to load brands"
        description="Please try again shortly."
      />
    );
  }

  if (brands.length === 0) {
    return (
      <EmptyState
        title="No brands yet"
        description="We're onboarding brands soon."
        className="mt-10"
      />
    );
  }

  return (
    <div
      role="group"
      aria-label="Select a brand"
      className="-mx-4 mt-10 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {brands.map((brand) => {
        const selected = brand.slug === selectedSlug;
        return (
          <Link
            key={brand._id.toString()}
            href={brandHref(brand.slug)}
            aria-current={selected ? "true" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-md border px-4 py-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              selected
                ? "border-accent bg-accent text-accent-foreground shadow-md"
                : "border-border bg-card text-card-foreground hover:border-accent/50 hover:shadow-md",
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full font-display text-sm font-semibold",
                selected
                  ? "bg-white/20 text-accent-foreground"
                  : "border border-accent/30 text-accent",
              )}
            >
              {brand.name.charAt(0)}
            </span>
            <span className="whitespace-nowrap text-sm font-medium">
              {brand.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}