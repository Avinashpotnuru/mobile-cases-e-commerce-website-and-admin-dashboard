"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CloseIcon,
  ExternalLinkIcon,
  LayersIcon,
  MenuIcon,
} from "@/components/admin/admin-icons";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { AdminNav, type SidebarItem } from "@/components/admin/sidebar";

export function MobileNav({
  items,
  username,
}: {
  items: SidebarItem[];
  username: string;
}) {
  const [open, setOpen] = useState(false);
  const initials = username.slice(0, 2).toUpperCase();

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open admin navigation"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close admin navigation"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-foreground/40 backdrop-blur-[2px]"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
            className="absolute inset-y-0 left-0 flex w-72 flex-col bg-sidebar text-sidebar-foreground shadow-2xl"
          >
            <div className="flex h-16 shrink-0 items-center gap-3 border-b border-sidebar-foreground/10 pl-5 pr-2">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground"
              >
                <LayersIcon className="h-4 w-4" />
              </span>
              <span className="flex flex-col">
                <span className="font-display text-lg font-semibold leading-tight">
                  Mobile Cases
                </span>
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-sidebar-foreground/50">
                  Admin console
                </span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close admin navigation"
                className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-white/5 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-foreground/60"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-5">
              <AdminNav items={items} />
            </div>

            <div className="shrink-0 border-t border-sidebar-foreground/10 p-3">
              {username ? (
                <div className="flex items-center gap-3 rounded-lg px-3 py-2">
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold uppercase text-accent-foreground"
                  >
                    {initials}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-sidebar-foreground">
                      {username}
                    </span>
                    <span className="text-[11px] text-sidebar-foreground/50">
                      Administrator
                    </span>
                  </span>
                  <SignOutButton variant="secondary" />
                </div>
              ) : null}
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-white/5 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-foreground/60"
              >
                <ExternalLinkIcon className="h-[18px] w-[18px]" />
                View live store
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}