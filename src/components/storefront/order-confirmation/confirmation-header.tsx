import type { Order } from "@/lib/database/models";
import { formatPrice } from "@/components/storefront/home/price";

type ConfirmationHeaderProps = {
  order: Order;
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(date);
}

export function ConfirmationHeader({ order }: ConfirmationHeaderProps) {
  return (
    <header className="border-b border-border pb-8">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-success/30 bg-success/10">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-success"
            aria-hidden
          >
            <path d="M4 12.5 9.5 18 20 6.5" />
          </svg>
        </div>
        <div>
          <p className="text-[11px] font-bold tracking-[0.28em] text-success uppercase">
            Order confirmed
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Thanks, {order.customer.firstName}
          </h1>
        </div>
      </div>

      <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Your order has been received and is being prepared. A confirmation has
        been sent to {order.customer.email}.
      </p>

      <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Order number</dt>
          <dd className="mt-0.5 font-semibold text-foreground tabular-nums">
            {order.orderNumber}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Placed</dt>
          <dd className="mt-0.5 font-semibold text-foreground">
            {formatDate(order.createdAt)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Total</dt>
          <dd className="mt-0.5 font-semibold text-foreground tabular-nums">
            {formatPrice({ priceCents: order.totalCents, currency: order.currency })}
          </dd>
        </div>
      </dl>
    </header>
  );
}