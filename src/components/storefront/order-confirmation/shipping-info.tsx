import type { Order } from "@/lib/database/models";

type ShippingInfoProps = {
  order: Order;
};

const addressLines = (order: Order): string[] => [
  order.shippingAddress.addressLine1,
  order.shippingAddress.addressLine2,
  [
    order.shippingAddress.city,
    order.shippingAddress.region,
    order.shippingAddress.postalCode,
  ]
    .filter(Boolean)
    .join(", "),
  order.shippingAddress.country,
];

export function ShippingInfo({ order }: ShippingInfoProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <p className="text-[11px] font-bold tracking-[0.28em] text-accent uppercase">
        Delivery
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
        Shipping information
      </h2>

      <dl className="mt-4 space-y-4 text-sm">
        <div>
          <dt className="text-xs font-medium text-muted-foreground">Method</dt>
          <dd className="mt-0.5 font-medium text-foreground">
            {order.delivery.label}
          </dd>
          <dd className="mt-0.5 text-xs text-muted-foreground">
            Estimated delivery: {order.delivery.estimate}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-muted-foreground">
            Ship to
          </dt>
          <dd className="mt-0.5 font-medium text-foreground">
            {order.customer.firstName} {order.customer.lastName}
          </dd>
          <dd className="mt-0.5 leading-relaxed text-muted-foreground">
            {addressLines(order)
              .filter(Boolean)
              .map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
          </dd>
          <dd className="mt-0.5 text-xs text-muted-foreground">
            {order.customer.phone}
          </dd>
        </div>
      </dl>
    </section>
  );
}