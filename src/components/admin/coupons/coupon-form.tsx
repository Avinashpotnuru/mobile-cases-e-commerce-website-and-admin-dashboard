"use client";

import { useState, type FormEvent } from "react";
import { AdminApiError, apiRequest } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { CouponRow, CouponStatus, CouponType } from "@/types/catalog";

type FieldErrors = Partial<
  Record<
    | "code"
    | "type"
    | "value"
    | "minSubtotalCents"
    | "maxDiscountCents"
    | "expiresAt"
    | "usageLimit"
    | "status",
    string
  >
>;

type CouponFormValues = {
  code?: string;
  type?: CouponType;
  value?: number;
  minSubtotalCents?: number | null;
  maxDiscountCents?: number | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  status?: CouponStatus;
};

function moneyToCents(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined as unknown as number;
  }
  if (!/^\d+(?:\.\d{1,2})?$/.test(trimmed)) {
    return null;
  }
  const dollars = Number(trimmed);
  if (!Number.isFinite(dollars)) {
    return null;
  }
  return Math.round(dollars * 100);
}

function centsToMoney(value: number | undefined): string {
  if (value === undefined) {
    return "";
  }
  const dollars = value / 100;
  return Number.isInteger(dollars) ? String(dollars) : dollars.toFixed(2);
}

function dateToInput(value: string | undefined): string {
  if (!value) {
    return "";
  }
  return value.slice(0, 10);
}

