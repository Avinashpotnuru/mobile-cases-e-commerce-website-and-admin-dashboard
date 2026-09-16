import type { ReactNode } from "react";
import { Sidebar, type SidebarItem } from "@/components/admin/sidebar";

export function AdminShell({
  title,
  items,
  children,
}: {
  title: string;
  items: SidebarItem[];
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <Sidebar title={title} items={items} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}