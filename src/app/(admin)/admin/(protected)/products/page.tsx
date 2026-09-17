import { requireAdminPage } from "@/lib/auth/admin";

export default async function ProductsPage() {
  await requireAdminPage();
  return (
    <main>
      <h1>Products</h1>
    </main>
  );
}