export function CouponForm({
  initial,
  onSaved,
  onClose,
}: {
  initial?: CouponRow;
  onSaved: () => void;
  onClose: () => void;
}) {
  const isEdit = Boolean(initial);
  const [code, setCode] = useState(initial?.code ?? "");
  const [type, setType] = useState<CouponType>(initial?.type ?? "percent");
  const [valueInput, setValueInput] = useState(
    initial ? String(initial.value) : "",
  );
  const [minSubtotalInput, setMinSubtotalInput] = useState(
    initial ? centsToMoney(initial.minSubtotalCents) : "",
  );
  const [maxDiscountInput, setMaxDiscountInput] = useState(
    initial ? centsToMoney(initial.maxDiscountCents) : "",
  );
  const [expiresAtInput, setExpiresAtInput] = useState(
    initial ? dateToInput(initial.expiresAt) : "",
  );
  const [usageLimitInput, setUsageLimitInput] = useState(
    initial?.usageLimit !== undefined ? String(initial.usageLimit) : "",
  );
  const [status, setStatus] = useState<CouponStatus>(
    initial?.status ?? "active",
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setFormError(null);

    const next: FieldErrors = {};
    const cleanedCode = code.trim().toUpperCase();
    if (!cleanedCode) {
      next.code = "Code is required.";
    } else if (!/^[A-Za-z0-9][A-Za-z0-9-_]{2,49}$/.test(cleanedCode)) {
      next.code =
        "Code must be 3–50 letters, numbers, hyphens, or underscores.";
    }

    const parsedValue = Number(valueInput);
    if (!valueInput.trim()) {
      next.value = "Value is required.";
    } else if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      next.value = "Enter a value greater than zero.";
    } else if (type === "percent" && !Number.isInteger(parsedValue)) {
      next.value = "Percentage must be a whole number.";
    } else if (type === "percent" && parsedValue > 99) {
      next.value = "Percentage must be 99 or less.";
    }

    const minSubtotal = moneyToCents(minSubtotalInput);
    if (minSubtotalInput.trim() !== "" && minSubtotal === null) {
      next.minSubtotalCents = "Enter a valid minimum order amount.";
    }
    const maxDiscount = moneyToCents(maxDiscountInput);
    if (maxDiscountInput.trim() !== "" && maxDiscount === null) {
      next.maxDiscountCents = "Enter a valid maximum discount amount.";
    }
    if (expiresAtInput && !/^\d{4}-\d{2}-\d{2}$/.test(expiresAtInput)) {
      next.expiresAt = "Enter a valid date.";
    }
    if (
      usageLimitInput.trim() !== "" &&
      (!/^\d+$/.test(usageLimitInput) || Number(usageLimitInput) < 1)
    ) {
      next.usageLimit = "Usage limit must be a positive whole number.";
    }

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    const numericValue = type === "fixed" ? Math.round(parsedValue * 100) : parsedValue;

    const body: CouponFormValues = {
      code: cleanedCode,
      type,
      value: numericValue,
      ...(minSubtotalInput.trim()
        ? { minSubtotalCents: minSubtotal ?? 0 }
        : { minSubtotalCents: isEdit ? null : undefined }),
      ...(maxDiscountInput.trim()
        ? { maxDiscountCents: maxDiscount ?? 0 }
        : { maxDiscountCents: isEdit ? null : undefined }),
      ...(expiresAtInput
        ? { expiresAt: `${expiresAtInput}T23:59:59` }
        : { expiresAt: isEdit ? null : undefined }),
      ...(usageLimitInput.trim()
        ? { usageLimit: Number(usageLimitInput) }
        : { usageLimit: isEdit ? null : undefined }),
      status,
    };

    setSubmitting(true);
    try {
      await apiRequest<CouponRow>(
        initial ? `/api/admin/coupons/${initial._id}` : "/api/admin/coupons",
        {
          method: initial ? "PATCH" : "POST",
          body,
        },
      );
      onSaved();
      onClose();
    } catch (error) {
      if (error instanceof AdminApiError && error.fieldErrors) {
        setErrors(error.fieldErrors as FieldErrors);
      } else if (error instanceof AdminApiError) {
        setFormError(error.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Code" htmlFor="coupon-code" error={errors.code}>
          <Input
            id="coupon-code"
            name="code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            disabled={submitting}
            autoFocus
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="SAVE20"
            aria-invalid={Boolean(errors.code)}
          />
        </Field>
        <Field label="Status" htmlFor="coupon-status" error={errors.status}>
          <Select
            id="coupon-status"
            name="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as CouponStatus)}
            disabled={submitting}
            aria-invalid={Boolean(errors.status)}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Discount type" htmlFor="coupon-type" error={errors.type}>
          <Select
            id="coupon-type"
            name="type"
            value={type}
            onChange={(event) => {
              setType(event.target.value as CouponType);
              setValueInput("");
            }}
            disabled={submitting}
            aria-invalid={Boolean(errors.type)}
          >
            <option value="percent">Percentage</option>
            <option value="fixed">Fixed amount</option>
          </Select>
        </Field>
        <Field
          label={type === "percent" ? "Discount (%)" : "Discount amount"}
          htmlFor="coupon-value"
          error={errors.value}
        >
          {type === "fixed" ? (
            <div className="relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
              >
                ₹
              </span>
              <Input
                id="coupon-value"
                name="value"
                inputMode="decimal"
                value={valueInput}
                onChange={(event) => setValueInput(event.target.value)}
                disabled={submitting}
                className="pl-8"
                placeholder="200"
                aria-invalid={Boolean(errors.value)}
              />
            </div>
          ) : (
            <Input
              id="coupon-value"
              name="value"
              inputMode="numeric"
              value={valueInput}
              onChange={(event) => setValueInput(event.target.value)}
              disabled={submitting}
              placeholder="20"
              aria-invalid={Boolean(errors.value)}
            />
          )}
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Minimum order amount"
          htmlFor="coupon-min-subtotal"
          hint="Leave blank for no minimum."
          error={errors.minSubtotalCents}
        >
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
            >
              ₹
            </span>
            <Input
              id="coupon-min-subtotal"
              name="minSubtotal"
              inputMode="decimal"
              value={minSubtotalInput}
              onChange={(event) => setMinSubtotalInput(event.target.value)}
              disabled={submitting}
              className="pl-8"
              placeholder="1000"
              aria-invalid={Boolean(errors.minSubtotalCents)}
            />
          </div>
        </Field>
        <Field
          label="Maximum discount"
          htmlFor="coupon-max-discount"
          hint="Leave blank for no cap."
          error={errors.maxDiscountCents}
        >
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
            >
              ₹
            </span>
            <Input
              id="coupon-max-discount"
              name="maxDiscount"
              inputMode="decimal"
              value={maxDiscountInput}
              onChange={(event) => setMaxDiscountInput(event.target.value)}
              disabled={submitting}
              className="pl-8"
              placeholder="300"
              aria-invalid={Boolean(errors.maxDiscountCents)}
            />
          </div>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Expires on"
          htmlFor="coupon-expires"
          hint="Leave blank for no expiry."
          error={errors.expiresAt}
        >
          <Input
            id="coupon-expires"
            name="expiresAt"
            type="date"
            value={expiresAtInput}
            onChange={(event) => setExpiresAtInput(event.target.value)}
            disabled={submitting}
            aria-invalid={Boolean(errors.expiresAt)}
          />
        </Field>
        <Field
          label="Usage limit"
          htmlFor="coupon-usage-limit"
          hint="Leave blank for unlimited."
          error={errors.usageLimit}
        >
          <Input
            id="coupon-usage-limit"
            name="usageLimit"
            inputMode="numeric"
            value={usageLimitInput}
            onChange={(event) => setUsageLimitInput(event.target.value)}
            disabled={submitting}
            placeholder="100"
            aria-invalid={Boolean(errors.usageLimit)}
          />
        </Field>
      </div>

      {formError ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive"
        >
          {formError}
        </p>
      ) : null}

      <div className="mt-2 flex justify-end gap-3">
        <Button
          variant="outline"
          type="button"
          onClick={onClose}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" loading={submitting} disabled={submitting}>
          {initial ? "Save changes" : "Create coupon"}
        </Button>
      </div>
    </form>
  );
}