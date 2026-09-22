"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { notifyCustomerChange } from "@/components/storefront/use-customer";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleSignOut() {
    setSubmitting(true);
    try {
      await fetch("/api/customer/logout", { method: "POST" });
      notifyCustomerChange();
      router.push("/account/signin");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleSignOut}
      loading={submitting}
      className={className}
    >
      Sign out
    </Button>
  );
}