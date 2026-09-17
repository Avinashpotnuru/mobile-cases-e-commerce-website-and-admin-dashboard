import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { formatPrice } from "@/components/storefront/home/price";
import { BagIcon } from "./kpi-icons";
import type {
  DashboardOrderSummary,
  RecentOrder,
} from "@/lib/services/dashboard-service";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function orderCount(order: RecentOrder): number {
  return order.items.reduce((total, item) => total + item.quantity, 0);
}

function statusBadge(status: RecentOrder["status"]) {
  if (status === "confirmed") {
    return <Badge variant="success">Confirmed</Badge>;
  }
  if (status === "cancelled") {
    return <Badge variant="destructive">Cancelled</Badge>;
  }
  return <Badge variant="outline">Pending</Badge>;
}

function paymentBadge(paymentStatus: RecentOrder["paymentStatus"]) {
  if (paymentStatus === "paid") {
    return <Badge variant="success">Paid</Badge>;
  }
  if (paymentStatus === "failed") {
    return <Badge variant="destructive">Failed</Badge>;
  }
  if (paymentStatus === "refunded") {
    return <Badge variant="secondary">Refunded</Badge>;
  }
  return <Badge variant="outline">Unpaid</Badge>;
}

export function RecentOrders({ orders }: { orders: DashboardOrderSummary }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 pb-4">
        <div className="flex items-center gap-3">
          <CardTitle>Recent orders</CardTitle>
          <BagIcon className="h-5 w-5 text-muted-foreground" />
        </div>
        <Link
          href="/admin/orders"
          className="text-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {orders.total === 0 ? (
          <EmptyState
            title="No orders yet"
            description="When customers place orders they will appear here, newest first, including payment and fulfilment status."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="px-3 py-2.5 font-medium">
                    Order
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-medium">
                    Customer
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-medium">
                    Items
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-medium">
                    Total
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-medium">
                    Payment
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-medium">
                    Placed
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.recent.map((order) => (
                  <tr
                    key={order._id.toString()}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-3 py-3 font-medium tabular-nums">
                      {order.orderNumber}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {order.customer.firstName} {order.customer.lastName}
                    </td>
                    <td className="px-3 py-3 tabular-nums text-muted-foreground">
                      {orderCount(order)}
                    </td>
                    <td className="px-3 py-3 font-medium tabular-nums">
                      {formatPrice({
                        priceCents: order.totalCents,
                        currency: order.currency,
                      })}
                    </td>
                    <td className="px-3 py-3">{paymentBadge(order.paymentStatus)}</td>
                    <td className="px-3 py-3">{statusBadge(order.status)}</td>
                    <td className="px-3 py-3 tabular-nums text-muted-foreground">
                      {dateFormatter.format(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}