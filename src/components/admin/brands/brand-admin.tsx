"use client";

import { useEffect, useState } from "react";
import { AdminDialog } from "@/components/admin/admin-dialog";
import { BrandForm } from "@/components/admin/brands/brand-form";
import { BrandTable } from "@/components/admin/brands/brand-table";
import { CatalogPagination } from "@/components/admin/catalog-pagination";
import { CatalogToolbar } from "@/components/admin/catalog-toolbar";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useAdminList } from "@/components/admin/use-admin-list";
import { apiRequest } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { LoadingState } from "@/components/ui/states";
import type { BrandRow, CatalogStatus } from "@/types/catalog";

const PAGE_SIZE = 10;

type StatusFilter = "all" | CatalogStatus;

export function BrandAdmin() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<BrandRow | null | undefined>(undefined);
  const [creating, setCreating] = useState(false);
  const [deactivating, setDeactivating] = useState<BrandRow | null>(null);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);
  const [deactivatingPending, setDeactivatingPending] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(PAGE_SIZE),
  });
  if (search) {
    params.set("search", search);
  }
  if (status !== "all") {
    params.set("status", status);
  }

  const { data, loading, error, refresh } = useAdminList<BrandRow>(
    `/api/admin/brands?${params.toString()}`,
  );

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setStatus("all");
    setPage(1);
  }

  async function handleDeactivate() {
    if (!deactivating) {
      return;
    }
    setDeactivateError(null);
    setDeactivatingPending(true);
    try {
      await apiRequest<BrandRow>(`/api/admin/brands/${deactivating._id}`, {
        method: "DELETE",
      });
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
        searchPlaceholder="Search brands by name or slug…"
        countLabel={
          result ? `${result.total} brand${result.total === 1 ? "" : "s"}` : ""
        }
        action={
          <Button onClick={() => setCreating(true)}>
            <span aria-hidden="true" className="text-lg leading-none">
              +
            </span>
            Add brand
          </Button>
        }
      >
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
        <LoadingState label="Loading brands…" />
      ) : error ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-center"
        >
          <h3 className="font-display text-xl font-semibold">Unable to load brands</h3>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button className="mt-4" variant="outline" onClick={refresh}>
            Try again
          </Button>
        </div>
      ) : result ? (
        <>
          <BrandTable
            brands={result.items}
            onEdit={(brand) => setEditing(brand)}
            onDeactivate={(brand) => setDeactivating(brand)}
          />
          <CatalogPagination
            page={result.page}
            totalPages={result.totalPages}
            start={start}
            end={end}
            total={result.total}
            onPageChange={setPage}
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
        title="Add brand"
      >
        <BrandForm onSaved={refresh} onClose={() => setCreating(false)} />
      </AdminDialog>

      <AdminDialog
        open={editing !== undefined}
        onClose={() => setEditing(undefined)}
        title={`Edit ${editing?.name ?? "brand"}`}
      >
        {editing ? (
          <BrandForm
            key={editing._id}
            initial={editing}
            onSaved={refresh}
            onClose={() => setEditing(undefined)}
          />
        ) : null}
      </AdminDialog>

      <ConfirmDialog
        open={Boolean(deactivating)}
        title="Archive brand?"
        description={`"${deactivating?.name ?? ""}" will be archived and hidden from the storefront. You can reactivate it later from the edit form.`}
        confirmLabel={deactivatingPending ? "Archiving…" : "Archive brand"}
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