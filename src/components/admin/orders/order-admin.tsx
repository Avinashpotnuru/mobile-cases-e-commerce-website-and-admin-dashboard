"use client";

import { useEffect, useState } from "react";
import { CatalogPagination } from "@/components/admin/catalog-pagination";
import { CatalogToolbar } from "@/components/admin/catalog-toolbar";
import { useAdminList } from "@/components/admin/use-admin-list";
import { OrderDetailDialog } from "@/components/admin/orders/order-detail-dialog";
import { OrderFilters } from "@/components/admin/orders/order-filters";
import { OrderTable } from "@/components/admin/orders/order-table";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/states";
import type {
  OrderListItem,
  OrderStatus,
  PaymentStatus,
} from "@/types/orders";

const PAGE_SIZE = 10;

export function OrderAdmin() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "all">(
    "all",
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<OrderListItem | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (search) {
    params.set("q", search);
  }
  if (status !== "all") {
    params.set("status", status);
  }
  if (paymentStatus !== "all") {
    params.set("paymentStatus", paymentStatus);
  }
  if (dateFrom) {
    params.set("dateFrom", dateFrom);
  }
  if (dateTo) {
    params.set("dateTo", dateTo);
  }

  const { data, loading, error, refresh } = useAdminList<OrderListItem>(
    `/api/admin/orders?${params.toString()}`,
  );

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setStatus("all");
    setPaymentStatus("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  const result = data;
  const start = result ? (result.page - 1) * result.pageSize + 1 : 0;
  const end = result ? Math.min(result.page * result.pageSize, result.total) : 0;

  return (
    <div className="flex flex-col gap-4">
      <CatalogToolbar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="Search by order number or customer…"
        countLabel={
          result ? `${result.total} order${result.total === 1 ? "" : "s"}` : ""
        }
      >
        <OrderFilters
          status={status}
          onStatusChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          paymentStatus={paymentStatus}
          onPaymentStatusChange={(value) => {
            setPaymentStatus(value);
            setPage(1);
          }}
          dateFrom={dateFrom}
          onDateFromChange={(value) => {
            setDateFrom(value);
            setPage(1);
          }}
          dateTo={dateTo}
          onDateToChange={(value) => {
            setDateTo(value);
            setPage(1);
          }}
        />
      </CatalogToolbar>

      {loading ? (
        <LoadingState label="Loading orders…" />
      ) : error ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-center"
        >
          <h3 className="font-display text-xl font-semibold">
            Unable to load orders
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button className="mt-4" variant="outline" onClick={refresh}>
            Try again
          </Button>
        </div>
      ) : result ? (
        <>
          <OrderTable orders={result.items} onView={setSelected} />
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

      <OrderDetailDialog
        order={selected}
        onClose={() => setSelected(null)}
        onSaved={refresh}
      />
    </div>
  );
}