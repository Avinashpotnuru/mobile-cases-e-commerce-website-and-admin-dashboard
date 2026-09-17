import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ConfirmationHeader } from "@/components/storefront/order-confirmation/confirmation-header";
import { OrderStatus } from "@/components/storefront/order-confirmation/order-status";
import { OrderSummary } from "@/components/storefront/order-confirmation/order-summary";
import { ShippingInfo } from "@/components/storefront/order-confirmation/shipping-info";
import { OrderActions } from "@/components/storefront/order-confirmation/order-actions";
import { getOrderForConfirmation } from "@/lib/services/order-service";

export const metadata: Metadata = {
  title: "Order Confirmation",
  description: "Order confirmation and summary.",
  // Sensitive order information must never be indexed.
  robots: { index: false, follow: false },
};

type OrderConfirmationPageProps = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ access?: string }>;
};

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: OrderConfirmationPageProps) {
  const { orderId } = await params;
  const { access } = await searchParams;

  // The order id alone is not proof of ownership; only the access code
  // returned at order creation grants access to a specific order.
  let order;
  try {
    order = await getOrderForConfirmation(orderId, access ?? "");
  } catch {
    notFound();
  }

  return (
    <section className="bg-background pb-24 pt-8">
      <Container className="max-w-4xl">
        <ConfirmationHeader order={order} />
        <OrderStatus order={order} />

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start">
          <OrderSummary order={order} />
          <div className="space-y-6">
            <ShippingInfo order={order} />
            <OrderActions />
          </div>
        </div>
      </Container>
    </section>
  );
}