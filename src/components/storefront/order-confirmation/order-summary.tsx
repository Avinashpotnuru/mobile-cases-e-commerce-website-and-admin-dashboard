import type { Order } from "@/lib/database/models";
import { formatPrice } from "@/components/storefront/home/price";

type OrderSummaryProps = {
  order: Order;
};

export function OrderSummary({ order }: OrderSummaryProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <p className="text-[11px] font-bold tracking-[0.28em] text-accent uppercase">
        Order summary
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
        Your items
      </h2>

      <ul className="mt-4 divide-y divide-border">
        {order.items.map((item) => (
          <li key={item.productId.toString()} className="flex items-start gap-3 py-3.5">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                {item.productName}
              </p>
              {item.modelNames.length > 0 ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.modelNames.join(" · ")}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-muted-foreground">
                Qty {item.quantity} ×{" "}
                {formatPrice({
                  priceCents: item.unitPriceCents,
                  currency: order.currency,
                })}
              </p>
            </div>
            <p className="text-sm font-semibold text-foreground tabular-nums">
              {formatPrice({
                priceCents: item.lineTotalCents,
                currency: order.currency,
              })}
            </p>
          </li>
        ))}
      </ul>

      <dl className="mt-2 space-y-2.5 border-t border-border pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">
            Item{order.items.length === 1 ? "" : "s"} subtotal
          </dt>
          <dd className="font-medium text-foreground tabular-nums">
            {formatPrice({
              priceCents: order.subtotalCents,
              currency: order.currency,
            })}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Delivery</dt>
          <dd className="font-medium text-foreground tabular-nums">
            {order.shippingCents === 0
              ? "Free"
              : formatPrice({
                  priceCents: order.shippingCents,
                  currency: order.currency,
                })}
          </dd>
        </div>
        {order.discountCents && order.discountCents > 0 ? (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              Coupon discount
              {order.couponCode ? (
                <span className="ml-1 rounded border border-border px-1 py-px text-[10px] font-semibold tracking-wide">
                  {order.couponCode}
                </span>
              ) : null}
            </dt>
            <dd className="font-medium text-success tabular-nums">
              {"\u2212"}
              {formatPrice({
                priceCents: order.discountCents,
                currency: order.currency,
              })}
            </dd>
          </div>
        ) : null}
        <div className="flex justify-between border-t border-border pt-3">
          <dt className="font-semibold text-foreground">Total</dt>
          <dd className="font-display text-xl font-semibold text-foreground tabular-nums">
            {formatPrice({
              priceCents: order.totalCents,
              currency: order.currency,
            })}
          </dd>
        </div>
      </dl>
    </section>
  );
}