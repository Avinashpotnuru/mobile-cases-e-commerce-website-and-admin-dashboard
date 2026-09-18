import type { ReactNode } from "react";
import { Sidebar, type SidebarItem } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export function AdminShell({
  items,
  children,
}: {
  items: SidebarItem[];
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-muted/30">
      <div className="flex min-h-dvh">
        <Sidebar items={items} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader items={items} />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-[1440px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}