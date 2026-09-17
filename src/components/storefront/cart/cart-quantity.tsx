"use client";

import { cn } from "@/components/ui/cn";

type CartQuantityProps = {
  value: number;
  max: number;
  disabled?: boolean;
  label: string;
  onDecrease: () => void;
  onIncrease: () => void;
};

export function CartQuantity({
  value,
  max,
  disabled = false,
  label,
  onDecrease,
  onIncrease,
}: CartQuantityProps) {
  return (
    <div
      className={cn(
        "flex items-center overflow-hidden rounded-lg border border-border bg-background",
        disabled && "opacity-50",
      )}
      role="group"
      aria-label={`${label} quantity`}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || value <= 1}
        onClick={onDecrease}
        className="flex h-9 w-9 cursor-pointer items-center justify-center border-r border-border text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
      >
        &minus;
      </button>
      <span
        aria-live="polite"
        className="flex h-9 w-10 items-center justify-center text-center text-sm font-medium tabular-nums"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || value >= max}
        onClick={onIncrease}
        className="flex h-9 w-9 cursor-pointer items-center justify-center border-l border-border text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}