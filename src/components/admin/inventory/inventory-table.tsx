"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ActiveStatusBadge } from "@/components/admin/status-badge";
import { StockLevelBadge } from "@/components/admin/inventory/stock-status";
import { DataTable } from "@/components/admin/data-table";
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
      meta: { align: "right" },
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
      cell: (info) => (
        <ActiveStatusBadge
          active={info.getValue<InventoryAdminRow["status"]>() === "active"}
        />
      ),
    },
    {
      accessorFn: (row) => new Date(row.updatedAt).getTime(),
      enableSorting: true,
      meta: { align: "right" },
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
      meta: { align: "right" },
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
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <DataTable
        columns={columns({ onManage })}
        data={rows}
        getRowId={(row) => row._id}
        minWidth={880}
      />
    </div>
  );
}