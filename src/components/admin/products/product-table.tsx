"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { ProductStatusBadge } from "@/components/admin/status-badge";
import {
  brandNamesOfProduct,
  compatibleModelNamesOf,
  formatPrice,
} from "@/components/admin/catalog-utils";
import type { BrandRow, MobileModelRow, ProductRow, StockRow } from "@/types/catalog";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

type AvailabilityTone = "success" | "secondary" | "destructive" | "low";

function availabilityOf(stock: StockRow | undefined): {
  label: string;
  tone: AvailabilityTone;
} {
  if (!stock) {
    return { label: "No stock record", tone: "secondary" };
  }
  if (stock.quantity === 0) {
    return { label: "Out of stock", tone: "destructive" };
  }
  if (stock.quantity <= stock.lowStockThreshold) {
    return { label: `Low stock · ${stock.quantity}`, tone: "low" };
  }
  return { label: `In stock · ${stock.quantity}`, tone: "success" };
}

export function ProductTable({
  products,
  brands,
  models,
  stockMap,
  onEdit,
  onArchive,
}: {
  products: ProductRow[];
  brands: BrandRow[];
  models: MobileModelRow[];
  stockMap: Record<string, StockRow>;
  onEdit: (product: ProductRow) => void;
  onArchive: (product: ProductRow) => void;
}) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="No products found"
        description="Try adjusting your search or filters, or add a new product."
      />
    );
  }

  return (
    <div className="rounded-md border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="px-4 py-3 font-medium">
                Product
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Brand
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Compatible models
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Price
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Availability
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
            {products.map((product) => {
              const brandsOfProduct = brandNamesOfProduct(
                product,
                models,
                brands,
              );
              const compatNames = compatibleModelNamesOf(product, models);
              const availability = availabilityOf(stockMap[product._id]);
              const thumbnail = product.images[0];
              return (
                <tr
                  key={product._id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-10 w-10 shrink-0 overflow-hidden rounded-sm border border-border bg-muted">
                        {thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumbnail}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </span>
                      <div className="min-w-0">
                        <p className="max-w-[220px] truncate font-medium">
                          {product.name}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {product.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="max-w-[160px] truncate text-muted-foreground">
                      {brandsOfProduct.length
                        ? brandsOfProduct.join(", ")
                        : "\u2014"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="max-w-[200px] truncate text-muted-foreground">
                      {compatNames.length
                        ? `${compatNames.slice(0, 2).join(", ")}${
                            compatNames.length > 2
                              ? ` +${compatNames.length - 2}`
                              : ""
                          }`
                        : "\u2014"}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-medium tabular-nums">
                    {formatPrice(product.priceCents, product.currency)}
                  </td>
                  <td className="px-4 py-3">
                    {availability.tone === "low" ? (
                      <Badge
                        variant="outline"
                        className="border-amber-300 bg-amber-50 text-amber-800"
                      >
                        {availability.label}
                      </Badge>
                    ) : (
                      <Badge variant={availability.tone}>
                        {availability.label}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ProductStatusBadge status={product.status} />
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {dateFormatter.format(new Date(product.updatedAt))}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(product)}
                      >
                        Edit
                      </Button>
                      {product.status !== "archived" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onArchive(product)}
                        >
                          Archive
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}