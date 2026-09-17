"use client";

import { AdminDialog } from "@/components/admin/admin-dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}) {
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    try {
      await onConfirm();
    } finally {
      setPending(false);
    }
  }

  return (
    <AdminDialog open={open} onClose={pending ? () => {} : onClose} title={title}>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={handleConfirm}
          loading={pending}
          disabled={pending}
        >
          {confirmLabel}
        </Button>
      </div>
    </AdminDialog>
  );
}