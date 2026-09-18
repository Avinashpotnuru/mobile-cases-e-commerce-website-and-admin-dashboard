import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DistributionBar, formatCount, type ChartSegment } from "./charts";
import { PackageIcon } from "@/components/admin/admin-icons";

function Stat({
  label,
  value,
  tone = "foreground",
}: {
  label: string;
  value: number;
  tone?: "foreground" | "accent" | "destructive" | "success";
}) {
  const valueClass = {
    foreground: "text-foreground",
    accent: "text-accent",
    destructive: "text-destructive",
    success: "text-success",
  }[tone];
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`font-display text-[22px] font-semibold tabular-nums ${valueClass}`}>
        {formatCount(value)}
      </p>
    </div>
  );
}

export function InventoryInsights({
  inventory,
}: {
  inventory: {
    items: number;
    unitsInStock: number;
    lowStock: number;
    outOfStock: number;
  };
}) {
  const healthy = Math.max(
    inventory.items - inventory.lowStock - inventory.outOfStock,
    0,
  );
  const segments: ChartSegment[] = [
    {
      key: "healthy",
      label: "Healthy",
      value: healthy,
      color: "bg-success",
    },
    {
      key: "low",
      label: "Low stock",
      value: inventory.lowStock,
      color: "bg-accent",
    },
    {
      key: "out",
      label: "Out of stock",
      value: inventory.outOfStock,
      color: "bg-destructive",
    },
  ];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 pb-4">
        <div className="flex items-center gap-2.5">
          <PackageIcon className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Inventory health</CardTitle>
        </div>
        <Link
          href="/admin/inventory"
          className="text-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Manage stock
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
        <div className="min-w-0 flex-1">
          <DistributionBar segments={segments} />
        </div>
        <div className="grid shrink-0 grid-cols-2 gap-x-10 gap-y-6 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          <Stat label="Tracked items" value={inventory.items} />
          <Stat
            label="Units in stock"
            value={inventory.unitsInStock}
            tone="success"
          />
          <Stat label="Low stock" value={inventory.lowStock} tone="accent" />
          <Stat
            label="Out of stock"
            value={inventory.outOfStock}
            tone="destructive"
          />
        </div>
      </CardContent>
    </Card>
  );
}