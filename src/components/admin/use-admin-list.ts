"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminUnauthorized, apiRequest } from "@/lib/api/client";
import type { PaginatedResult } from "@/types/pagination";

export function useAdminList<TData>(url: string) {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResult<TData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setLoading(true);
        setError(null);
      }
    });
    apiRequest<PaginatedResult<TData>>(url)
      .then((result) => {
        if (!cancelled) {
          setData(result);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
        if (err instanceof AdminUnauthorized) {
          router.push("/admin/login");
          return;
        }
        setError(err instanceof Error ? err.message : "Something went wrong.");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [url, version, router]);

  const refresh = () => setVersion((current) => current + 1);

  return { data, loading, error, refresh };
}