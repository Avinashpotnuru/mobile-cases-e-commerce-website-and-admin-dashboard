"use client";

import { useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import {
  ChevronDownIcon,
  SearchIcon,
} from "@/components/admin/admin-icons";
import { cn } from "@/components/ui/cn";

export function CatalogToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  countLabel,
  action,
  children,
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  countLabel: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
        <label className="relative w-full min-w-0 md:w-auto md:min-w-[180px] md:flex-1 md:basis-64 md:max-w-xs">
          <span className="sr-only">Search</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9"
            autoComplete="off"
          />
        </label>
        {children ? (
          <div className="hidden min-w-0 flex-wrap items-center gap-2 sm:gap-3 md:flex [&_select]:w-auto [&_select]:min-w-40">
            {children}
          </div>
        ) : null}
      </div>

      {countLabel || action || children ? (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 md:justify-end md:gap-3">
          {children ? (
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors",
                "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden",
              )}
            >
              Filters
              <ChevronDownIcon
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  filtersOpen && "rotate-180",
                )}
              />
            </button>
          ) : null}
          {action}
          {countLabel ? (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {countLabel}
            </p>
          ) : null}
        </div>
      ) : null}

      {children && filtersOpen ? (
        <div className="grid grid-cols-1 items-center gap-3 rounded-lg border border-border bg-background p-3 sm:grid-cols-2 [&_select]:w-full md:hidden">
          {children}
        </div>
      ) : null}
    </div>
  );
}