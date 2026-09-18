"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/status-badge";
import { formatPrice } from "@/components/admin/catalog-utils";
import type { OrderListItem } from "@/types/orders";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function itemCount(order: OrderListItem): number {
  return order.items.reduce((total, item) => total + item.quantity, 0);
}

export function OrderTable({
  orders,
  onView,
}: {
  orders: OrderListItem[];
  onView: (order: OrderListItem) => void;
}) {
  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders found"
        description="Try adjusting your search or filters."
      />
    );
  }

  return (
    <div className="rounded-md border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="px-4 py-3 font-medium">
                Order
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Customer
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Items
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Total
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Payment
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Status
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Placed
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order._id}
                className="border-b border-border last:border-0"
              >
                <td className="px-4 py-3">
                  <p className="font-mono text-xs font-semibold">
                    {order.orderNumber}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="max-w-[220px] truncate">
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                  <p className="max-w-[220px] truncate font-mono text-xs text-muted-foreground">
                    {order.customer.email}
                  </p>
                </td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">
                  {itemCount(order)}
                </td>
                <td className="px-4 py-3 font-medium tabular-nums">
                  {formatPrice(order.totalCents, order.currency)}
                </td>
                <td className="px-4 py-3">
                  <PaymentStatusBadge status={order.paymentStatus} />
                </td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">
                  {dateFormatter.format(new Date(order.createdAt))}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(order)}
                    >
                      View
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}