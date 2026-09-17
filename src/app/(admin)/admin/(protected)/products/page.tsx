import { requireAdminPage } from "@/lib/auth/admin";
import { ProductAdmin } from "@/components/admin/products/product-admin";

export const revalidate = 0;

export default async function ProductsPage() {
  await requireAdminPage();
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold">Products</h1>
        <p className="text-sm text-muted-foreground">
          Manage cases, pricing, and device compatibility.
        </p>
      </header>
      <ProductAdmin />
    </div>
  );
}