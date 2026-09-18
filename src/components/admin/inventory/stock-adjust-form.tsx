"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminUnauthorized } from "@/lib/api/client";

export function StockAdjustForm({
  currentQuantity,
  disabled,
  onSetQuantity,
  onAdjust,
}: {
  currentQuantity: number;
  disabled?: boolean;
  onSetQuantity: (quantity: number) => Promise<void>;
  onAdjust: (delta: number) => Promise<void>;
}) {
  const setLabelId = useId();
  const deltaLabelId = useId();
  const [setValue, setSetValue] = useState("");
  const [delta, setDelta] = useState("");
  const [pending, setPending] = useState<"set" | "adjust" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: "set" | "adjust") {
    const raw = action === "set" ? setValue : delta;
    const parsed = Number(raw);
    const message =
      action === "set"
        ? raw !== "" && Number.isInteger(parsed) && parsed >= 0
          ? null
          : "Quantity must be a whole number of 0 or more."
        : raw !== "" &&
            Number.isInteger(parsed) &&
            currentQuantity + parsed >= 0
          ? null
          : "Stock can never go below zero.";
    if (message) {
      setError(message);
      return;
    }
    setPending(action);
    setError(null);
    try {
      if (action === "set") {
        await onSetQuantity(parsed);
        setSetValue("");
      } else {
        await onAdjust(parsed);
        setDelta("");
      }
    } catch (cause) {
      if (!(cause instanceof AdminUnauthorized)) {
        setError(
          cause instanceof Error ? cause.message : "Something went wrong.",
        );
      }
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-border p-3">
          <label
            id={setLabelId}
            className="text-sm font-medium text-foreground"
          >
            Set quantity
          </label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Overwrite the available stock with an exact value.
          </p>
          <div className="mt-3 flex items-end gap-2">
            <Input
              id={setLabelId}
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={setValue}
              onChange={(event) => setSetValue(event.target.value)}
              disabled={disabled || pending !== null}
              aria-label="New stock quantity"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => run("set")}
              loading={pending === "set"}
              disabled={disabled || pending !== null}
            >
              Set
            </Button>
          </div>
        </div>

        <div className="rounded-md border border-border p-3">
          <label
            id={deltaLabelId}
            className="text-sm font-medium text-foreground"
          >
            Adjust stock
          </label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Apply a relative change, e.g. +5 received or -2 sold.
          </p>
          <div className="mt-3 flex items-end gap-2">
            <Input
              id={deltaLabelId}
              type="number"
              step={1}
              inputMode="numeric"
              value={delta}
              onChange={(event) => setDelta(event.target.value)}
              disabled={disabled || pending !== null}
              aria-label="Stock adjustment delta"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => run("adjust")}
              loading={pending === "adjust"}
              disabled={disabled || pending !== null}
            >
              Apply
            </Button>
          </div>
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Every change is validated on the server — stock can never go below
        zero.
      </p>
    </div>
  );
}