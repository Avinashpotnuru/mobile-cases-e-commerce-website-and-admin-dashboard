"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";

export default function DashboardError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Unable to load dashboard"
      description="We couldn't fetch your store overview. Check the database connection and try again."
      action={
        <Button variant="outline" onClick={reset}>
          Try again
        </Button>
      }
    />
  );
}