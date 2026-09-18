import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";
import { Card } from "@/components/ui/card";
import { ChevronRightIcon } from "@/components/admin/admin-icons";

export type KpiTone = "default" | "accent" | "success" | "destructive";

const toneChip: Record<KpiTone, string> = {
  default: "bg-muted text-muted-foreground",
  accent: "bg-accent/10 text-accent",
  success: "bg-success/10 text-success",
  destructive: "bg-destructive/10 text-destructive",
};

const toneBar: Record<KpiTone, string> = {
  default: "bg-border",
  accent: "bg-accent",
  success: "bg-success",
  destructive: "bg-destructive",
};

export function KpiCard({
  label,
  value,
  hint,
  icon,
  href,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  href?: string;
  tone?: KpiTone;
}) {
  const content = (
    <Card
      className={cn(
        "relative h-full overflow-hidden p-5",
        href &&
          "transition-colors duration-150 group-hover:border-accent/50",
      )}
    >
      <span
        aria-hidden="true"
        className={cn("absolute inset-x-0 top-0 h-0.5", toneBar[tone])}
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        {icon ? (
          <span
            aria-hidden="true"
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              toneChip[tone],
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-4 truncate font-display text-[28px] font-semibold leading-none tabular-nums tracking-tight">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          {href ? (
            <>
              {hint}
              <ChevronRightIcon className="h-3.5 w-3.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
            </>
          ) : (
            hint
          )}
        </p>
      ) : null}
    </Card>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {content}
      </Link>
    );
  }
  return content;
}