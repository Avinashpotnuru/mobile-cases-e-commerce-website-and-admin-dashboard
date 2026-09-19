"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, type ButtonVariant } from "@/components/ui/button";

export function SignOutButton({
  variant = "ghost",
}: {
  variant?: ButtonVariant;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      setPending(false);
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={signOut}
      loading={pending}
      disabled={pending}
    >
      Sign out
    </Button>
  );
}