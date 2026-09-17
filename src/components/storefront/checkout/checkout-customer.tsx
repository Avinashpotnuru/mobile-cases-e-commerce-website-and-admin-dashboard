"use client";

import { Field, Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CheckoutFormData } from "@/lib/storefront/checkout";

type SectionProps = {
  form: CheckoutFormData;
  errors: Record<string, string>;
  disabled: boolean;
  onFieldChange: (key: keyof CheckoutFormData, value: string) => void;
};

export function CustomerSection({
  form,
  errors,
  disabled,
  onFieldChange,
}: SectionProps) {
  return (
    <Card>
      <CardHeader>
        <p className="text-[11px] font-bold tracking-[0.28em] text-accent uppercase">
          {"01 \u00B7 Contact"}
        </p>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Customer information
        </h2>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Email"
            htmlFor="email"
            error={errors.email}
            className="sm:col-span-2"
          >
            <Input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              disabled={disabled}
              value={form.email}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              onChange={(event) => onFieldChange("email", event.target.value)}
            />
          </Field>

          <Field
            label="First name"
            htmlFor="firstName"
            error={errors.firstName}
          >
            <Input
              id="firstName"
              type="text"
              autoComplete="given-name"
              disabled={disabled}
              value={form.firstName}
              aria-invalid={Boolean(errors.firstName)}
              aria-describedby={
                errors.firstName ? "firstName-error" : undefined
              }
              onChange={(event) =>
                onFieldChange("firstName", event.target.value)
              }
            />
          </Field>

          <Field label="Last name" htmlFor="lastName" error={errors.lastName}>
            <Input
              id="lastName"
              type="text"
              autoComplete="family-name"
              disabled={disabled}
              value={form.lastName}
              aria-invalid={Boolean(errors.lastName)}
              aria-describedby={errors.lastName ? "lastName-error" : undefined}
              onChange={(event) =>
                onFieldChange("lastName", event.target.value)
              }
            />
          </Field>

          <Field
            label="Phone number"
            htmlFor="phone"
            error={errors.phone}
            className="sm:col-span-2"
          >
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="+1 (555) 000-0000"
              disabled={disabled}
              value={form.phone}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              onChange={(event) => onFieldChange("phone", event.target.value)}
            />
          </Field>
        </div>
      </CardContent>
    </Card>
  );
}