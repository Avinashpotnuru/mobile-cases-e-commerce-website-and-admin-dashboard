"use client";

import { useEffect, useState } from "react";
import { AdminDialog } from "@/components/admin/admin-dialog";
import { CatalogPagination } from "@/components/admin/catalog-pagination";
import { CatalogToolbar } from "@/components/admin/catalog-toolbar";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { MobileModelForm } from "@/components/admin/models/model-form";
import { MobileModelTable } from "@/components/admin/models/model-table";
import { useAdminList } from "@/components/admin/use-admin-list";
import { apiRequest } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { LoadingState } from "@/components/ui/states";
import type { BrandRow, CatalogStatus, MobileModelRow } from "@/types/catalog";

const PAGE_SIZE = 10;
const BRANDS_PAGE_SIZE = 200;

type StatusFilter = "all" | CatalogStatus;

export function MobileModelAdmin() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const [brands, setBrands] = useState<BrandRow[]>([]);

  const [editing, setEditing] = useState<MobileModelRow | null | undefined>(undefined);
  const [creating, setCreating] = useState(false);
  const [deactivating, setDeactivating] = useState<MobileModelRow | null>(null);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);
  const [deactivatingPending, setDeactivatingPending] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    apiRequest<{ items: BrandRow[]; total: number }>(
      `/api/admin/brands?page=1&pageSize=${BRANDS_PAGE_SIZE}&includeArchived=true`,
    )
      .then((result) => {
        if (!cancelled) {
          setBrands(result.items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBrands([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (search) {
    params.set("search", search);
  }
  if (status !== "all") {
    params.set("status", status);
  }
  if (brandFilter !== "all") {
    params.set("brandId", brandFilter);
  }

  const { data, loading, error, refresh } = useAdminList<MobileModelRow>(
    `/api/admin/mobile-models?${params.toString()}`,
  );

  const brandNames: Record<string, string> = {};
  for (const brand of brands) {
    brandNames[brand._id] = brand.name;
  }

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setStatus("all");
    setBrandFilter("all");
    setPage(1);
  }

  async function handleDeactivate() {
    if (!deactivating) {
      return;
    }
    setDeactivateError(null);
    setDeactivatingPending(true);
    try {
      await apiRequest<MobileModelRow>(
        `/api/admin/mobile-models/${deactivating._id}`,
        { method: "DELETE" },
      );
      setDeactivating(null);
      refresh();
    } catch (error) {
      setDeactivateError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setDeactivatingPending(false);
    }
  }

  const result = data;
  const start = result ? (result.page - 1) * result.pageSize + 1 : 0;
  const end = result ? Math.min(result.page * result.pageSize, result.total) : 0;

  return (
    <div className="flex flex-col gap-4">
      <CatalogToolbar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="Search models by name or slug…"
        countLabel={
          result ? `${result.total} model${result.total === 1 ? "" : "s"}` : ""
        }
        action={
          <Button onClick={() => setCreating(true)}>
            <span aria-hidden="true" className="text-lg leading-none">
              +
            </span>
            Add model
          </Button>
        }
      >
        <label>
          <span className="sr-only">Filter by brand</span>
          <Select
            value={brandFilter}
            onChange={(event) => {
              setBrandFilter(event.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto"
          >
            <option value="all">All brands</option>
            {brands.map((brand) => (
              <option key={brand._id} value={brand._id}>
                {brand.name}
                {brand.status === "archived" ? " (archived)" : ""}
              </option>
            ))}
          </Select>
        </label>
        <label>
          <span className="sr-only">Filter by status</span>
          <Select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as StatusFilter);
              setPage(1);
            }}
            className="w-full sm:w-auto"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </Select>
        </label>
      </CatalogToolbar>

      {loading ? (
        <LoadingState label="Loading models…" />
      ) : error ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-center"
        >
          <h3 className="font-display text-xl font-semibold">Unable to load models</h3>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button className="mt-4" variant="outline" onClick={refresh}>
            Try again
          </Button>
        </div>
      ) : result ? (
        <>
          <MobileModelTable
            models={result.items}
            brandNames={brandNames}
            onEdit={(model) => setEditing(model)}
            onDeactivate={(model) => setDeactivating(model)}
          />
          <CatalogPagination
            page={result.page}
            totalPages={result.totalPages}
            start={start}
            end={end}
            total={result.total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
          {result.total === 0 ? (
            <div className="text-center">
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Clear search and filters
              </Button>
            </div>
          ) : null}
        </>
      ) : null}

      <AdminDialog
        open={creating}
        onClose={() => setCreating(false)}
        title="Add model"
      >
        <MobileModelForm
          brands={brands}
          onSaved={() => {
            refresh();
          }}
          onClose={() => setCreating(false)}
        />
      </AdminDialog>

      <AdminDialog
        open={editing !== undefined}
        onClose={() => setEditing(undefined)}
        title={`Edit ${editing?.name ?? "model"}`}
      >
        {editing ? (
          <MobileModelForm
            key={editing._id}
            initial={editing}
            brands={brands}
            onSaved={refresh}
            onClose={() => setEditing(undefined)}
          />
        ) : null}
      </AdminDialog>

      <ConfirmDialog
        open={Boolean(deactivating)}
        title="Archive model?"
        description={`"${deactivating?.name ?? ""}" will be archived and hidden from the storefront. You can reactivate it later from the edit form.`}
        confirmLabel={deactivatingPending ? "Archiving…" : "Archive model"}
        onClose={() => setDeactivating(null)}
        onConfirm={handleDeactivate}
      />
      {deactivateError ? (
        <p
          role="alert"
          className="fixed bottom-4 right-4 z-50 rounded-md border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive shadow-lg"
        >
          {deactivateError}
        </p>
      ) : null}
    </div>
  );
}