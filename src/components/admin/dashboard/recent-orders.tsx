import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { DataTable } from "@/components/admin/data-table";
import { formatCents } from "./charts";
import { BagIcon } from "@/components/admin/admin-icons";
import type {
  DashboardOrderSummary,
  RecentOrder,
} from "@/lib/services/dashboard-service";

type RecentOrderRow = Omit<RecentOrder, "_id"> & { _id: string };

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function orderCount(order: RecentOrderRow): number {
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

const columns: ColumnDef<RecentOrderRow, unknown>[] = [
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
        <p className="font-medium text-foreground">
          {row.original.customer.firstName} {row.original.customer.lastName}
        </p>
        <p className="text-xs text-muted-foreground">{row.original.customer.email}</p>
      </div>
    ),
  },
  {
    accessorFn: (order) => orderCount(order),
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
      <span className="font-semibold tabular-nums">
        {formatCents(row.original.totalCents, row.original.currency)}
      </span>
    ),
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => paymentBadge(row.original.paymentStatus),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => statusBadge(row.original.status),
  },
  {
    accessorFn: (order) => order.createdAt.getTime(),
    enableSorting: true,
    meta: { align: "right" },
    header: "Placed",
    cell: ({ row }) => (
      <span className="tabular-nums text-muted-foreground">
        {dateFormatter.format(row.original.createdAt)}
      </span>
    ),
  },
];

export function RecentOrders({ orders }: { orders: DashboardOrderSummary }) {
  const rows: RecentOrderRow[] = orders.recent.map((order) => ({
    ...order,
    _id: order._id.toString(),
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
          <DataTable
            columns={columns}
            data={rows}
            getRowId={(order) => order._id}
            minWidth={720}
          />
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