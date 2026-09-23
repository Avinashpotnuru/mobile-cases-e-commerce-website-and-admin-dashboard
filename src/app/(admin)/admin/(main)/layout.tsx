import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminShell
      items={[
        { label: "Dashboard", href: "/admin/dashboard" },
        { label: "Brands", href: "/admin/brands" },
        { label: "Models", href: "/admin/models" },
        { label: "Products", href: "/admin/products" },
        { label: "Inventory", href: "/admin/inventory" },
        { label: "Coupons", href: "/admin/coupons" },
        { label: "Orders", href: "/admin/orders" },
      ]}
    >
      {children}
    </AdminShell>
  );
}