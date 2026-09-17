"use client";

import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import type { CartState } from "@/lib/storefront/cart";
import {
  computeCheckoutCosts,
  emptyCheckoutForm,
  validateCheckoutForm,
  type CheckoutCosts,
  type CheckoutFormData,
} from "@/lib/storefront/checkout";
import { CustomerSection } from "./checkout-customer";
import { ShippingSection } from "./checkout-shipping";
import { DeliverySection } from "./checkout-delivery";
import { PaymentSection } from "./checkout-payment";
import { CheckoutSummary } from "./checkout-summary";

type CheckoutViewProps = {
  initialCart: CartState;
};

type ApiPayload = {
  ok?: boolean;
  data?: { cart: CartState; costs: CheckoutCosts };
  error?: {
    message?: string;
    fieldErrors?: Record<string, string>;
  };
};

type VerifiedCheckout = {
  cart: CartState;
  costs: CheckoutCosts;
};

function focusFirstError(fieldErrors: Record<string, string>) {
  const first = Object.keys(fieldErrors)[0];
  if (first) document.getElementById(first)?.focus();
}

export function CheckoutView({ initialCart }: CheckoutViewProps) {
  const [form, setForm] = useState<CheckoutFormData>(emptyCheckoutForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [verified, setVerified] = useState<VerifiedCheckout | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const cart = verified?.cart ?? initialCart;
  const costs = verified?.costs ?? computeCheckoutCosts(cart);

  const onFieldChange = useCallback(
    (key: keyof CheckoutFormData, value: string) => {
      setForm((previous) => ({ ...previous, [key]: value }) as CheckoutFormData);
      setErrors((previous) => {
        if (!(key in previous)) return previous;
        const next = { ...previous };
        delete next[key];
        return next;
      });
      setFormError(null);
    },
    [],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const clientErrors = validateCheckoutForm(form);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      focusFirstError(clientErrors);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as ApiPayload;
      if (!response.ok || payload.ok === false || !payload.data) {
        setSubmitting(false);
        if (payload.error?.fieldErrors) {
          const serverErrors = payload.error.fieldErrors;
          setErrors(serverErrors);
          focusFirstError(serverErrors);
        } else {
          setFormError(
            payload.error?.message ??
              "We couldn't verify your details. Please try again.",
          );
        }
        return;
      }
      setVerified(payload.data);
    } catch {
      setErrors({});
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]"
    >
      {formError ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive lg:col-span-2"
        >
          {formError}
        </div>
      ) : null}

      <div className="space-y-6">
        <CustomerSection
          form={form}
          errors={errors}
          disabled={submitting}
          onFieldChange={onFieldChange}
        />
        <ShippingSection
          form={form}
          errors={errors}
          disabled={submitting}
          onFieldChange={onFieldChange}
        />
        <DeliverySection
          form={form}
          errors={errors}
          costs={costs}
          disabled={submitting}
          onFieldChange={onFieldChange}
        />
        <PaymentSection />
      </div>

      <CheckoutSummary
        cart={cart}
        costs={costs}
        submitting={submitting}
        verified={verified !== null}
      />
    </form>
  );
}