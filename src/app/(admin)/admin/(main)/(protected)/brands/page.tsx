import { requireAdminPage } from "@/lib/auth/admin";
import { BrandAdmin } from "@/components/admin/brands/brand-admin";

export default async function BrandsPage() {
  await requireAdminPage();
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold">Brands</h1>
        <p className="text-sm text-muted-foreground">
          Manage the manufacturers and labels shown in your storefront.
        </p>
      </header>
      <BrandAdmin />
    </div>
  );
}