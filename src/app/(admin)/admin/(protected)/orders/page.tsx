import { requireAdminPage } from "@/lib/auth/admin";

export default async function OrdersPage() {
  await requireAdminPage();
  return (
    <main>
    <h1>Orders</h1>
    </main>
  );
}