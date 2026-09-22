import { requireAdminPage } from "@/lib/auth/admin";
import { InventoryAdmin } from "@/components/admin/inventory/inventory-admin";

export const revalidate = 0;

export default async function InventoryPage() {
  await requireAdminPage();
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold">Inventory</h1>
        <p className="text-sm text-muted-foreground">
          Manage stock levels, adjustments, and low-stock thresholds.
        </p>
      </header>
      <InventoryAdmin />
    </div>
  );
}