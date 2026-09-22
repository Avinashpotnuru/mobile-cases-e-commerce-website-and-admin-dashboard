import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/states";
import { AccountNav } from "@/components/storefront/account/account-nav";
import { formatPrice } from "@/components/storefront/home/price";
import { requireCustomerPage } from "@/lib/auth/customer";
import { listCustomerOrders } from "@/lib/services/order-service";

export const metadata: Metadata = {
  title: "Your orders",
  description: "Your Mobile Cases order history.",
  robots: { index: false, follow: false },
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

const statusLabel: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

export default async function OrdersPage() {
  const customer = await requireCustomerPage();
  const orders = await listCustomerOrders(customer._id);

  return (
    <section className="bg-background py-16 sm:py-20">
      <Container className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold tracking-[0.28em] text-accent uppercase">
          Your account
        </p>
        <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
          Order history
        </h1>
        <div className="mt-6">
          <AccountNav />
        </div>

        {orders.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              title="No orders yet"
              description="When you place an order it will appear here so you can track its journey."
              action={
                <Link
                  href="/products"
                  className="inline-flex h-10 items-center justify-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
                >
                  Browse cases
                </Link>
              }
            />
          </div>
        ) : (
          <ul className="mt-10 divide-y divide-border rounded-2xl border border-border bg-card shadow-sm">
            {orders.map((order) => (
              <li key={order._id.toString()}>
                <Link
                  href={`/account/orders/${order._id.toString()}`}
                  className="group flex flex-wrap items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-muted/40"
                >
                  <div>
                    <p className="font-display text-lg font-semibold tracking-tight text-foreground group-hover:text-accent">
                      {order.orderNumber}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(order.createdAt)} · {order.itemCount}{" "}
                      {order.itemCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-base font-semibold text-foreground tabular-nums">
                      {formatPrice({
                        priceCents: order.totalCents,
                        currency: order.currency,
                      })}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {statusLabel[order.status] ?? order.status}
                      {order.paymentStatus === "paid" ? " · Paid" : ""}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}