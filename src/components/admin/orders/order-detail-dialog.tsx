"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminDialog } from "@/components/admin/admin-dialog";
import { OrderDetails } from "@/components/admin/orders/order-details";
import { OrderStatusControls } from "@/components/admin/orders/order-status-controls";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/states";
import { AdminApiError, AdminUnauthorized, apiRequest } from "@/lib/api/client";
import type { OrderDetail, OrderListItem, OrderStatus } from "@/types/orders";

export function OrderDetailDialog({
  order,
  onClose,
  onSaved,
}: {
  order: OrderListItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const router = useRouter();
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!order) {
      return;
    }
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setLoading(true);
        setFetchError(null);
      }
    });
    apiRequest<OrderDetail>(`/api/admin/orders/${order._id}`)
      .then((result) => {
        if (!cancelled) {
          setDetail(result);
        }
      })
      .catch((cause: unknown) => {
        if (cancelled) {
          return;
        }
        if (cause instanceof AdminUnauthorized) {
          router.push("/admin/login");
          return;
        }
        setFetchError(
          cause instanceof Error ? cause.message : "Something went wrong.",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [order, retry, router]);

  async function handleUpdateStatus(next: OrderStatus) {
    if (!order) {
      return;
    }
    setUpdating(true);
    try {
      const updated = await apiRequest<OrderDetail>(
        `/api/admin/orders/${order._id}`,
        { method: "PATCH", body: { status: next } },
      );
      setDetail(updated);
      onSaved();
    } catch (cause) {
      if (cause instanceof AdminUnauthorized) {
        router.push("/admin/login");
        return;
      }
      if (cause instanceof AdminApiError) {
        throw cause;
      }
      throw new Error("Something went wrong.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <AdminDialog
      open={Boolean(order)}
      onClose={onClose}
      title={order ? `Order ${order.orderNumber}` : "Order"}
      maxWidthClass="sm:max-w-2xl"
    >
      {loading ? (
        <LoadingState label="Loading order details…" />
      ) : fetchError ? (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-6 text-center"
        >
          <h3 className="font-display text-xl font-semibold">
            Unable to load order
          </h3>
          <p className="text-sm text-muted-foreground">{fetchError}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRetry((current) => current + 1)}
          >
            Try again
          </Button>
        </div>
      ) : detail ? (
        <>
          <OrderDetails order={detail} />
          <OrderStatusControls
            status={detail.status}
            paymentStatus={detail.paymentStatus}
            busy={updating}
            onUpdate={handleUpdateStatus}
          />
        </>
      ) : null}
    </AdminDialog>
  );
}