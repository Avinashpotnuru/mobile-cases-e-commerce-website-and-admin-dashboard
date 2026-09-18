import { requireAdminPage } from "@/lib/auth/admin";
import { OrderAdmin } from "@/components/admin/orders/order-admin";

export const revalidate = 0;

export default async function OrdersPage() {
  await requireAdminPage();
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Review orders and update their status.
        </p>
      </header>
      <OrderAdmin />
    </div>
  );
}