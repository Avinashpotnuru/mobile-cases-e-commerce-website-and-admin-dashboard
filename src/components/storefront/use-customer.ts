"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export const CUSTOMER_CHANGE_EVENT = "customer:change";

export type CustomerPublic = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export function useCustomer(): CustomerPublic | null {
  const pathname = usePathname();
  const [customer, setCustomer] = useState<CustomerPublic | null>(null);

  const sync = useCallback(async () => {
    try {
      const response = await fetch("/api/customer/session");
      const payload = (await response.json()) as {
        data?: { customer: CustomerPublic | null };
      };
      setCustomer(payload.data?.customer ?? null);
    } catch {
      setCustomer(null);
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(sync, 0);
    window.addEventListener(CUSTOMER_CHANGE_EVENT, sync);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener(CUSTOMER_CHANGE_EVENT, sync);
    };
  }, [sync, pathname]);

  return customer;
}

export function notifyCustomerChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CUSTOMER_CHANGE_EVENT));
}