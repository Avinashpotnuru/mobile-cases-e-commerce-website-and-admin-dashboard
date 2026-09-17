"use client";

import { Field, Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  COUNTRY_OPTIONS,
  type CheckoutFormData,
} from "@/lib/storefront/checkout";

type SectionProps = {
  form: CheckoutFormData;
  errors: Record<string, string>;
  disabled: boolean;
  onFieldChange: (key: keyof CheckoutFormData, value: string) => void;
};

const selectClasses =
  "h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export function ShippingSection({
  form,
  errors,
  disabled,
  onFieldChange,
}: SectionProps) {
  return (
    <Card>
      <CardHeader>
        <p className="text-[11px] font-bold tracking-[0.28em] text-accent uppercase">
          {"02 \u00B7 Shipping"}
        </p>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Shipping address
        </h2>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.25fr)]">
          <Field
            label="Street address"
            htmlFor="addressLine1"
            error={errors.addressLine1}
            className="sm:col-span-3"
          >
            <Input
              id="addressLine1"
              type="text"
              autoComplete="address-line1"
              placeholder="123 Example Street"
              disabled={disabled}
              value={form.addressLine1}
              aria-invalid={Boolean(errors.addressLine1)}
              aria-describedby={
                errors.addressLine1 ? "addressLine1-error" : undefined
              }
              onChange={(event) =>
                onFieldChange("addressLine1", event.target.value)
              }
            />
          </Field>

          <Field
            label="Apartment, suite, etc."
            htmlFor="addressLine2"
            hint="Optional"
            className="sm:col-span-3"
          >
            <Input
              id="addressLine2"
              type="text"
              autoComplete="address-line2"
              disabled={disabled}
              value={form.addressLine2}
              onChange={(event) =>
                onFieldChange("addressLine2", event.target.value)
              }
            />
          </Field>

          <Field label="City" htmlFor="city" error={errors.city}>
            <Input
              id="city"
              type="text"
              autoComplete="address-level2"
              disabled={disabled}
              value={form.city}
              aria-invalid={Boolean(errors.city)}
              aria-describedby={errors.city ? "city-error" : undefined}
              onChange={(event) => onFieldChange("city", event.target.value)}
            />
          </Field>

          <Field label="State / Region" htmlFor="region" error={errors.region}>
            <Input
              id="region"
              type="text"
              autoComplete="address-level1"
              disabled={disabled}
              value={form.region}
              aria-invalid={Boolean(errors.region)}
              aria-describedby={errors.region ? "region-error" : undefined}
              onChange={(event) => onFieldChange("region", event.target.value)}
            />
          </Field>

          <Field
            label="Postal code"
            htmlFor="postalCode"
            error={errors.postalCode}
          >
            <Input
              id="postalCode"
              type="text"
              autoComplete="postal-code"
              inputMode="numeric"
              disabled={disabled}
              value={form.postalCode}
              aria-invalid={Boolean(errors.postalCode)}
              aria-describedby={
                errors.postalCode ? "postalCode-error" : undefined
              }
              onChange={(event) =>
                onFieldChange("postalCode", event.target.value)
              }
            />
          </Field>

          <Field
            label="Country"
            htmlFor="country"
            error={errors.country}
            className="sm:col-span-3"
          >
            <select
              id="country"
              autoComplete="country"
              disabled={disabled}
              value={form.country}
              aria-invalid={Boolean(errors.country)}
              aria-describedby={errors.country ? "country-error" : undefined}
              onChange={(event) => onFieldChange("country", event.target.value)}
              className={selectClasses}
            >
              {COUNTRY_OPTIONS.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </CardContent>
    </Card>
  );
}