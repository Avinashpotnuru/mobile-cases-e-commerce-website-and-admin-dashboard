import Link from "next/link";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayersIcon } from "./kpi-icons";

function SummaryRow({
  label,
  value,
  detail,
  href,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  href?: string;
  valueClassName?: string;
}) {
  const text = (
    <p className="min-w-0 truncate font-display text-xl font-semibold tabular-nums">
      <span className={valueClassName}>{value}</span>
      {detail ? (
        <span className="ml-2 text-sm font-medium text-muted-foreground">
          {detail}
        </span>
      ) : null}
    </p>
  );
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      {href ? <Link href={href}>{text}</Link> : text}
    </div>
  );
}

function SummaryRows({ children }: { children: ReactNode }) {
  return <div className="divide-y divide-border">{children}</div>;
}

export function CatalogSummary({
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
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 pb-3">
        <CardTitle>Catalog</CardTitle>
        <LayersIcon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <SummaryRows>
          <SummaryRow
            label="Brands"
            value={catalog.brands}
            href="/admin/brands"
            detail="total"
          />
          <SummaryRow
            label="Mobile models"
            value={catalog.models}
            href="/admin/models"
            detail="total"
          />
          <SummaryRow
            label="Products"
            value={catalog.products}
            href="/admin/products"
            detail={`${catalog.activeProducts} active · ${catalog.draftProducts} draft`}
          />
        </SummaryRows>
      </CardContent>
    </Card>
  );
}