import { Badge } from "@/components/ui/badge";
import type { ProductStatus } from "@/types/catalog";
import type { OrderStatus, PaymentStatus } from "@/types/orders";

export function ActiveStatusBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge variant="success">Active</Badge>
  ) : (
    <Badge variant="secondary">Archived</Badge>
  );
}

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  switch (status) {
    case "active":
      return <Badge variant="success">Active</Badge>;
    case "draft":
      return <Badge variant="outline">Draft</Badge>;
    case "archived":
      return <Badge variant="secondary">Archived</Badge>;
  }
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  switch (status) {
    case "confirmed":
      return <Badge variant="success">Confirmed</Badge>;
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>;
    case "pending":
      return <Badge variant="outline">Pending</Badge>;
  }
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  switch (status) {
    case "paid":
      return <Badge variant="success">Paid</Badge>;
    case "failed":
      return <Badge variant="destructive">Failed</Badge>;
    case "refunded":
      return <Badge variant="secondary">Refunded</Badge>;
    case "unpaid":
      return <Badge variant="outline">Unpaid</Badge>;
  }
}