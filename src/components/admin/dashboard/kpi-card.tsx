import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";
import { Card } from "@/components/ui/card";

export type KpiTone = "default" | "accent" | "success" | "destructive";

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
    <Card className="relative h-full overflow-hidden p-5">
      <span
        aria-hidden="true"
        className={cn("absolute inset-x-0 top-0 h-0.5", toneBar[tone])}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="truncate font-display text-3xl font-semibold tabular-nums">
            {value}
          </p>
        </div>
        {icon ? (
          <span className="mt-1 shrink-0 text-muted-foreground">{icon}</span>
        ) : null}
      </div>
      {hint ? (
        <p className="mt-3 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </Card>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {content}
      </Link>
    );
  }
  return content;
}