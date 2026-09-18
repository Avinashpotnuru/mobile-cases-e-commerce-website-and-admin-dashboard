"use client";

import { useEffect, useMemo, useState } from "react";
import { CatalogPagination } from "@/components/admin/catalog-pagination";
import { CatalogToolbar } from "@/components/admin/catalog-toolbar";
import { InventoryFilters } from "@/components/admin/inventory/inventory-filters";
import { InventoryManageDialog } from "@/components/admin/inventory/inventory-manage-dialog";
import { InventoryTable } from "@/components/admin/inventory/inventory-table";
import { useAdminList } from "@/components/admin/use-admin-list";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/states";
import { apiRequest } from "@/lib/api/client";
import type {
  BrandRow,
  InventoryAdminRow,
  MobileModelRow,
} from "@/types/catalog";

const PAGE_SIZE = 10;

export function InventoryAdmin() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [mobileModelId, setMobileModelId] = useState("");
  const [manage, setManage] = useState<InventoryAdminRow | null>(null);
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [models, setModels] = useState<MobileModelRow[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    queueMicrotask(() => {
      setPage(1);
    });
  }, [debouncedQuery, status, mobileModelId]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      Promise.allSettled([
        apiRequest<{ items: BrandRow[] }>(
          "/api/admin/brands?includeArchived=true&page=1&pageSize=100",
        ),
        apiRequest<{ items: MobileModelRow[] }>(
          "/api/admin/mobile-models?includeArchived=true&page=1&pageSize=100",
        ),
      ])
        .then(([brandsResult, modelsResult]) => {
          if (cancelled) return;
          if (
            brandsResult.status === "fulfilled" &&
            brandsResult.value.items
          ) {
            setBrands(brandsResult.value.items);
          }
          if (
            modelsResult.status === "fulfilled" &&
            modelsResult.value.items
          ) {
            setModels(modelsResult.value.items);
          }
        })
        .catch(() => {
          /* refs are non-critical */
        });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeModels = useMemo(
    () => models.filter((model) => model.status === "active"),
    [models],
  );

  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(PAGE_SIZE),
    includeArchived: "true",
  });
  if (debouncedQuery) params.set("q", debouncedQuery);
  if (status) params.set("status", status);
  if (mobileModelId) params.set("mobileModelId", mobileModelId);

  const { data, loading, error, refresh } = useAdminList<InventoryAdminRow>(
    `/api/admin/inventory?${params.toString()}`,
  );

  const filtersActive = Boolean(debouncedQuery || status || mobileModelId);

  function clearFilters() {
    setQuery("");
    setDebouncedQuery("");
    setStatus("");
    setMobileModelId("");
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <CatalogToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search by product name…"
        countLabel={
          data
            ? `${data.total} record${data.total === 1 ? "" : "s"}`
            : ""
        }
      >
        <InventoryFilters
          status={status}
          onStatusChange={setStatus}
          mobileModelId={mobileModelId}
          onMobileModelChange={setMobileModelId}
          models={activeModels}
          brands={brands}
        />
      </CatalogToolbar>

      {loading ? <LoadingState label="Loading inventory…" /> : null}

      {!loading && error ? (
        <ErrorState
          title="Could not load inventory"
          description={error}
          action={
            <Button variant="outline" onClick={refresh}>
              Try again
            </Button>
          }
        />
      ) : null}

      {!loading && !error && data ? (
        data.items.length === 0 ? (
          <EmptyState
            title={
              filtersActive
                ? "No inventory matches your filters"
                : "No inventory records yet"
            }
            description={
              filtersActive
                ? "Try a different search or clear the filters."
                : undefined
            }
            action={
              filtersActive ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear search and filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <InventoryTable rows={data.items} onManage={setManage} />
            <CatalogPagination
              page={data.page}
              totalPages={data.totalPages}
              start={(data.page - 1) * data.pageSize + 1}
              end={Math.min(data.page * data.pageSize, data.total)}
              total={data.total}
              onPageChange={setPage}
            />
          </>
        )
      ) : null}

      <InventoryManageDialog
        inventory={manage}
        onClose={() => setManage(null)}
        onSaved={refresh}
      />
    </div>
  );
}