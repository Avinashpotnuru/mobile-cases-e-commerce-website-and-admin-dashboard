"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/cn";

export type SidebarItem = {
  label: string;
  href: string;
};

const linkClasses =
  "shrink-0 rounded-sm px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function Sidebar({
  title,
  items,
  className,
}: {
  title: string;
  items: SidebarItem[];
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "shrink-0 border-b border-border bg-card md:sticky md:top-0 md:h-dvh md:w-64 md:border-b-0 md:border-r",
        className,
      )}
    >
      <nav
        aria-label="Admin navigation"
        className="flex gap-1 overflow-x-auto p-3 md:flex-col md:overflow-visible"
      >
        <p className="hidden px-3 pb-3 font-display text-xl font-semibold md:block">
          {title}
        </p>
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                linkClasses,
                active
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}