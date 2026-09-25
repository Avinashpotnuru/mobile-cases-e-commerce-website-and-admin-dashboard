"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnMetaShape } from "@/components/admin/data-table";
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
      meta: {
        csv: {
          header: "Customer",
          value: (order) =>
            `${order.customer.firstName} ${order.customer.lastName}`,
        },
      } satisfies ColumnMetaShape<OrderListItem>,
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
      meta: {
        align: "right",
        csv: { header: "Items", value: (order) => itemCount(order) },
      } satisfies ColumnMetaShape<OrderListItem>,
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
      meta: {
        align: "right",
        csv: {
          header: "Total",
          value: (order) => formatPrice(order.totalCents, order.currency),
        },
        footer: (orders) =>
          formatPrice(
            orders.reduce((sum, order) => sum + order.totalCents, 0),
            orders[0]?.currency ?? "INR",
          ),
      } satisfies ColumnMetaShape<OrderListItem>,
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
      meta: {
        align: "right",
        csv: { header: "Placed", value: (order) => order.createdAt },
      } satisfies ColumnMetaShape<OrderListItem>,
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
      meta: { align: "right", csv: { exclude: true } },
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
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <DataTable
        columns={columns({ onView })}
        data={orders}
        getRowId={(order) => order._id}
        minWidth={1080}
        preferenceKey="orders"
        exportFilename="orders.csv"
        footerLabel="Total"
        expandContent={({ row }) => {
          const order = row.original;
          return (
            <div className="grid gap-x-8 gap-y-5 text-sm sm:grid-cols-4">
              <dl className="space-y-0.5">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Customer
                </dt>
                <dd>
                  {order.customer.firstName} {order.customer.lastName}
                </dd>
                <dd className="font-mono text-xs break-all text-muted-foreground">
                  {order.customer.email}
                </dd>
              </dl>
              <dl className="space-y-0.5">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Order
                </dt>
                <dd className="font-mono text-xs font-semibold">
                  {order.orderNumber}
                </dd>
                <dd className="text-xs text-muted-foreground">
                  {dateFormatter.format(new Date(order.createdAt))}
                </dd>
              </dl>
              <dl className="space-y-0.5">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Summary
                </dt>
                <dd className="tabular-nums">
                  {itemCount(order)} item{itemCount(order) === 1 ? "" : "s"}
                </dd>
                <dd className="font-medium tabular-nums">
                  {formatPrice(order.totalCents, order.currency)}
                </dd>
              </dl>
              <dl className="space-y-0.5">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Status
                </dt>
                <dd>
                  <OrderStatusBadge status={order.status} />
                </dd>
                <dd>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </dd>
              </dl>
            </div>
          );
        }}
      />
    </div>
  );
}