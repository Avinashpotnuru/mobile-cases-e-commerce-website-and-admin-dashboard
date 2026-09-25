"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnDefResolved,
  type ExpandedState,
  type Header,
  type Row,
  type RowSelectionState,
  type SortingState,
  type Table,
  type VisibilityState,
} from "@tanstack/react-table";
import { cn } from "@/components/ui/cn";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDownIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CloseIcon,
} from "@/components/admin/admin-icons";

export type ColumnAlign = "left" | "right";

export type ColumnMetaShape<TData = unknown> = {
  align?: ColumnAlign;
  /** How this column is exported to CSV. Falls back to the accessorKey value. */
  csv?: {
    header?: string;
    value?: (row: TData) => string | number | null | undefined;
    exclude?: boolean;
  };
  /** Value shown in the footer totals row under this column. */
  footer?: (rows: TData[]) => string | number;
};

export type BulkAction<TData> = {
  label: string;
  variant?: "outline" | "destructive";
  onAction: (rows: TData[]) => Promise<void> | void;
};

function preferenceKeyFor(preferenceKey: string, kind: string): string {
  return `admin-table:${preferenceKey}:${kind}`;
}

function loadPreference<T>(
  preferenceKey: string | undefined,
  kind: string,
  fallback: T,
): T {
  if (typeof window === "undefined" || !preferenceKey) {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(
      preferenceKeyFor(preferenceKey, kind),
    );
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function savePreference(
  preferenceKey: string | undefined,
  kind: string,
  value: unknown,
) {
  if (typeof window === "undefined" || !preferenceKey) {
    return;
  }
  try {
    window.localStorage.setItem(
      preferenceKeyFor(preferenceKey, kind),
      JSON.stringify(value),
    );
  } catch {
    // localStorage unavailable — ignore.
  }
}

function headerAlign(align?: ColumnAlign): string {
  return align === "right" ? "text-right" : "text-left";
}

function cellAlign(align?: ColumnAlign): string {
  return align === "right" ? "text-right" : "text-left";
}

type ToolIconButtonProps = {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
};

function ToolIconButton({
  label,
  active,
  onClick,
  children,
}: ToolIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "bg-muted/70 text-foreground"
          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-4 w-4"}
    >
      <path d="M12 3v10" />
      <path d="m6 9 6 6 6-6" />
      <path d="M4 20h16" />
    </svg>
  );
}

function ColumnsIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-4 w-4"}
    >
      <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}

function SortButton<TData>({ header }: { header: Header<TData, unknown> }) {
  const sorted = header.column.getIsSorted();
  const align = (header.column.columnDef.meta as
    | ColumnMetaShape
    | undefined)?.align;
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
        "inline-flex cursor-pointer items-center gap-1.5 transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        headerAlign(align),
        (sorted === "asc" || sorted === "desc") && "text-foreground",
      )}
    >
      {flexRender(header.column.columnDef.header, header.getContext())}
      <span
        aria-hidden="true"
        className={cn(
          "flex h-3.5 w-3.5 items-center justify-center",
          sorted === "asc" || sorted === "desc"
            ? "text-accent"
            : "text-muted-foreground/60",
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

function SelectionHeader({
  table,
}: {
  table: Table<Record<string, unknown>>;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const all = table.getIsAllPageRowsSelected();
  const some = table.getIsSomePageRowsSelected();

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = some && !all;
    }
  }, [some, all]);

  return (
    <input
      ref={ref}
      type="checkbox"
      aria-label="Select all rows"
      checked={all}
      onChange={table.getToggleAllPageRowsSelectedHandler()}
      className="h-4 w-4 cursor-pointer accent-[var(--color-accent)]"
    />
  );
}

function SelectionCell<TData>({ row }: { row: Row<TData> }) {
  return (
    <input
      type="checkbox"
      aria-label={`Select row ${row.index + 1}`}
      checked={row.getIsSelected()}
      onChange={row.getToggleSelectedHandler()}
      className="h-4 w-4 cursor-pointer accent-[var(--color-accent)]"
    />
  );
}

