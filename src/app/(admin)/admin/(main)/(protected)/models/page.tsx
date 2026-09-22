import { requireAdminPage } from "@/lib/auth/admin";
import { MobileModelAdmin } from "@/components/admin/models/model-admin";

export const revalidate = 0;

export default async function MobileModelsPage() {
  await requireAdminPage();
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold">Mobile Models</h1>
        <p className="text-sm text-muted-foreground">
          Manage the phone models sold in your storefront, grouped by brand.
        </p>
      </header>
      <MobileModelAdmin />
    </div>
  );
}