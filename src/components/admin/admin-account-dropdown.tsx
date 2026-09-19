"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/admin/admin-icons";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { cn } from "@/components/ui/cn";

export function AdminAccountDropdown({ username }: { username: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const initials = username.slice(0, 2).toUpperCase();

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "inline-flex h-10 items-center gap-2.5 rounded-full border border-border bg-background pl-1 pr-3 transition-colors",
          "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          open && "border-accent/50 bg-muted",
        )}
      >
        <span
          aria-hidden="true"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[11px] font-bold uppercase text-accent-foreground"
        >
          {initials}
        </span>
        <span className="hidden max-w-[160px] truncate text-xs font-medium text-foreground min-[480px]:inline">
          {username}
        </span>
        <ChevronDownIcon
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 rounded-lg border border-border bg-card p-1.5 shadow-lg"
        >
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-foreground">
              {username}
            </p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
          <div className="my-1 h-px bg-border" />
          <div className="px-1 pb-1">
            <SignOutButton />
          </div>
        </div>
      ) : null}
    </div>
  );
}