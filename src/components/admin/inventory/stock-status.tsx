import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/cn";

export function StockLevelBadge({
  quantity,
  lowStockThreshold,
}: {
  quantity: number;
  lowStockThreshold: number;
}) {
  if (quantity === 0) {
    return <Badge variant="destructive">Out of stock</Badge>;
  }
  if (quantity <= lowStockThreshold) {
    return (
      <Badge
        variant="outline"
        className={cn("border-amber-400 bg-amber-50 text-amber-800")}
      >
        Low stock · {quantity}
      </Badge>
    );
  }
  return <Badge variant="success">In stock · {quantity}</Badge>;
}