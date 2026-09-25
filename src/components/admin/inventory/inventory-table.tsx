"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ActiveStatusBadge } from "@/components/admin/status-badge";
import { StockLevelBadge } from "@/components/admin/inventory/stock-status";
import { DataTable, type ColumnMetaShape } from "@/components/admin/data-table";
import type { InventoryAdminRow } from "@/types/catalog";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function modelSummary(modelNames: string[]): string {
  if (modelNames.length === 0) return "—";
  if (modelNames.length <= 2) return modelNames.join(", ");
  return `${modelNames.slice(0, 2).join(", ")} +${modelNames.length - 2} more`;
}

function columns({
  onManage,
}: {
  onManage: (row: InventoryAdminRow) => void;
}): ColumnDef<InventoryAdminRow, unknown>[] {
  return [
    {
      accessorFn: (row) => row.productName,
      enableSorting: true,
      header: "Product",
      meta: {
        csv: { header: "Product", value: (row) => row.productName },
      } satisfies ColumnMetaShape<InventoryAdminRow>,
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="font-medium">{row.original.productName}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.productSlug}
          </p>
        </div>
      ),
    },
    {
      accessorFn: (row) => row.modelNames.join(", "),
      header: "Compatible models",
      meta: {
        csv: {
          header: "Compatible models",
          value: (row) => row.modelNames.join(", "),
        },
      } satisfies ColumnMetaShape<InventoryAdminRow>,
      cell: ({ row }) => (
        <p
          className="max-w-[220px] truncate text-muted-foreground"
          title={row.original.modelNames.join(", ")}
        >
          {modelSummary(row.original.modelNames)}
        </p>
      ),
    },
    {
      accessorKey: "quantity",
      enableSorting: true,
      meta: {
        align: "right",
        footer: (rows) =>
          rows.reduce((sum, row) => sum + row.quantity, 0),
      } satisfies ColumnMetaShape<InventoryAdminRow>,
      header: "Available stock",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <StockLevelBadge
            quantity={row.original.quantity}
            lowStockThreshold={row.original.lowStockThreshold}
          />
        </div>
      ),
    },
    {
      accessorKey: "lowStockThreshold",
      enableSorting: true,
      meta: { align: "right" },
      header: "Low-stock threshold",
      cell: (info) => (
        <span className="tabular-nums text-muted-foreground">
          {info.getValue<number>()}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      meta: {
        csv: { header: "Status", value: (row) => row.status },
      } satisfies ColumnMetaShape<InventoryAdminRow>,
      cell: (info) => (
        <ActiveStatusBadge
          active={info.getValue<InventoryAdminRow["status"]>() === "active"}
        />
      ),
    },
    {
      accessorFn: (row) => new Date(row.updatedAt).getTime(),
      enableSorting: true,
      meta: {
        align: "right",
        csv: { header: "Updated", value: (row) => row.updatedAt },
      } satisfies ColumnMetaShape<InventoryAdminRow>,
      header: "Updated",
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {formatDate(row.original.updatedAt)}
        </span>
      ),
    },
    {
      id: "actions",
      enableSorting: false,
      meta: { align: "right", csv: { exclude: true } },
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onManage(row.original)}
          >
            Manage
          </Button>
        </div>
      ),
    },
  ];
}

export function InventoryTable({
  rows,
  onManage,
}: {
  rows: InventoryAdminRow[];
  onManage: (row: InventoryAdminRow) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <DataTable
        columns={columns({ onManage })}
        data={rows}
        getRowId={(row) => row._id}
        minWidth={880}
        preferenceKey="inventory"
        exportFilename="inventory.csv"
        footerLabel="Total"
        expandContent={({ row }) => {
          const item = row.original;
          return (
            <div className="grid gap-x-8 gap-y-5 text-sm sm:grid-cols-4">
              <dl className="space-y-0.5">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Product
                </dt>
                <dd className="font-medium">{item.productName}</dd>
                <dd className="font-mono text-xs break-all text-muted-foreground">
                  {item.productSlug}
                </dd>
              </dl>
              <dl className="space-y-0.5">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Stock
                </dt>
                <dd className="tabular-nums">{item.quantity} units available</dd>
                <dd className="text-xs text-muted-foreground">
                  Low-stock alert at {item.lowStockThreshold}
                </dd>
              </dl>
              <dl className="space-y-0.5">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Status
                </dt>
                <dd className="capitalize">{item.status}</dd>
                <dd className="text-xs text-muted-foreground">
                  Updated {formatDate(item.updatedAt)}
                </dd>
              </dl>
              <dl className="space-y-0.5">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Compatible models
                </dt>
                <dd>
                  {item.modelNames.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {item.modelNames.map((name) => (
                        <span
                          key={name}
                          className="rounded-full border border-border bg-card px-2 py-0.5 text-xs"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    "\u2014"
                  )}
                </dd>
              </dl>
            </div>
          );
        }}
      />
    </div>
  );
}