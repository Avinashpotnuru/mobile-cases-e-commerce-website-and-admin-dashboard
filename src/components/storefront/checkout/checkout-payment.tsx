"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="4.5" y="10.5" width="15" height="10" rx="1.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
      <path d="M12 14.5v2.5" />
    </svg>
  );
}

export function PaymentSection() {
  return (
    <Card>
      <CardHeader>
        <p className="text-[11px] font-bold tracking-[0.28em] text-accent uppercase">
          {"04 \u00B7 Payment"}
        </p>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Payment method
        </h2>
      </CardHeader>
      <CardContent>
        <div
          role="note"
          aria-label="Payment method placeholder"
          className="rounded-lg border border-border bg-muted/20 p-4"
        >
          <div className="flex items-center gap-3">
            <LockIcon className="h-5 w-5 text-accent" />
            <p className="text-sm font-semibold text-foreground">
              Card payment
            </p>
            <Badge variant="outline">Available soon</Badge>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            After you continue, your order details are verified on the server
            and you can securely pay with card. This demo doesn&apos;t collect
            or store any card details.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}