"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ActiveStatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/data-table";
import { EmptyState } from "@/components/ui/states";
import type { MobileModelRow } from "@/types/catalog";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function columns({
  brandNames,
  onEdit,
  onDeactivate,
}: {
  brandNames: Record<string, string>;
  onEdit: (model: MobileModelRow) => void;
  onDeactivate: (model: MobileModelRow) => void;
}): ColumnDef<MobileModelRow, unknown>[] {
  return [
    {
      accessorKey: "name",
      enableSorting: true,
      header: "Model",
      cell: (info) => (
        <span className="font-medium">{info.getValue<string>()}</span>
      ),
    },
    {
      accessorFn: (model) => brandNames[model.brandId] ?? "",
      enableSorting: true,
      header: "Brand",
      cell: (info) => (
        <span className="text-muted-foreground">
          {info.getValue<string>() || "\u2014"}
        </span>
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
      accessorKey: "status",
      header: "Status",
      cell: (info) => (
        <ActiveStatusBadge
          active={info.getValue<MobileModelRow["status"]>() === "active"}
        />
      ),
    },
    {
      accessorFn: (model) => new Date(model.updatedAt).getTime(),
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

export function MobileModelTable({
  models,
  brandNames,
  onEdit,
  onDeactivate,
}: {
  models: MobileModelRow[];
  brandNames: Record<string, string>;
  onEdit: (model: MobileModelRow) => void;
  onDeactivate: (model: MobileModelRow) => void;
}) {
  if (models.length === 0) {
    return (
      <EmptyState
        title="No models found"
        description="Try adjusting your search or filters, or add a new model."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <DataTable
        columns={columns({ brandNames, onEdit, onDeactivate })}
        data={models}
        getRowId={(model) => model._id}
        minWidth={760}
      />
    </div>
  );
}