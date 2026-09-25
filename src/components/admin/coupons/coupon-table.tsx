"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ActiveStatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnMetaShape } from "@/components/admin/data-table";
import { EmptyState } from "@/components/ui/states";
import type { CouponRow } from "@/types/catalog";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const moneyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const moneyLabel = (cents: number | undefined): string | undefined =>
  cents === undefined ? undefined : moneyFormatter.format(cents / 100);

const discountLabel = (coupon: CouponRow): string =>
  coupon.type === "percent"
    ? `${coupon.value}% off`
    : `${moneyLabel(coupon.value) ?? coupon.value} off`;

function rulesOf(coupon: CouponRow): string[] {
  return [
    moneyLabel(coupon.minSubtotalCents)
      ? `Min order ${moneyLabel(coupon.minSubtotalCents)}`
      : null,
    moneyLabel(coupon.maxDiscountCents)
      ? `Max ${moneyLabel(coupon.maxDiscountCents)}`
      : null,
    coupon.expiresAt
      ? `Expires ${dateFormatter.format(new Date(coupon.expiresAt))}`
      : null,
  ].filter(Boolean) as string[];
}

function columns({
  onEdit,
  onDeactivate,
}: {
  onEdit: (coupon: CouponRow) => void;
  onDeactivate: (coupon: CouponRow) => void;
}): ColumnDef<CouponRow, unknown>[] {
  return [
    {
      accessorKey: "code",
      enableSorting: true,
      header: "Code",
      cell: (info) => (
        <span className="font-mono text-sm font-semibold">
          {info.getValue<string>()}
        </span>
      ),
    },
    {
      accessorKey: "type",
      header: "Discount",
      meta: { csv: { header: "Discount", value: discountLabel } },
      cell: (info) => discountLabel(info.row.original),
    },
    {
      accessorKey: "value",
      enableSorting: true,
      header: "Rules",
      meta: {
        csv: {
          header: "Rules",
          value: (coupon) => {
            const rules = rulesOf(coupon);
            return rules.length > 0 ? rules.join(" · ") : "";
          },
        },
      } satisfies ColumnMetaShape<CouponRow>,
      cell: (info) => {
        const coupon = info.row.original;
        const rules = rulesOf(coupon);
        return (
          <p className="max-w-60 truncate text-muted-foreground">
            {rules.length > 0 ? rules.join(" · ") : "\u2014"}
          </p>
        );
      },
    },
    {
      accessorKey: "usedCount",
      header: "Used",
      cell: (info) => {
        const coupon = info.row.original;
        return (
          <span className="tabular-nums text-muted-foreground">
            {coupon.usageLimit
              ? `${coupon.usedCount}/${coupon.usageLimit}`
              : String(coupon.usedCount)}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => (
        <ActiveStatusBadge
          active={info.getValue<CouponRow["status"]>() === "active"}
        />
      ),
    },
    {
      accessorFn: (coupon) => new Date(coupon.updatedAt).getTime(),
      enableSorting: true,
      meta: {
        align: "right",
        csv: { header: "Updated", value: (coupon) => coupon.updatedAt },
      } satisfies ColumnMetaShape<CouponRow>,
      header: "Updated",
      cell: (info) => (
        <span className="tabular-nums text-muted-foreground">
          {dateFormatter.format(new Date(info.getValue<number>()))}
        </span>
      ),
    },
    {
      id: "actions",
      enableSorting: false,
      meta: { align: "right", csv: { exclude: true } },
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row.original)}
          >
            Edit
          </Button>
          {row.original.status === "active" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeactivate(row.original)}
            >
              Deactivate
            </Button>
          ) : null}
        </div>
      ),
    },
  ];
}

export function CouponTable({
  coupons,
  onEdit,
  onDeactivate,
  onBulkDeactivate,
}: {
  coupons: CouponRow[];
  onEdit: (coupon: CouponRow) => void;
  onDeactivate: (coupon: CouponRow) => void;
  onBulkDeactivate: (coupons: CouponRow[]) => Promise<void> | void;
}) {
  if (coupons.length === 0) {
    return (
      <EmptyState
        title="No coupons found"
        description="Try adjusting your search or filters, or add a new coupon."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <DataTable
        columns={columns({ onEdit, onDeactivate })}
        data={coupons}
        getRowId={(coupon) => coupon._id}
        minWidth={760}
        preferenceKey="coupons"
        exportFilename="coupons.csv"
        bulkActions={[
          {
            label: "Deactivate",
            variant: "outline",
            onAction: onBulkDeactivate,
          },
        ]}
        expandContent={({ row }) => {
          const coupon = row.original;
          const rules = rulesOf(coupon);
          return (
            <div className="grid gap-x-8 gap-y-5 text-sm sm:grid-cols-3">
              <dl className="space-y-0.5">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Code
                </dt>
                <dd className="font-mono font-semibold">{coupon.code}</dd>
                <dd>{discountLabel(coupon)}</dd>
              </dl>
              <dl className="space-y-0.5">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Rules
                </dt>
                <dd>{rules.length > 0 ? rules.join(" · ") : "\u2014"}</dd>
              </dl>
              <dl className="space-y-0.5">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Usage
                </dt>
                <dd className="tabular-nums">
                  {coupon.usageLimit
                    ? `${coupon.usedCount} / ${coupon.usageLimit} redemptions`
                    : `${coupon.usedCount} redemptions`}
                </dd>
                <dd className="text-xs text-muted-foreground">
                  Status: <span className="capitalize">{coupon.status}</span>
                </dd>
              </dl>
            </div>
          );
        }}
      />
    </div>
  );
}