function ColumnVisibilityMenu({
  table,
}: {
  table: Table<Record<string, unknown>>;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const columns = table
    .getAllLeafColumns()
    .filter((column) => !column.id.startsWith("_table_"));

  function columnLabel(column: Column<Record<string, unknown>, unknown>) {
    const meta = column.columnDef.meta as ColumnMetaShape | undefined;
    if (meta?.csv?.header) {
      return meta.csv.header;
    }
    if (typeof column.columnDef.header === "string") {
      return column.columnDef.header;
    }
    return column.columnDef.id ?? column.id;
  }

  return (
    <div className="relative">
      <ToolIconButton
        label="Toggle columns"
        active={open}
        onClick={() => setOpen((value) => !value)}
      >
        <ColumnsIcon />
      </ToolIconButton>
      {open ? (
        <div ref={menuRef} className="relative">
          <button
            type="button"
            aria-label="Close column menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
            tabIndex={-1}
          />
          <div
            role="menu"
            aria-label="Visible columns"
            className="absolute right-0 z-50 mt-1 max-h-72 w-52 overflow-auto rounded-lg border border-border bg-card p-1.5 shadow-xl"
          >
            {columns.map((column) => (
              <label
                key={column.id}
                role="menuitemcheckbox"
                aria-checked={column.getIsVisible()}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted/60"
              >
                <input
                  type="checkbox"
                  checked={column.getIsVisible()}
                  onChange={column.getToggleVisibilityHandler()}
                  className="h-3.5 w-3.5 cursor-pointer accent-[var(--color-accent)]"
                />
                <span className="truncate">{columnLabel(column)}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  getRowId: (row: TData) => string;
  minWidth?: number;
  /** Provide a filename to enable the CSV export button (exports the current view). */
  exportFilename?: string;
  /** Enables the checkbox column; a bulk action bar appears when rows are selected. */
  bulkActions?: BulkAction<TData>[];
  /** Enables expandable rows and renders this content below the expanded row. */
  expandContent?: (context: { row: Row<TData> }) => ReactNode;
  /** Label shown in the first cell of the footer totals row. */
  footerLabel?: string;
  /** Keeps the header pinned while the table scrolls (defaults to true). */
  stickyHeader?: boolean;
  /** Stable key to persist column visibility + sorting across visits. */
  preferenceKey?: string;
};

export function DataTable<TData>({
  columns,
  data,
  getRowId,
  minWidth,
  exportFilename,
  bulkActions,
  expandContent,
  footerLabel,
  stickyHeader = true,
  preferenceKey,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>(() =>
    loadPreference<SortingState>(preferenceKey, "sorting", []),
  );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() =>
    loadPreference<VisibilityState>(preferenceKey, "visibility", {}),
  );
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [bulkPending, setBulkPending] = useState(false);

  useEffect(() => {
    savePreference(preferenceKey, "sorting", sorting);
  }, [preferenceKey, sorting]);
  useEffect(() => {
    savePreference(preferenceKey, "visibility", columnVisibility);
  }, [preferenceKey, columnVisibility]);

  const baseColumns: ColumnDef<TData, unknown>[] = columns;
  const columnsWithTools: ColumnDef<TData, unknown>[] = [
    ...(bulkActions && bulkActions.length > 0
      ? [
          {
            id: "_table_selection",
            enableSorting: false,
            size: 40,
            meta: { csv: { exclude: true } } satisfies ColumnMetaShape,
            header: ({ table }: { table: Table<Record<string, unknown>> }) => (
              <SelectionHeader table={table} />
            ),
            cell: ({ row }: { row: Row<TData> }) => (
              <SelectionCell row={row} />
            ),
          } as ColumnDef<TData, unknown>,
        ]
      : []),
    ...(expandContent
      ? [
          {
            id: "_table_expander",
            enableSorting: false,
            size: 40,
            meta: { csv: { exclude: true } } satisfies ColumnMetaShape,
            header: () => null,
            cell: ({ row }: { row: Row<TData> }) => (
              <button
                type="button"
                aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
                aria-expanded={row.getIsExpanded()}
                onClick={row.getToggleExpandedHandler()}
                className="inline-flex h-7 w-7 -translate-x-1 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronRightIcon
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    row.getIsExpanded() && "rotate-90",
                  )}
                />
              </button>
            ),
          } as ColumnDef<TData, unknown>,
        ]
      : []),
    ...baseColumns,
  ];

  const table = useReactTable<TData>({
    data,
    columns: columnsWithTools,
    state: {
      sorting,
      rowSelection,
      columnVisibility,
      expanded,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableMultiSort: true,
    getExpandedRowModel: expandContent ? getExpandedRowModel() : undefined,
    getRowCanExpand: expandContent ? () => true : undefined,
    getRowId,
  });

  const rows = table.getRowModel().rows;
  const visibleLeafColumns = table.getVisibleLeafColumns();
  const selectedRows = table.getSelectedRowModel().rows.map(
    (row) => row.original,
  );
  const selectedCount = selectedRows.length;
  const footerRows = rows.map((row) => row.original);
  const hasFooter =
    footerLabel != null ||
    visibleLeafColumns.some(
      (column) => (column.columnDef.meta as ColumnMetaShape | undefined)?.footer,
    );

  function headerLabel(column: Column<TData, unknown>): string {
    const meta = column.columnDef.meta as ColumnMetaShape | undefined;
    if (meta?.csv?.header) {
      return meta.csv.header;
    }
    if (typeof column.columnDef.header === "string") {
      return column.columnDef.header;
    }
    return column.columnDef.id ?? column.id;
  }

  function exportColumns(): Column<TData, unknown>[] {
    return visibleLeafColumns.filter((column) => {
      if (column.id.startsWith("_table_")) {
        return false;
      }
      const meta = column.columnDef.meta as ColumnMetaShape | undefined;
      return !meta?.csv?.exclude;
    });
  }

  function csvValue(row: TData, column: Column<TData, unknown>): string {
    const meta = column.columnDef.meta as ColumnMetaShape | undefined;
    if (meta?.csv?.value) {
      const value = meta.csv.value(row);
      return value == null ? "" : String(value);
    }
    const def = column.columnDef as ColumnDefResolved<TData, unknown>;
    const key = def.accessorKey;
    if (key) {
      const value = (row as Record<string, unknown>)[key];
      if (value == null) {
        return "";
      }
      return typeof value === "object" ? JSON.stringify(value) : String(value);
    }
    return "";
  }

  function csvCell(value: string): string {
    if (/[",\n]/.test(value)) {
      return `"${value.replaceAll('"', '""')}"`;
    }
    return value;
  }

  function handleExport() {
    const columnsToExport = exportColumns();
    const header = columnsToExport.map(headerLabel).join(",");
    const body = rows
      .map((row) =>
        columnsToExport
          .map((column) => csvCell(csvValue(row.original, column)))
          .join(","),
      )
      .join("\n");
    const blob = new Blob([`\uFEFF${header}\n${body}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = exportFilename ?? "table-export.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  async function runBulkAction(action: BulkAction<TData>) {
    setBulkPending(true);
    try {
      await action.onAction(selectedRows);
    } finally {
      setBulkPending(false);
      setRowSelection({});
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-3 py-2">
        {selectedCount > 0 ? (
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="text-xs font-semibold tabular-nums">
              {selectedCount} selected
            </span>
            {bulkActions?.map((action) => (
              <Button
                key={action.label}
                size="sm"
                variant={
                  action.variant === "destructive" ? "destructive" : "outline"
                }
                onClick={() => runBulkAction(action)}
                loading={bulkPending}
                disabled={bulkPending}
              >
                {action.label}
              </Button>
            ))}
            <ToolIconButton
              label="Clear selection"
              onClick={() => setRowSelection({})}
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </ToolIconButton>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground tabular-nums">
            {rows.length} results
          </span>
        )}
        <div className="flex shrink-0 items-center gap-1">
          {exportFilename ? (
            <ToolIconButton label="Export current view as CSV" onClick={handleExport}>
              <DownloadIcon />
            </ToolIconButton>
          ) : null}
          <ColumnVisibilityMenu table={table as unknown as Table<Record<string, unknown>>} />
        </div>
      </div>

      <div
        className={stickyHeader ? "max-h-[62vh] overflow-auto" : "overflow-x-auto"}
      >
        <table
          className="w-full text-left text-sm"
          style={minWidth ? { minWidth } : undefined}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
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
                        "sticky top-0 z-10 border-b border-border bg-muted first:border-l-0 border-l border-border/30 first:pl-4 last:pr-4 px-3 py-3 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase whitespace-nowrap",
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
            {rows.flatMap((row) => {
              const mainRow = (
                <tr
                  key={row.id}
                  className="group/row relative border-b border-border/50 transition-colors duration-150 hover:bg-muted/40 hover:shadow-[inset_3px_0_0_0_var(--accent)] last:border-0"
                >
                  {row.getVisibleCells().map((cell) => {
                    const align = (cell.column.columnDef.meta as
                      | ColumnMetaShape
                      | undefined)?.align;
                    return (
                      <td
                        key={cell.id}
                        className={cn(
                          "first:border-l-0 border-l border-border/30 first:pl-4 last:pr-4 px-3 py-2 transition-colors",
                          cellAlign(align),
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    );
                  })}
                </tr>
              );

              if (!expandContent || !row.getIsExpanded()) {
                return [mainRow];
              }

              return [
                mainRow,
                <tr key={`${row.id}:expanded`}>
                  <td
                    colSpan={visibleLeafColumns.length}
                    className="border-b border-border/50 bg-muted/20 px-5 py-4"
                  >
                    {expandContent({ row })}
                  </td>
                </tr>,
              ];
            })}
          </tbody>
          {hasFooter ? (
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/40">
                {visibleLeafColumns.map((column, index) => {
                  const meta = column.columnDef.meta as
                    | ColumnMetaShape<TData>
                    | undefined;
                  const align =
                    meta?.align === "right" ? "text-right" : "text-left";
                  let content: ReactNode = null;
                  if (index === 0 && footerLabel != null) {
                    content = (
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {footerLabel}
                      </span>
                    );
                  } else if (meta?.footer) {
                    content = (
                      <span className="font-semibold tabular-nums">
                        {meta.footer(footerRows)}
                      </span>
                    );
                  }
                  return (
                    <td
                      key={column.id}
                      className={cn(
                        "first:pl-5 last:pr-5 px-4 py-3",
                        align,
                      )}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
    </div>
  );
}