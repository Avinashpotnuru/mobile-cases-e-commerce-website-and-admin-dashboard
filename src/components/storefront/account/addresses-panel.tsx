"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import {
  COUNTRY_OPTIONS,
  DEFAULT_COUNTRY,
} from "@/lib/storefront/checkout";
import type { AddressPublic } from "@/lib/services/address-service";

type ApiErrorPayload = {
  error?: {
    message?: string;
    fieldErrors?: Record<string, string>;
  };
};

type AddressFormState = {
  label: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  makeDefault: boolean;
};

const emptyForm = (overrides: Partial<AddressFormState> = {}): AddressFormState => ({
  label: "",
  firstName: "",
  lastName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  region: "",
  postalCode: "",
  country: DEFAULT_COUNTRY,
  makeDefault: false,
  ...overrides,
});

const selectClasses =
  "h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

function countryLabel(code: string): string {
  return COUNTRY_OPTIONS.find((c) => c.code === code)?.label ?? code;
}

function AddressFormFields({
  form,
  errors,
  disabled,
  onChange,
  onCountryChange,
  onMakeDefaultChange,
}: {
  form: AddressFormState;
  errors: Record<string, string>;
  disabled: boolean;
  onChange: (key: keyof AddressFormState, value: string) => void;
  onCountryChange: (value: string) => void;
  onMakeDefaultChange: (value: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Field label="Label (optional)" htmlFor="addr-label" hint='e.g. "Home"'>
          <Input
            id="addr-label"
            value={form.label}
            disabled={disabled}
            onChange={(event) => onChange("label", event.target.value)}
          />
        </Field>
        <div className="hidden sm:block" />
        <Field label="First name" htmlFor="addr-first" error={errors.firstName}>
          <Input
            id="addr-first"
            autoComplete="given-name"
            value={form.firstName}
            disabled={disabled}
            onChange={(event) => onChange("firstName", event.target.value)}
          />
        </Field>
        <Field label="Last name" htmlFor="addr-last" error={errors.lastName}>
          <Input
            id="addr-last"
            autoComplete="family-name"
            value={form.lastName}
            disabled={disabled}
            onChange={(event) => onChange("lastName", event.target.value)}
          />
        </Field>
        <Field label="Phone number" htmlFor="addr-phone" error={errors.phone}>
          <Input
            id="addr-phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            disabled={disabled}
            onChange={(event) => onChange("phone", event.target.value)}
          />
        </Field>
        <div className="hidden sm:block" />
        <Field
          label="Street address"
          htmlFor="addr-line1"
          error={errors.addressLine1}
          className="sm:col-span-2"
        >
          <Input
            id="addr-line1"
            autoComplete="address-line1"
            value={form.addressLine1}
            disabled={disabled}
            onChange={(event) => onChange("addressLine1", event.target.value)}
          />
        </Field>
        <Field
          label="Apartment, suite, etc."
          htmlFor="addr-line2"
          hint="Optional"
          className="sm:col-span-2"
        >
          <Input
            id="addr-line2"
            autoComplete="address-line2"
            value={form.addressLine2}
            disabled={disabled}
            onChange={(event) => onChange("addressLine2", event.target.value)}
          />
        </Field>
        <Field label="City" htmlFor="addr-city" error={errors.city}>
          <Input
            id="addr-city"
            autoComplete="address-level2"
            value={form.city}
            disabled={disabled}
            onChange={(event) => onChange("city", event.target.value)}
          />
        </Field>
        <Field label="State / Region" htmlFor="addr-region" error={errors.region}>
          <Input
            id="addr-region"
            autoComplete="address-level1"
            value={form.region}
            disabled={disabled}
            onChange={(event) => onChange("region", event.target.value)}
          />
        </Field>
        <Field
          label="Postal code"
          htmlFor="addr-postal"
          error={errors.postalCode}
        >
          <Input
            id="addr-postal"
            inputMode="numeric"
            autoComplete="postal-code"
            value={form.postalCode}
            disabled={disabled}
            onChange={(event) => onChange("postalCode", event.target.value)}
          />
        </Field>
        <div className="hidden sm:block" />
        <Field
          label="Country"
          htmlFor="addr-country"
          error={errors.country}
          className="sm:col-span-2"
        >
          <select
            id="addr-country"
            autoComplete="country"
            value={form.country}
            disabled={disabled}
            onChange={(event) => onCountryChange(event.target.value)}
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

      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
        <input
          type="checkbox"
          checked={form.makeDefault}
          disabled={disabled}
          onChange={(event) => onMakeDefaultChange(event.target.checked)}
          className="h-4 w-4 accent-amber-500"
        />
        Make this my default shipping address
      </label>
    </div>
  );
}

export function AddressesPanel({
  initialAddresses,
}: {
  initialAddresses: AddressPublic[];
}) {
  const router = useRouter();
  const [addresses, setAddresses] = useState<AddressPublic[]>(initialAddresses);
  const [mode, setMode] = useState<
    { kind: "list" } | { kind: "create"; form: AddressFormState } | { kind: "edit"; id: string; form: AddressFormState }
  >({ kind: "list" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function refresh() {
    const response = await fetch("/api/account/addresses");
    const payload = (await response.json()) as { data?: { addresses?: AddressPublic[] } };
    if (response.ok && Array.isArray(payload.data?.addresses)) {
      setAddresses(payload.data.addresses);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode.kind === "list") return;
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      const { makeDefault, ...form } = mode.form;
      const isEdit = mode.kind === "edit";
      const response = await fetch(
        isEdit ? `/api/account/addresses/${mode.id}` : "/api/account/addresses",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ...form, makeDefault }),
        },
      );
      const payload = (await response.json()) as ApiErrorPayload;
      if (!response.ok) {
        if (payload.error?.fieldErrors) {
          setFieldErrors(payload.error.fieldErrors);
        } else {
          setError(payload.error?.message ?? "Please try again.");
        }
        return;
      }
      await refresh();
      setMode({ kind: "list" });
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(addressId: string) {
    if (!window.confirm("Delete this saved address?")) return;
    setSubmitting(true);
    try {
      const response = await fetch(`/api/account/addresses/${addressId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const payload = (await response.json()) as ApiErrorPayload;
        setError(payload.error?.message ?? "Could not delete the address.");
        return;
      }
      await refresh();
      setMode({ kind: "list" });
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSetDefault(addressId: string) {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/account/addresses/${addressId}`, {
        method: "POST",
      });
      if (!response.ok) {
        const payload = (await response.json()) as ApiErrorPayload;
        setError(payload.error?.message ?? "Could not update the address.");
        return;
      }
      await refresh();
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const updateField = (key: keyof AddressFormState, value: string) => {
    if (mode.kind === "list") return;
    setMode({
      ...mode,
      form: { ...mode.form, [key]: value },
    });
    setFieldErrors((previous) => {
      if (!(key in previous)) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  };

  const editingForm =
    mode.kind === "create"
      ? mode.form
      : mode.kind === "edit"
        ? mode.form
        : emptyForm();

  return (
    <div className="space-y-8">
      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive"
        >
          {error}
        </p>
      ) : null}

      {mode.kind === "list" || addresses.length === 0 ? (
        <>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              {addresses.length === 0 ? "Saved addresses" : `Saved addresses (${addresses.length})`}
            </h2>
            <Button
              variant="outline"
              disabled={submitting}
              onClick={() => setMode({ kind: "create", form: emptyForm() })}
            >
              Add new address
            </Button>
          </div>

          {addresses.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
              No addresses saved yet. Add one so checkout is a breeze.
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {addresses.map((address) => (
                <li
                  key={address.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {address.label ? (
                        <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">
                          {address.label}
                        </p>
                      ) : null}
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {address.firstName} {address.lastName}
                      </p>
                    </div>
                    {address.isDefault ? (
                      <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                        Default
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {address.addressLine1}
                    {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                    <br />
                    {address.city}, {address.region} {address.postalCode}
                    <br />
                    {countryLabel(address.country)}
                    <br />
                    {address.phone}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {!address.isDefault ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={submitting}
                        onClick={() => handleSetDefault(address.id)}
                      >
                        Set default
                      </Button>
                    ) : null}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={submitting}
                      onClick={() =>
                        setMode({
                          kind: "edit",
                          id: address.id,
                          form: emptyForm({
                            label: address.label,
                            firstName: address.firstName,
                            lastName: address.lastName,
                            phone: address.phone,
                            addressLine1: address.addressLine1,
                            addressLine2: address.addressLine2,
                            city: address.city,
                            region: address.region,
                            postalCode: address.postalCode,
                            country: address.country,
                            makeDefault: address.isDefault,
                          }),
                        })
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      disabled={submitting}
                      onClick={() => handleDelete(address.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}

      {mode.kind === "create" || mode.kind === "edit" ? (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
            {mode.kind === "create" ? "Add an address" : "Edit address"}
          </h2>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
            <AddressFormFields
              form={editingForm}
              errors={fieldErrors}
              disabled={submitting}
              onChange={updateField}
              onCountryChange={(value) => updateField("country", value)}
              onMakeDefaultChange={(value) => {
                setMode({ ...mode, form: { ...mode.form, makeDefault: value } });
              }}
            />
            <div className="flex flex-wrap gap-3">
              <Button type="submit" loading={submitting}>
                {mode.kind === "create" ? "Save address" : "Save changes"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={submitting}
                onClick={() => setMode({ kind: "list" })}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}