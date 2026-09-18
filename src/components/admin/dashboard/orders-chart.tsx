import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DonutChart, DistributionBar, type ChartSegment } from "./charts";
import { BagIcon } from "@/components/admin/admin-icons";
import type { DashboardOrderSummary } from "@/lib/services/dashboard-service";

export function OrdersChart({ orders }: { orders: DashboardOrderSummary }) {
  const statusSegments: ChartSegment[] = [
    {
      key: "pending",
      label: "Pending",
      value: orders.statusCounts.pending,
      color: "text-border",
    },
    {
      key: "confirmed",
      label: "Confirmed",
      value: orders.statusCounts.confirmed,
      color: "text-success",
    },
    {
      key: "cancelled",
      label: "Cancelled",
      value: orders.statusCounts.cancelled,
      color: "text-destructive",
    },
  ];

  const paymentSegments: ChartSegment[] = [
    {
      key: "paid",
      label: "Paid",
      value: orders.paymentCounts.paid,
      color: "bg-success",
    },
    {
      key: "unpaid",
      label: "Unpaid",
      value: orders.paymentCounts.unpaid,
      color: "bg-border",
    },
    {
      key: "failed",
      label: "Failed",
      value: orders.paymentCounts.failed,
      color: "bg-destructive",
    },
    {
      key: "refunded",
      label: "Refunded",
      value: orders.paymentCounts.refunded,
      color: "bg-secondary",
    },
  ];

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-center justify-between gap-3 pb-4">
        <div className="flex items-center gap-2.5">
          <BagIcon className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Orders overview</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-8">
        <DonutChart
          segments={statusSegments}
          centerLabel="orders"
          centerValue={orders.total}
        />
        <div className="border-t border-border pt-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Payment status
          </p>
          <DistributionBar segments={paymentSegments} />
        </div>
      </CardContent>
    </Card>
  );
}