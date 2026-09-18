"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";
import {
  BagIcon,
  DashboardIcon,
  ExternalLinkIcon,
  LayersIcon,
  PackageIcon,
  SmartphoneIcon,
  TagIcon,
} from "@/components/admin/admin-icons";

export type SidebarItem = {
  label: string;
  href: string;
};

export function iconForHref(href: string): ReactNode {
  switch (href) {
    case "/admin/dashboard":
      return <DashboardIcon className="h-[18px] w-[18px]" />;
    case "/admin/brands":
      return <TagIcon className="h-[18px] w-[18px]" />;
    case "/admin/models":
      return <SmartphoneIcon className="h-[18px] w-[18px]" />;
    case "/admin/products":
      return <LayersIcon className="h-[18px] w-[18px]" />;
    case "/admin/inventory":
      return <PackageIcon className="h-[18px] w-[18px]" />;
    case "/admin/orders":
      return <BagIcon className="h-[18px] w-[18px]" />;
    default:
      return null;
  }
}

function groupFor(href: string): "Overview" | "Management" {
  return href === "/admin/dashboard" ? "Overview" : "Management";
}

function NavItem({
  item,
  active,
}: {
  item: SidebarItem;
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-primary-foreground/70 hover:bg-white/5 hover:text-primary-foreground",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "transition-colors duration-150",
          active ? "text-accent" : "text-primary-foreground/50 group-hover:text-primary-foreground/80",
        )}
      >
        {iconForHref(item.href)}
      </span>
      {item.label}
      {active ? (
        <span
          aria-hidden="true"
          className="ml-auto h-1.5 w-1.5 rounded-full bg-accent"
        />
      ) : null}
    </Link>
  );
}

function NavGroup({
  label,
  items,
  pathname,
  hidden,
}: {
  label: string;
  items: SidebarItem[];
  pathname: string;
  hidden?: boolean;
}) {
  if (items.length === 0) {
    return null;
  }
  return (
    <div className={cn("flex flex-col gap-1", hidden && "hidden")}>
      <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-foreground/40">
        {label}
      </p>
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));
        return <NavItem key={item.href} item={item} active={active} />;
      })}
    </div>
  );
}

export function AdminNav({ items }: { items: SidebarItem[] }) {
  const pathname = usePathname();
  const overview = items.filter((item) => groupFor(item.href) === "Overview");
  const management = items.filter(
    (item) => groupFor(item.href) === "Management",
  );

  return (
    <nav aria-label="Admin navigation" className="flex flex-col gap-6">
      <NavGroup label="Overview" items={overview} pathname={pathname} />
      <NavGroup
        label="Management"
        items={management}
        pathname={pathname}
        hidden={management.length === 0}
      />
    </nav>
  );
}

export function Sidebar({
  items,
  className,
}: {
  items: SidebarItem[];
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-primary text-primary-foreground lg:flex",
        className,
      )}
    >
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-primary-foreground/10 px-5">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground shadow-sm"
        >
          <LayersIcon className="h-[18px] w-[18px]" />
        </span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate font-display text-lg font-semibold tracking-tight">
            Mobile Cases
          </span>
          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary-foreground/50">
            Admin console
          </span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        <AdminNav items={items} />
      </div>

      <div className="shrink-0 border-t border-primary-foreground/10 p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-primary-foreground/70 transition-colors duration-150 hover:bg-white/5 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
        >
          <ExternalLinkIcon className="h-[18px] w-[18px]" />
          View live store
        </Link>
      </div>
    </aside>
  );
}