import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { AccountNav } from "@/components/storefront/account/account-nav";
import { OrderStatus } from "@/components/storefront/order-confirmation/order-status";
import { OrderSummary } from "@/components/storefront/order-confirmation/order-summary";
import { ShippingInfo } from "@/components/storefront/order-confirmation/shipping-info";
import { requireCustomerPage } from "@/lib/auth/customer";
import { getCustomerOrder } from "@/lib/services/order-service";
import { NotFoundError } from "@/lib/services/errors";

export const metadata: Metadata = {
  title: "Order details",
  description: "Track your Mobile Cases order.",
  robots: { index: false, follow: false },
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const customer = await requireCustomerPage();
  const { orderId } = await params;

  let order;
  try {
    order = await getCustomerOrder(orderId, customer._id);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  return (
    <section className="bg-background pb-24 pt-16">
      <Container className="mx-auto max-w-4xl">
        <AccountNav />

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link
              href="/account/orders"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
            >
              &larr; Back to orders
            </Link>
            <p className="mt-4 text-xs font-semibold tracking-[0.28em] text-accent uppercase">
              Placed {formatDate(order.createdAt)}
            </p>
            <h1 className="mt-2 font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
              {order.orderNumber}
            </h1>
          </div>
        </div>

        <div className="mt-8">
          <OrderStatus order={order} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start">
          <OrderSummary order={order} />
          <div className="space-y-6">
            <ShippingInfo order={order} />
          </div>
        </div>
      </Container>
    </section>
  );
}