"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Header,
  type SortingState,
} from "@tanstack/react-table";
import { cn } from "@/components/ui/cn";
import {
  ArrowUpDownIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@/components/admin/admin-icons";

export type ColumnAlign = "left" | "right";

export type ColumnMetaShape = {
  align?: ColumnAlign;
};

function headerAlign(align?: ColumnAlign): string {
  return align === "right" ? "text-right" : "text-left";
}

function cellAlign(align?: ColumnAlign): string {
  return align === "right" ? "text-right" : "text-left";
}

function SortButton<T>({ header }: { header: Header<T, unknown> }) {
  const sorted = header.column.getIsSorted();
  const align = (header.column.columnDef.meta as ColumnMetaShape | undefined)?.align;
  return (
    <button
      type="button"
      onClick={header.column.getToggleSortingHandler()}
      aria-label={
        sorted === "asc"
          ? "Sorted ascending. Click to sort descending."
          : sorted === "desc"
            ? "Sorted descending. Click to clear sorting."
            : "Click to sort ascending."
      }
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        headerAlign(align),
        (sorted === "asc" || sorted === "desc") && "text-foreground",
      )}
    >
      {flexRender(header.column.columnDef.header, header.getContext())}
      <span
        aria-hidden="true"
        className={cn(
          "flex h-3.5 w-3.5 items-center justify-center",
          sorted === "asc" || sorted === "desc" ? "text-accent" : "text-muted-foreground/60",
        )}
      >
        {sorted === "asc" ? (
          <ChevronUpIcon className="h-3.5 w-3.5" />
        ) : sorted === "desc" ? (
          <ChevronDownIcon className="h-3.5 w-3.5" />
        ) : (
          <ArrowUpDownIcon className="h-3.5 w-3.5" />
        )}
      </span>
    </button>
  );
}

export function DataTable<TData>({
  columns,
  data,
  getRowId,
  minWidth,
}: {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  getRowId: (row: TData) => string;
  minWidth?: number;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable<TData>({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId,
  });

  return (
    <div className="overflow-x-auto">
      <table
        className="w-full text-left text-sm"
        style={minWidth ? { minWidth } : undefined}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className="border-b border-border bg-muted/40"
            >
              {headerGroup.headers.map((header) => {
                const align = (header.column.columnDef.meta as
                  | ColumnMetaShape
                  | undefined)?.align;
                const sorted = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    scope="col"
                    aria-sort={
                      sorted === "asc"
                        ? "ascending"
                        : sorted === "desc"
                          ? "descending"
                          : undefined
                    }
                    className={cn(
                      "whitespace-nowrap px-4 py-3 text-xs font-semibold text-muted-foreground",
                      headerAlign(align),
                    )}
                  >
                    {header.column.getCanSort() ? (
                      <SortButton header={header} />
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-border transition-colors duration-150 last:border-0 hover:bg-muted/40"
            >
              {row.getVisibleCells().map((cell) => {
                const align = (cell.column.columnDef.meta as
                  | ColumnMetaShape
                  | undefined)?.align;
                return (
                  <td
                    key={cell.id}
                    className={cn("px-4 py-3.5", cellAlign(align))}
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}