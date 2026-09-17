import { cn } from "@/components/ui/cn";
import type { Order } from "@/lib/database/models";

type OrderStatusProps = {
  order: Order;
};

type StateConfig = {
  label: string;
  description: string;
  tone: "success" | "pending" | "error" | "neutral";
};

function stateFor(order: Order): StateConfig {
  if (order.status === "cancelled") {
    return {
      label: "Order cancelled",
      description:
        "This order was cancelled. Contact support if you believe this is a mistake.",
      tone: "neutral",
    };
  }
  switch (order.paymentStatus) {
    case "paid":
      return {
        label: "Payment completed",
        description:
          "Your payment was verified successfully and your order is confirmed.",
        tone: "success",
      };
    case "failed":
      return {
        label: "Payment failed",
        description:
          "We were unable to process your payment. Your order is not confirmed until payment succeeds.",
        tone: "error",
      };
    case "refunded":
      return {
        label: "Payment refunded",
        description: "This order was refunded in full.",
        tone: "neutral",
      };
    default:
      return {
        label: "Payment pending",
        description:
          "Your order is confirmed but payment has not completed yet. You will be updated shortly.",
        tone: "pending",
      };
  }
}

const tones = {
  success: "border-success/30 bg-success/5 text-success",
  pending: "border-amber-500/30 bg-amber-50 text-amber-700",
  error: "border-destructive/30 bg-destructive/5 text-destructive",
  neutral: "border-border bg-muted/40 text-muted-foreground",
} as const;

const dotTones = {
  success: "bg-success",
  pending: "bg-amber-500",
  error: "bg-destructive",
  neutral: "bg-muted-foreground/50",
} as const;

export function OrderStatus({ order }: OrderStatusProps) {
  const state = stateFor(order);
  return (
    <section
      role="status"
      aria-live="polite"
      className={cn(
        "mt-6 flex items-start gap-3 rounded-2xl border px-4 py-3.5",
        tones[state.tone],
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "mt-1 h-2 w-2 flex-shrink-0 rounded-full",
          dotTones[state.tone],
        )}
      />
      <div>
        <p className="text-sm font-semibold">{state.label}</p>
        <p className="mt-0.5 text-xs leading-relaxed opacity-90">
          {state.description}
        </p>
      </div>
    </section>
  );
}