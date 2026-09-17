"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CatalogPagination } from "@/components/admin/catalog-pagination";
import { CatalogToolbar } from "@/components/admin/catalog-toolbar";
import { useAdminList } from "@/components/admin/use-admin-list";
import { buildModelGroups } from "@/components/admin/catalog-utils";
import {
  AddProductDialog,
  ArchiveProductDialog,
  EditProductDialog,
} from "@/components/admin/products/product-dialogs";
import { ProductTable } from "@/components/admin/products/product-table";
import { apiRequest, AdminApiError, AdminUnauthorized } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { LoadingState } from "@/components/ui/states";
import type {
  BrandRow,
  MobileModelRow,
  ProductRow,
  ProductStatus,
  StockRow,
} from "@/types/catalog";
import type { PaginatedResult } from "@/types/pagination";

const PAGE_SIZE = 10;
const REFS_PAGE_SIZE = 100;

type StatusFilter = "all" | ProductStatus;

export function ProductAdmin() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [modelFilter, setModelFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [models, setModels] = useState<MobileModelRow[]>([]);
  const [stockMap, setStockMap] = useState<Record<string, StockRow>>({});

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [archiving, setArchiving] = useState<ProductRow | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      apiRequest<PaginatedResult<BrandRow>>(
        `/api/admin/brands?page=1&pageSize=${REFS_PAGE_SIZE}&includeArchived=true`,
      ),
      apiRequest<PaginatedResult<MobileModelRow>>(
        `/api/admin/mobile-models?page=1&pageSize=${REFS_PAGE_SIZE}&includeArchived=true`,
      ),
    ])
      .then(([brandResult, modelResult]) => {
        if (cancelled) return;
        setBrands(
          brandResult.status === "fulfilled" ? brandResult.value.items : [],
        );
        setModels(
          modelResult.status === "fulfilled" ? modelResult.value.items : [],
        );
      })
      .catch((cause) => {
        if (!cancelled && cause instanceof AdminUnauthorized) {
          router.push("/admin/login");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(PAGE_SIZE),
    includeArchived: "true",
    sort: "newest",
  });
  if (search) {
    params.set("q", search);
  }
  if (status !== "all") {
    params.set("status", status);
  }
  if (brandFilter !== "all") {
    params.set("brandId", brandFilter);
  }
  if (modelFilter !== "all") {
    params.set("mobileModelId", modelFilter);
  }

  const { data, loading, error, refresh } = useAdminList<ProductRow>(
    `/api/admin/products?${params.toString()}`,
  );

  useEffect(() => {
    const ids = (data?.items ?? []).map((product) => product._id);
    if (ids.length === 0) {
      queueMicrotask(() => setStockMap({}));
      return;
    }
    let cancelled = false;
    apiRequest<PaginatedResult<StockRow>>(
      `/api/inventory?productIds=${ids.join(",")}&pageSize=${ids.length}`,
    )
      .then((result) => {
        if (!cancelled) {
          const next: Record<string, StockRow> = {};
          for (const item of result.items) {
            next[item.productId] = item;
          }
          setStockMap(next);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStockMap({});
        }
      });
    return () => {
      cancelled = true;
    };
  }, [data]);

  const modelGroups = buildModelGroups(
    models.filter(
      (model) =>
        model.status === "active" &&
        (brandFilter === "all" || model.brandId === brandFilter),
    ),
    brands,
  );

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setStatus("all");
    setBrandFilter("all");
    setModelFilter("all");
    setPage(1);
  }

  function handleBrandFilterChange(value: string) {
    setBrandFilter(value);
    setModelFilter("all");
    setPage(1);
  }

  async function handleArchive() {
    if (!archiving) {
      return;
    }
    setActionError(null);
    try {
      await apiRequest<ProductRow>(`/api/admin/products/${archiving._id}`, {
        method: "DELETE",
      });
      setArchiving(null);
      refresh();
    } catch (cause) {
      if (cause instanceof AdminUnauthorized) {
        router.push("/admin/login");
        return;
      }
      setActionError(
        cause instanceof AdminApiError
          ? cause.message
          : "Something went wrong.",
      );
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
        searchPlaceholder="Search products by name…"
        countLabel={
          result ? `${result.total} product${result.total === 1 ? "" : "s"}` : ""
        }
        action={
          <Button onClick={() => setCreating(true)}>Add product</Button>
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
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </Select>
        </label>
        <label>
          <span className="sr-only">Filter by brand</span>
          <Select
            value={brandFilter}
            onChange={(event) => handleBrandFilterChange(event.target.value)}
            className="w-full sm:w-auto"
          >
            <option value="all">All brands</option>
            {brands.map((brand) => (
              <option key={brand._id} value={brand._id}>
                {brand.name}
              </option>
            ))}
          </Select>
        </label>
        <label>
          <span className="sr-only">Filter by mobile model</span>
          <Select
            value={modelFilter}
            onChange={(event) => {
              setModelFilter(event.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto"
          >
            <option value="all">All models</option>
            {modelGroups.map((group) => (
              <optgroup key={group.brandId} label={group.brandName}>
                {group.models.map((model) => (
                  <option key={model._id} value={model._id}>
                    {model.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
        </label>
      </CatalogToolbar>

      {loading ? (
        <LoadingState label="Loading products…" />
      ) : error ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-center"
        >
          <h3 className="font-display text-xl font-semibold">
            Unable to load products
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button className="mt-4" variant="outline" onClick={refresh}>
            Try again
          </Button>
        </div>
      ) : result ? (
        <>
          <ProductTable
            products={result.items}
            brands={brands}
            models={models}
            stockMap={stockMap}
            onEdit={(product) => setEditing(product)}
            onArchive={(product) => setArchiving(product)}
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

      <AddProductDialog
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={refresh}
        brands={brands}
        models={models}
      />
      <EditProductDialog
        product={editing}
        onClose={() => setEditing(null)}
        onSaved={refresh}
        brands={brands}
        models={models}
      />
      <ArchiveProductDialog
        product={archiving}
        onClose={() => setArchiving(null)}
        onConfirm={handleArchive}
      />
      {actionError ? (
        <p
          role="alert"
          className="fixed bottom-4 right-4 z-50 rounded-md border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive shadow-lg"
        >
          {actionError}
        </p>
      ) : null}
    </div>
  );
}