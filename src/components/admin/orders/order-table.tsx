"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/data-table";
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

function columns({
  onView,
}: {
  onView: (order: OrderListItem) => void;
}): ColumnDef<OrderListItem, unknown>[] {
  return [
    {
      accessorKey: "orderNumber",
      enableSorting: true,
      header: "Order",
      cell: (info) => (
        <span className="font-mono text-xs font-semibold">
          {info.getValue<string>()}
        </span>
      ),
    },
    {
      accessorFn: (order) =>
        `${order.customer.firstName} ${order.customer.lastName}`,
      enableSorting: true,
      header: "Customer",
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="max-w-[220px] truncate">
            {row.original.customer.firstName} {row.original.customer.lastName}
          </p>
          <p className="max-w-[220px] truncate font-mono text-xs text-muted-foreground">
            {row.original.customer.email}
          </p>
        </div>
      ),
    },
    {
      accessorFn: (order) => itemCount(order),
      enableSorting: true,
      meta: { align: "right" },
      header: "Items",
      cell: (info) => (
        <span className="tabular-nums text-muted-foreground">
          {info.getValue<number>()}
        </span>
      ),
    },
    {
      accessorKey: "totalCents",
      enableSorting: true,
      meta: { align: "right" },
      header: "Total",
      cell: ({ row }) => (
        <span className="font-medium tabular-nums">
          {formatPrice(row.original.totalCents, row.original.currency)}
        </span>
      ),
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => (
        <PaymentStatusBadge status={row.original.paymentStatus} />
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
    },
    {
      accessorFn: (order) => new Date(order.createdAt).getTime(),
      enableSorting: true,
      meta: { align: "right" },
      header: "Placed",
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {dateFormatter.format(new Date(row.original.createdAt))}
        </span>
      ),
    },
    {
      id: "actions",
      enableSorting: false,
      meta: { align: "right" },
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(row.original)}
          >
            View
          </Button>
        </div>
      ),
    },
  ];
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
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <DataTable
        columns={columns({ onView })}
        data={orders}
        getRowId={(order) => order._id}
        minWidth={1080}
      />
    </div>
  );
}