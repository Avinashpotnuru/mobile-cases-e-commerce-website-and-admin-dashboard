"use client";

import { ActiveStatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import type { MobileModelRow } from "@/types/catalog";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

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
    <div className="rounded-md border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="px-4 py-3 font-medium">
                Model
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Brand
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Slug
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Status
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Updated
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {models.map((model) => (
              <tr
                key={model._id}
                className="border-b border-border last:border-0"
              >
                <td className="px-4 py-3 font-medium">{model.name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {brandNames[model.brandId] ?? "\u2014"}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {model.slug}
                </td>
                <td className="px-4 py-3">
                  <ActiveStatusBadge active={model.status === "active"} />
                </td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">
                  {dateFormatter.format(new Date(model.updatedAt))}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(model)}
                    >
                      Edit
                    </Button>
                    {model.status === "active" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeactivate(model)}
                      >
                        Archive
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}