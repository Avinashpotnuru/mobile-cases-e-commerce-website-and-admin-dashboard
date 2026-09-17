import { requireAdminPage } from "@/lib/auth/admin";

export default async function InventoryPage() {
  await requireAdminPage();
  return (
    <main>
      <h1>Inventory</h1>
    </main>
  );
}