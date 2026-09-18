"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminDialog } from "@/components/admin/admin-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { StockAdjustForm } from "@/components/admin/inventory/stock-adjust-form";
import { StockLevelBadge } from "@/components/admin/inventory/stock-status";
import { ActiveStatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminUnauthorized, apiRequest } from "@/lib/api/client";
import type { InventoryAdminRow } from "@/types/catalog";

function messageOf(cause: unknown): string {
  return cause instanceof Error ? cause.message : "Something went wrong.";
}

export function InventoryManageDialog({
  inventory,
  onClose,
  onSaved,
}: {
  inventory: InventoryAdminRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const router = useRouter();
  const [row, setRow] = useState<InventoryAdminRow | null>(inventory);
  const [thresholdValue, setThresholdValue] = useState("");
  const [savingThreshold, setSavingThreshold] = useState(false);
  const [thresholdError, setThresholdError] = useState<string | null>(null);
  const [deactivating, setDeactivating] = useState(false);
  const [statusBusy, setStatusBusy] = useState<"activate" | "deactivate" | null>(
    null,
  );
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setRow(inventory);
      setThresholdValue(inventory ? String(inventory.lowStockThreshold) : "");
      setThresholdError(null);
      setStatusError(null);
      setDeactivating(false);
    });
  }, [inventory]);

  async function apiCall<T>(
    path: string,
    method: "PATCH" | "POST" | "DELETE",
    body?: unknown,
  ): Promise<T> {
    try {
      return await apiRequest<T>(path, { method, body });
    } catch (cause) {
      if (cause instanceof AdminUnauthorized) {
        router.push("/admin/login");
      }
      throw cause;
    }
  }

  const active = row?.status === "active";

  async function handleSetQuantity(quantity: number) {
    const updated = await apiCall<InventoryAdminRow>(
      `/api/admin/inventory/${row?._id}/stock`,
      "PATCH",
      { quantity },
    );
    setRow(updated);
    onSaved();
  }

  async function handleAdjust(delta: number) {
    const updated = await apiCall<InventoryAdminRow>(
      `/api/admin/inventory/${row?._id}/adjust`,
      "POST",
      { delta },
    );
    setRow(updated);
    onSaved();
  }

  async function handleSaveThreshold() {
    const value = Number(thresholdValue);
    if (thresholdValue === "" || !Number.isInteger(value) || value < 0) {
      setThresholdError("Threshold must be a whole number of 0 or more.");
      return;
    }
    setThresholdError(null);
    setSavingThreshold(true);
    try {
      const updated = await apiCall<InventoryAdminRow>(
        `/api/admin/inventory/${row?._id}`,
        "PATCH",
        { lowStockThreshold: value },
      );
      setRow(updated);
      setThresholdValue(String(updated.lowStockThreshold));
      onSaved();
    } catch (cause) {
      if (!(cause instanceof AdminUnauthorized)) {
        setThresholdError(messageOf(cause));
      }
    } finally {
      setSavingThreshold(false);
    }
  }

  async function handleReactivate() {
    setStatusBusy("activate");
    setStatusError(null);
    try {
      const updated = await apiCall<InventoryAdminRow>(
        `/api/admin/inventory/${row?._id}`,
        "PATCH",
        { status: "active" },
      );
      setRow(updated);
      onSaved();
    } catch (cause) {
      if (!(cause instanceof AdminUnauthorized)) {
        setStatusError(messageOf(cause));
      }
    } finally {
      setStatusBusy(null);
    }
  }

  async function handleDeactivate() {
    setStatusBusy("deactivate");
    setStatusError(null);
    try {
      const updated = await apiCall<InventoryAdminRow>(
        `/api/admin/inventory/${row?._id}`,
        "DELETE",
      );
      setRow(updated);
      onSaved();
      setDeactivating(false);
    } catch (cause) {
      if (!(cause instanceof AdminUnauthorized)) {
        setStatusError(messageOf(cause));
      }
    } finally {
      setStatusBusy(null);
    }
  }

  return (
    <AdminDialog
      open={Boolean(inventory)}
      onClose={onClose}
      title="Manage inventory"
      maxWidthClass="sm:max-w-2xl"
    >
      {row ? (
        <div className="space-y-6">
          <header>
            <h3 className="font-display text-xl font-semibold">
              {row.productName}
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {row.modelNames.length > 0
                ? row.modelNames.join(", ")
                : "No compatible models"}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StockLevelBadge
                quantity={row.quantity}
                lowStockThreshold={row.lowStockThreshold}
              />
              <ActiveStatusBadge active={active} />
            </div>
          </header>

          <section>
            <h4 className="font-display text-lg font-semibold">Stock</h4>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Current quantity: {row.quantity}. The server is the source of
              truth — it validates every change and stock can never go below
              zero.
            </p>
            <div className="mt-3 rounded-md border border-border p-4">
              <StockAdjustForm
                currentQuantity={row.quantity}
                disabled={!active}
                onSetQuantity={handleSetQuantity}
                onAdjust={handleAdjust}
              />
            </div>
            {!active ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Stock cannot be changed while this inventory is archived.
                Reactivate it first.
              </p>
            ) : null}
          </section>

          <section>
            <h4 className="font-display text-lg font-semibold">
              Low-stock threshold
            </h4>
            <p className="mt-0.5 text-sm text-muted-foreground">
              When available stock reaches this level, the product is flagged
              as low stock.
            </p>
            <form
              className="mt-3 flex flex-wrap items-end gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSaveThreshold();
              }}
            >
              <label className="text-sm">
                <span className="sr-only">Low-stock threshold</span>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={thresholdValue}
                  onChange={(event) => setThresholdValue(event.target.value)}
                  className="h-10 w-32"
                  aria-label="Low-stock threshold"
                />
              </label>
              <Button
                type="submit"
                loading={savingThreshold}
                disabled={savingThreshold}
              >
                Save threshold
              </Button>
            </form>
            {thresholdError ? (
              <p role="alert" className="mt-2 text-sm text-destructive">
                {thresholdError}
              </p>
            ) : null}
          </section>

          <section>
            <h4 className="font-display text-lg font-semibold">
              Inventory status
            </h4>
            {active ? (
              <>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Deactivating hides this inventory so the product can no
                  longer be sold. Stock levels are preserved.
                </p>
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={() => setDeactivating(true)}
                >
                  Deactivate inventory
                </Button>
              </>
            ) : (
              <>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  This inventory is archived. Reactivate it to resume sales.
                </p>
                <Button
                  variant="outline"
                  className="mt-3"
                  loading={statusBusy === "activate"}
                  disabled={statusBusy !== null}
                  onClick={() => void handleReactivate()}
                >
                  Reactivate inventory
                </Button>
              </>
            )}
            {statusError ? (
              <p role="alert" className="mt-2 text-sm text-destructive">
                {statusError}
              </p>
            ) : null}
          </section>
        </div>
      ) : null}

      <ConfirmDialog
        open={deactivating}
        title="Deactivate inventory?"
        description={`This makes "${row?.productName ?? "this product"}" unavailable for sale and hides it from the storefront. You can reactivate it later — current stock levels are preserved.`}
        confirmLabel="Deactivate"
        onClose={() => setDeactivating(false)}
        onConfirm={handleDeactivate}
      />
    </AdminDialog>
  );
}