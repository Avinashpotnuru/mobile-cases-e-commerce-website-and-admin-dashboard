import Link from "next/link";
import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DistributionBar, type ChartSegment } from "./charts";
import { ChevronRightIcon, LayersIcon } from "@/components/admin/admin-icons";

function InsightRow({
  label,
  value,
  href,
  detail,
}: {
  label: string;
  value: ReactNode;
  href?: string;
  detail?: ReactNode;
}) {
  const text = (
    <span className="flex items-baseline gap-2">
      <span className="font-display text-xl font-semibold tabular-nums">
        {value}
      </span>
      {detail ? (
        <span className="text-xs font-medium text-muted-foreground">
          {detail}
        </span>
      ) : null}
    </span>
  );
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      {href ? (
        <Link
          href={href}
          className="group flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {text}
          <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5" />
        </Link>
      ) : (
        text
      )}
    </div>
  );
}

export function CatalogInsights({
  catalog,
}: {
  catalog: {
    brands: number;
    models: number;
    products: number;
    activeProducts: number;
    draftProducts: number;
  };
}) {
  const archived = Math.max(catalog.products - catalog.activeProducts - catalog.draftProducts, 0);
  const segments: ChartSegment[] = [
    {
      key: "active",
      label: "Active",
      value: catalog.activeProducts,
      color: "bg-accent",
    },
    {
      key: "draft",
      label: "Draft",
      value: catalog.draftProducts,
      color: "bg-muted",
    },
    {
      key: "archived",
      label: "Archived",
      value: archived,
      color: "bg-border",
    },
  ];

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-center justify-between gap-3 pb-4">
        <div className="flex items-center gap-2.5">
          <LayersIcon className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Catalog insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-5">
        <p className="text-sm text-muted-foreground">
          Distribution of products by publication state.
        </p>
        <DistributionBar segments={segments} />
        <div className="mt-auto divide-y divide-border border-t border-border">
          <InsightRow
            label="Products"
            value={catalog.products}
            href="/admin/products"
            detail="total"
          />
          <InsightRow
            label="Mobile models"
            value={catalog.models}
            href="/admin/models"
            detail="total"
          />
          <InsightRow
            label="Brands"
            value={catalog.brands}
            href="/admin/brands"
            detail="total"
          />
        </div>
      </CardContent>
    </Card>
  );
}