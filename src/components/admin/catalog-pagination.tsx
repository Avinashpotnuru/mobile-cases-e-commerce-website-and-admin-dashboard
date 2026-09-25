"use client";

import { cn } from "@/components/ui/cn";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/admin/admin-icons";

function pageItems(page: number, total: number): (number | null)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const window = new Set([
    1,
    2,
    total - 1,
    total,
    page - 1,
    page,
    page + 1,
  ]);
  const pages = [...window]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const items: (number | null)[] = [];
  let previous = 0;
  for (const n of pages) {
    if (n - previous > 1) {
      items.push(null);
    }
    items.push(n);
    previous = n;
  }
  return items;
}

const controlButton =
  "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40";

const pageButton =
  "inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-lg px-2.5 text-sm font-medium tabular-nums transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function CatalogPagination({
  page,
  totalPages,
  start,
  end,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  totalPages: number;
  start: number;
  end: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const items = pageItems(page, totalPages);

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-4 border-t border-border/70 pt-4 lg:flex-row">
      <div className="flex items-baseline gap-2 text-sm text-muted-foreground">
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 self-center rounded-full bg-accent"
        />
        <p aria-live="polite">
          Showing{" "}
          <span className="font-semibold tabular-nums text-foreground">
            {start}
          </span>
          {"\u2013"}
          <span className="font-semibold tabular-nums text-foreground">
            {end}
          </span>{" "}
          of{" "}
          <span className="font-semibold tabular-nums text-foreground">
            {total}
          </span>{" "}
          results
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Rows per page
          <span className="relative">
            <select
              aria-label="Rows per page"
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-8 cursor-pointer appearance-none rounded-md border border-border bg-card pl-2.5 pr-7 text-sm font-medium tabular-nums text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </span>
        </label>

        <nav aria-label="Pagination" className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Previous page"
            title="Previous page"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className={controlButton}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>

          {items.map((item, index) =>
            item === null ? (
              <span
                key={`gap-${index}`}
                aria-hidden="true"
                className="flex h-9 w-6 items-center justify-center text-sm text-muted-foreground"
              >
                {"\u2026"}
              </span>
            ) : (
              <button
                key={item}
                type="button"
                aria-current={item === page ? "page" : undefined}
                onClick={() => onPageChange(item)}
                className={cn(
                  pageButton,
                  item === page
                    ? "bg-accent font-semibold text-accent-foreground shadow-md shadow-accent/30"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item}
              </button>
            ),
          )}

          <button
            type="button"
            aria-label="Next page"
            title="Next page"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className={controlButton}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </div>
  );
}