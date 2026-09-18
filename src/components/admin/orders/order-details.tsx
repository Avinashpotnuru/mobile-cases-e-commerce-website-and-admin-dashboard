import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/status-badge";
import { formatPrice } from "@/components/admin/catalog-utils";
import type { OrderDetail } from "@/types/orders";

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function itemCount(order: OrderDetail): number {
  return order.items.reduce((total, item) => total + item.quantity, 0);
}

export function OrderDetails({ order }: { order: OrderDetail }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-sm font-semibold">{order.orderNumber}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {itemCount(order)} item{itemCount(order) === 1 ? "" : "s"} ·{" "}
            {formatPrice(order.totalCents, order.currency)}{" "}
            {order.currency === "USD" ? "" : order.currency}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-border p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Customer
          </dt>
          <dd className="mt-2 text-sm">
            <p className="font-medium">
              {order.customer.firstName} {order.customer.lastName}
            </p>
            <p className="mt-0.5 text-muted-foreground">{order.customer.email}</p>
            <p className="mt-0.5 text-muted-foreground">{order.customer.phone}</p>
          </dd>
        </div>
        <div className="rounded-md border border-border p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Shipping address
          </dt>
          <dd className="mt-2 text-sm text-muted-foreground">
            <p>{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 ? (
              <p>{order.shippingAddress.addressLine2}</p>
            ) : null}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.region}{" "}
              {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
          </dd>
        </div>
        <div className="rounded-md border border-border p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Delivery
          </dt>
          <dd className="mt-2 text-sm">
            <p className="font-medium">{order.delivery.label}</p>
            <p className="mt-0.5 text-muted-foreground">
              {order.delivery.estimate}
            </p>
          </dd>
        </div>
        <div className="rounded-md border border-border p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Timeline
          </dt>
          <dd className="mt-2 text-sm text-muted-foreground">
            <p>Placed {dateTimeFormatter.format(new Date(order.createdAt))}</p>
            <p className="mt-0.5">
              Updated {dateTimeFormatter.format(new Date(order.updatedAt))}
            </p>
          </dd>
        </div>
      </dl>

      <div className="rounded-md border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="px-4 py-3 font-medium">
                  Product
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Models
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Qty
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Unit price
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Line total
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr
                  key={item.productId.toString()}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3">
                    <p className="max-w-[220px] truncate font-medium">
                      {item.productName}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {item.productSlug}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {item.modelNames.length
                      ? item.modelNames.join(", ")
                      : "\u2014"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatPrice(item.unitPriceCents, order.currency)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">
                    {formatPrice(item.lineTotalCents, order.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col items-end gap-1.5 border-t border-border px-4 py-3 text-sm">
          <p className="flex w-full max-w-[260px] justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums">
              {formatPrice(order.subtotalCents, order.currency)}
            </span>
          </p>
          <p className="flex w-full max-w-[260px] justify-between text-muted-foreground">
            <span>Shipping</span>
            <span className="tabular-nums">
              {formatPrice(order.shippingCents, order.currency)}
            </span>
          </p>
          <p className="flex w-full max-w-[260px] justify-between border-t border-border pt-2 font-medium">
            <span>Total</span>
            <span className="tabular-nums">
              {formatPrice(order.totalCents, order.currency)}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            Prices were captured when the order was placed.
          </p>
        </div>
      </div>
    </div>
  );
}