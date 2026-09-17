"use client";

import { ActiveStatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import type { BrandRow } from "@/types/catalog";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

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
    <div className="rounded-md border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="px-4 py-3 font-medium">
                Brand
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Slug
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Description
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
            {brands.map((brand) => (
              <tr
                key={brand._id}
                className="border-b border-border last:border-0"
              >
                <td className="px-4 py-3 font-medium">{brand.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {brand.slug}
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                  {brand.description || "\u2014"}
                </td>
                <td className="px-4 py-3">
                  <ActiveStatusBadge active={brand.status === "active"} />
                </td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">
                  {dateFormatter.format(new Date(brand.updatedAt))}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(brand)}
                    >
                      Edit
                    </Button>
                    {brand.status === "active" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeactivate(brand)}
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