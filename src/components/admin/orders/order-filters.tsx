"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  type OrderStatus,
  type PaymentStatus,
} from "@/types/orders";

export function OrderFilters({
  status,
  onStatusChange,
  paymentStatus,
  onPaymentStatusChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}: {
  status: OrderStatus | "all";
  onStatusChange: (value: OrderStatus | "all") => void;
  paymentStatus: PaymentStatus | "all";
  onPaymentStatusChange: (value: PaymentStatus | "all") => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
}) {
  return (
    <>
      <label>
        <span className="sr-only">Filter by order status</span>
        <Select
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as OrderStatus | "all")
          }
          className="w-full sm:w-auto"
        >
          <option value="all">All order statuses</option>
          {ORDER_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </label>
      <label>
        <span className="sr-only">Filter by payment status</span>
        <Select
          value={paymentStatus}
          onChange={(event) =>
            onPaymentStatusChange(
              event.target.value as PaymentStatus | "all",
            )
          }
          className="w-full sm:w-auto"
        >
          <option value="all">All payment statuses</option>
          {PAYMENT_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </label>
      <div className="flex items-end gap-2">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Placed from
          <Input
            type="date"
            value={dateFrom}
            onChange={(event) => onDateFromChange(event.target.value)}
            className="h-10 w-auto"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          to
          <Input
            type="date"
            value={dateTo}
            onChange={(event) => onDateToChange(event.target.value)}
            className="h-10 w-auto"
          />
        </label>
      </div>
    </>
  );
}