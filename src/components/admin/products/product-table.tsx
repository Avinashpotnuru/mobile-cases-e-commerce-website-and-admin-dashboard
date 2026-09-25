"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnMetaShape } from "@/components/admin/data-table";
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

function columns({
  brands,
  models,
  stockMap,
  onEdit,
  onArchive,
}: {
  brands: BrandRow[];
  models: MobileModelRow[];
  stockMap: Record<string, StockRow>;
  onEdit: (product: ProductRow) => void;
  onArchive: (product: ProductRow) => void;
}): ColumnDef<ProductRow, unknown>[] {
  return [
    {
      accessorKey: "name",
      enableSorting: true,
      header: "Product",
      cell: ({ row }) => {
        const product = row.original;
        const thumbnail = product.images[0];
        return (
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border/70">
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
        );
      },
    },
    {
      accessorFn: (product) =>
        brandNamesOfProduct(product, models, brands).join(", "),
      enableSorting: true,
      header: "Brand",
      meta: {
        csv: {
          header: "Brand",
          value: (product) =>
            brandNamesOfProduct(product, models, brands).join(", "),
        },
      } satisfies ColumnMetaShape<ProductRow>,
      cell: ({ row }) => (
        <p className="max-w-[160px] truncate text-muted-foreground">
          {brandNamesOfProduct(row.original, models, brands).join(", ") ||
            "\u2014"}
        </p>
      ),
    },
    {
      accessorFn: (product) => compatibleModelNamesOf(product, models).join(", "),
      header: "Compatible models",
      meta: {
        csv: {
          header: "Compatible models",
          value: (product) => compatibleModelNamesOf(product, models).join(", "),
        },
      } satisfies ColumnMetaShape<ProductRow>,
      cell: ({ row }) => {
        const names = compatibleModelNamesOf(row.original, models);
        return (
          <p className="max-w-[200px] truncate text-muted-foreground">
            {names.length
              ? `${names.slice(0, 2).join(", ")}${
                  names.length > 2 ? ` +${names.length - 2}` : ""
                }`
              : "\u2014"}
          </p>
        );
      },
    },
    {
      accessorKey: "priceCents",
      enableSorting: true,
      meta: {
        align: "right",
        csv: {
          header: "Price",
          value: (product) =>
            formatPrice(product.priceCents, product.currency),
        },
      } satisfies ColumnMetaShape<ProductRow>,
      header: "Price",
      cell: ({ row }) => {
        const product = row.original;
        const isSale =
          product.marketingPriceCents !== undefined &&
          product.marketingPriceCents > product.priceCents;
        return (
          <span className="font-medium tabular-nums">
            {isSale ? (
              <>
                <span className="mr-1.5 text-xs text-muted-foreground line-through">
                  {formatPrice(product.marketingPriceCents ?? 0, product.currency)}
                </span>
                <span className="text-accent">
                  {formatPrice(product.priceCents, product.currency)}
                </span>
              </>
            ) : (
              formatPrice(product.priceCents, product.currency)
            )}
          </span>
        );
      },
    },
    {
      accessorFn: (product) => availabilityOf(stockMap[product._id]).label,
      header: "Availability",
      meta: {
        csv: {
          header: "Availability",
          value: (product) => availabilityOf(stockMap[product._id]).label,
        },
      } satisfies ColumnMetaShape<ProductRow>,
      cell: ({ row }) => {
        const availability = availabilityOf(stockMap[row.original._id]);
        return availability.tone === "low" ? (
          <Badge
            variant="outline"
            className="border-amber-300 bg-amber-50 text-amber-800"
          >
            {availability.label}
          </Badge>
        ) : (
          <Badge variant={availability.tone}>{availability.label}</Badge>
        );
      },
    },
    {
      accessorKey: "status",
      enableSorting: true,
      header: "Status",
      cell: ({ row }) => <ProductStatusBadge status={row.original.status} />,
    },
    {
      accessorFn: (product) => new Date(product.updatedAt).getTime(),
      enableSorting: true,
      meta: {
        align: "right",
        csv: { header: "Updated", value: (product) => product.updatedAt },
      } satisfies ColumnMetaShape<ProductRow>,
      header: "Updated",
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {dateFormatter.format(new Date(row.original.updatedAt))}
        </span>
      ),
    },
    {
      id: "actions",
      enableSorting: false,
      meta: { align: "right", csv: { exclude: true } },
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
          {row.original.status !== "archived" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onArchive(row.original)}
            >
              Archive
            </Button>
          ) : null}
        </div>
      ),
    },
  ];
}

function ProductExpand({
  product,
  models,
  stockMap,
}: {
  product: ProductRow;
  models: MobileModelRow[];
  stockMap: Record<string, StockRow>;
}) {
  const availability = availabilityOf(stockMap[product._id]);
  const modelNames = compatibleModelNamesOf(product, models);
  return (
    <div className="grid gap-x-8 gap-y-5 text-sm sm:grid-cols-3">
      <dl className="space-y-0.5">
        <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Product
        </dt>
        <dd className="font-medium">{product.name}</dd>
        <dd className="font-mono text-xs break-all text-muted-foreground">
          {product.slug}
        </dd>
      </dl>
      <dl className="space-y-0.5">
        <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Publication
        </dt>
        <dd className="capitalize">{product.status}</dd>
        <dt className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Availability
        </dt>
        <dd className={availability.tone === "low" ? "text-amber-600 dark:text-amber-400" : ""}>
          {availability.label}
        </dd>
      </dl>
      <dl className="space-y-0.5">
        <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Compatible models
        </dt>
        <dd>
          {modelNames.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {modelNames.map((name) => (
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
}

export function ProductTable({
  products,
  brands,
  models,
  stockMap,
  onEdit,
  onArchive,
  onBulkArchive,
}: {
  products: ProductRow[];
  brands: BrandRow[];
  models: MobileModelRow[];
  stockMap: Record<string, StockRow>;
  onEdit: (product: ProductRow) => void;
  onArchive: (product: ProductRow) => void;
  onBulkArchive: (products: ProductRow[]) => Promise<void> | void;
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
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <DataTable
        columns={columns({ brands, models, stockMap, onEdit, onArchive })}
        data={products}
        getRowId={(product) => product._id}
        minWidth={960}
        preferenceKey="products"
        exportFilename="products.csv"
        bulkActions={[
          {
            label: "Archive",
            variant: "outline",
            onAction: onBulkArchive,
          },
        ]}
        expandContent={({ row }) => (
          <ProductExpand
            product={row.original}
            models={models}
            stockMap={stockMap}
          />
        )}
      />
    </div>
  );
}