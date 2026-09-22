import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { RecentOrdersTable, type RecentOrderRow } from "./recent-orders-table";
import { BagIcon } from "@/components/admin/admin-icons";
import type { DashboardOrderSummary } from "@/lib/services/dashboard-service";

export function RecentOrders({ orders }: { orders: DashboardOrderSummary }) {
  const rows: RecentOrderRow[] = orders.recent.map((order) => ({
    ...order,
    _id: order._id.toString(),
    items: order.items.map((item) => ({ quantity: item.quantity })),
  }));

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 pb-4">
        <div className="flex items-center gap-2.5">
          <BagIcon className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Recent orders</CardTitle>
        </div>
        <a
          href="/admin/orders"
          className="text-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          View all
        </a>
      </CardHeader>
      <CardContent className="p-0 pt-0">
        {orders.total === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No orders yet"
              description="When customers place orders they will appear here, newest first, including payment and fulfilment status."
            />
          </div>
        ) : (
          <RecentOrdersTable rows={rows} />
        )}
      </CardContent>
      {orders.total > 0 ? (
        <CardFooter className="border-t border-border px-3 py-2.5">
          <p className="text-xs text-muted-foreground">
            Showing the {Math.min(orders.recent.length, 6)} most recent orders.
          </p>
        </CardFooter>
      ) : null}
    </Card>
  );
}