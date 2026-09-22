import Link from "next/link";
import { listBrands } from "@/lib/services/brand-service";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { cn } from "@/components/ui/cn";
import type { Brand } from "@/lib/database/models";

function brandHref(slug: string): string {
  return `/brands?${new URLSearchParams({ brand: slug }).toString()}`;
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export async function BrandDirectory({
  selectedSlug,
}: {
  selectedSlug?: string;
}) {
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
      />
    );
  }

  return (
    <nav aria-label="Browse brands">
      <div className="mb-3 flex items-center justify-between px-3.5 lg:px-1">
        <Link
          href="/brands"
          scroll={false}
          className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase transition-colors duration-200 hover:text-accent"
        >
          Brand directory
        </Link>
        <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
          {String(brands.length).padStart(2, "0")}
        </span>
      </div>

      <ul className="flex gap-2 overflow-x-auto pb-3 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {brands.map((brand, index) => {
          const selected = brand.slug === selectedSlug;
          return (
            <li key={brand._id.toString()} className="shrink-0 lg:w-full">
              <Link
                href={brandHref(brand.slug)}
                scroll={false}
                aria-current={selected ? "true" : undefined}
                className={cn(
                  "group relative flex min-w-max items-center gap-3 rounded-lg px-3 py-3 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:min-w-0 lg:px-3.5",
                  selected
                    ? "bg-accent/[0.08] text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute",
                    selected
                      ? "inset-x-0 bottom-0 h-0.5 rounded-full bg-accent lg:inset-x-auto lg:inset-y-0 lg:left-0 lg:h-auto lg:w-0.5"
                      : "hidden",
                  )}
                />

                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-display text-base font-semibold transition-colors duration-200",
                    selected
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-card text-accent group-hover:border-accent/50",
                  )}
                >
                  {brand.name.charAt(0)}
                </span>

                <span className="font-display text-lg font-medium tracking-tight">
                  {brand.name}
                </span>

                <span className="hidden text-[10px] font-semibold text-muted-foreground/70 tabular-nums lg:ml-auto lg:block">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <ArrowIcon
                  className={cn(
                    "hidden h-3.5 w-3.5 text-accent transition-transform duration-300 group-hover:translate-x-0.5 lg:block",
                    selected ? "translate-x-0.5" : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
                  )}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}