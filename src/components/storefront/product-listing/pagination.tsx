import Link from "next/link";
import { cn } from "@/components/ui/cn";

function pageHref(
  params: Record<string, string | undefined>,
  page: number,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }
  search.set("page", String(page));
  return `/products?${search.toString()}`;
}

const baseClasses =
  "inline-flex h-10 items-center justify-center rounded-sm border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const idleClasses = "border-border bg-card text-foreground hover:bg-muted";

function pageButtonClasses(active: boolean): string {
  if (active) {
    return "border-accent bg-accent text-accent-foreground";
  }
  return idleClasses;
}

export function Pagination({
  page,
  totalPages,
  params,
}: {
  page: number;
  totalPages: number;
  params: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex flex-wrap items-center justify-center gap-2"
    >
      <Link
        aria-disabled={page === 1}
        href={pageHref(params, page - 1)}
        tabIndex={page === 1 ? -1 : undefined}
        className={cn(
          baseClasses,
          idleClasses,
          "px-4",
          page === 1 && "pointer-events-none opacity-40",
        )}
      >
        Previous
      </Link>
      {pages.map((p) => (
        <Link
          key={p}
          aria-current={p === page ? "page" : undefined}
          href={pageHref(params, p)}
          className={cn(baseClasses, "w-10", pageButtonClasses(p === page))}
        >
          {p}
        </Link>
      ))}
      <Link
        aria-disabled={page === totalPages}
        href={pageHref(params, page + 1)}
        tabIndex={page === totalPages ? -1 : undefined}
        className={cn(
          baseClasses,
          idleClasses,
          "px-4",
          page === totalPages && "pointer-events-none opacity-40",
        )}
      >
        Next
      </Link>
    </nav>
  );
}