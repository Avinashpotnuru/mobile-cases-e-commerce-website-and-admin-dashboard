import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BoxIcon } from "./kpi-icons";

function Row({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number;
  hint?: string;
  tone: "foreground" | "accent" | "destructive";
}) {
  const valueClasses =
    tone === "accent"
      ? "text-accent"
      : tone === "destructive"
        ? "text-destructive"
        : undefined;
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <p className="flex items-baseline gap-2 tabular-nums">
        <span className={`font-display text-xl font-semibold ${valueClasses ?? ""}`}>
          {value}
        </span>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </p>
    </div>
  );
}

export function InventorySummary({
  inventory,
}: {
  inventory: {
    items: number;
    unitsInStock: number;
    lowStock: number;
    outOfStock: number;
  };
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 pb-3">
        <CardTitle>Stock</CardTitle>
        <BoxIcon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="divide-y divide-border">
        <Row
          label="Units in stock"
          value={inventory.unitsInStock}
          hint="across tracked items"
          tone="foreground"
        />
        <Row
          label="Low stock"
          value={inventory.lowStock}
          hint="below threshold"
          tone="accent"
        />
        <Row
          label="Out of stock"
          value={inventory.outOfStock}
          hint="zero units"
          tone="destructive"
        />
        <Row label="Tracked items" value={inventory.items} tone="foreground" />
      </CardContent>
    </Card>
  );
}