"use client";

import { Button } from "@/components/ui/button";
import { ActiveStatusBadge } from "@/components/admin/status-badge";
import { StockLevelBadge } from "@/components/admin/inventory/stock-status";
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

export function InventoryTable({
  rows,
  onManage,
}: {
  rows: InventoryAdminRow[];
  onManage: (row: InventoryAdminRow) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[880px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 font-medium text-muted-foreground">
              Product
            </th>
            <th className="px-4 py-3 font-medium text-muted-foreground">
              Compatible models
            </th>
            <th className="px-4 py-3 font-medium text-muted-foreground">
              Available stock
            </th>
            <th className="px-4 py-3 font-medium text-muted-foreground">
              Low-stock threshold
            </th>
            <th className="px-4 py-3 font-medium text-muted-foreground">
              Status
            </th>
            <th className="px-4 py-3 font-medium text-muted-foreground">
              Updated
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row._id}
              className="border-b border-border last:border-0 hover:bg-muted/40"
            >
              <td className="px-4 py-3">
                <p className="font-medium">{row.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {row.productSlug}
                </p>
              </td>
              <td
                className="px-4 py-3 text-muted-foreground"
                title={row.modelNames.join(", ")}
              >
                {modelSummary(row.modelNames)}
              </td>
              <td className="px-4 py-3">
                <StockLevelBadge
                  quantity={row.quantity}
                  lowStockThreshold={row.lowStockThreshold}
                />
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {row.lowStockThreshold}
              </td>
              <td className="px-4 py-3">
                <ActiveStatusBadge active={row.status === "active"} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatDate(row.updatedAt)}
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onManage(row)}
                >
                  Manage
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}