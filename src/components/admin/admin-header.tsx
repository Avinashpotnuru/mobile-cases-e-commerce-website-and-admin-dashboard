import { readAdminSession, configuredAdminUsername } from "@/lib/auth/admin";
import { AdminAccountDropdown } from "@/components/admin/admin-account-dropdown";
import { MobileNav } from "@/components/admin/mobile-nav";
import { ThemeToggle } from "@/components/storefront/theme-toggle";
import type { SidebarItem } from "@/components/admin/sidebar";

export async function AdminHeader({ items }: { items: SidebarItem[] }) {
  const session = await readAdminSession();
  const username = session ? configuredAdminUsername() : "";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card shadow-sm">
      <span
        aria-hidden="true"
        className="block h-px w-full bg-gradient-to-r from-accent via-accent/30 to-transparent"
      />
      <div className="flex h-16 items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <MobileNav items={items} username={username} />
        <span aria-hidden="true" className="hidden h-5 w-px bg-border sm:block" />
        <p className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground lg:block">
          Admin console
        </p>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <span className="hidden items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground xl:inline-flex">
            <span aria-hidden="true" className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            All systems live
          </span>

          {session ? (
            <div className="hidden md:block">
              <AdminAccountDropdown username={username} />
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}