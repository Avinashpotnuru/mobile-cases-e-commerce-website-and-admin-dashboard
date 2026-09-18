"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import type { OrderStatus, PaymentStatus } from "@/types/orders";

export function OrderStatusControls({
  status,
  paymentStatus,
  busy,
  onUpdate,
}: {
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  busy: boolean;
  onUpdate: (next: OrderStatus) => Promise<void>;
}) {
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(next: OrderStatus) {
    setError(null);
    try {
      await onUpdate(next);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Something went wrong.",
      );
    }
  }

  const canConfirm = status === "pending";
  const canCancel =
    (status === "pending" || status === "confirmed") &&
    paymentStatus !== "paid";

  return (
    <div className="border-t border-border pt-4">
      <div className="flex flex-wrap items-center gap-2">
        {canConfirm ? (
          <Button size="sm" loading={busy} onClick={() => run("confirmed")}>
            Confirm order
          </Button>
        ) : null}
        {canCancel ? (
          <Button
            size="sm"
            variant="outline"
            className="text-destructive hover:bg-destructive/5"
            loading={busy}
            onClick={() => setCancelling(true)}
          >
            Cancel order
          </Button>
        ) : null}
        {status === "cancelled" ? (
          <p className="text-sm text-muted-foreground">
            This order is cancelled and can no longer be changed.
          </p>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <ConfirmDialog
        open={cancelling}
        title="Cancel order"
        description="Cancelling this order cannot be undone. The customer will see it as cancelled and it can no longer be paid."
        confirmLabel="Cancel order"
        onClose={() => setCancelling(false)}
        onConfirm={async () => {
          await run("cancelled");
          setCancelling(false);
        }}
      />
    </div>
  );
}