"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ActiveStatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/data-table";
import { EmptyState } from "@/components/ui/states";
import type { BrandRow } from "@/types/catalog";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function columns({
  onEdit,
  onDeactivate,
}: {
  onEdit: (brand: BrandRow) => void;
  onDeactivate: (brand: BrandRow) => void;
}): ColumnDef<BrandRow, unknown>[] {
  return [
    {
      accessorKey: "name",
      enableSorting: true,
      header: "Brand",
      cell: (info) => (
        <span className="font-medium">{info.getValue<string>()}</span>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: (info) => (
        <span className="font-mono text-xs text-muted-foreground">
          {info.getValue<string>()}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: (info) => {
        const value = info.getValue<string>();
        return (
          <p className="max-w-xs truncate text-muted-foreground">
            {value || "\u2014"}
          </p>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => (
        <ActiveStatusBadge active={info.getValue<BrandRow["status"]>() === "active"} />
      ),
    },
    {
      accessorFn: (brand) => new Date(brand.updatedAt).getTime(),
      enableSorting: true,
      meta: { align: "right" },
      header: "Updated",
      cell: (info) => (
        <span className="tabular-nums text-muted-foreground">
          {dateFormatter.format(new Date(info.getValue<number>()))}
        </span>
      ),
    },
    {
      id: "actions",
      enableSorting: false,
      meta: { align: "right" },
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row.original)}
          >
            Edit
          </Button>
          {row.original.status === "active" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeactivate(row.original)}
            >
              Archive
            </Button>
          ) : null}
        </div>
      ),
    },
  ];
}

export function BrandTable({
  brands,
  onEdit,
  onDeactivate,
}: {
  brands: BrandRow[];
  onEdit: (brand: BrandRow) => void;
  onDeactivate: (brand: BrandRow) => void;
}) {
  if (brands.length === 0) {
    return (
      <EmptyState
        title="No brands found"
        description="Try adjusting your search or filters, or add a new brand."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <DataTable
        columns={columns({ onEdit, onDeactivate })}
        data={brands}
        getRowId={(brand) => brand._id}
        minWidth={720}
      />
    </div>
  );
}