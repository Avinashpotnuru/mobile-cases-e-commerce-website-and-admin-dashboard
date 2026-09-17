"use client";

import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";

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
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative max-w-xs flex-1">
          <span className="sr-only">Search</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <Input
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
            autoComplete="off"
          />
        </label>
        {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
      </div>
      {countLabel || action ? (
        <div className="flex flex-wrap items-center justify-between gap-3 lg:justify-end">
          {action}
          {countLabel ? (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {countLabel}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}