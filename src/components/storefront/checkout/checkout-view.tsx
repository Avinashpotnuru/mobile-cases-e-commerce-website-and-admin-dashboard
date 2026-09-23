"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
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
import { useCustomer } from "@/components/storefront/use-customer";
import { formatPrice } from "@/components/storefront/home/price";
import type { AddressPublic } from "@/lib/services/address-service";

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
  const router = useRouter();
  const customer = useCustomer();
  const [form, setForm] = useState<CheckoutFormData>(emptyCheckoutForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [verified, setVerified] = useState<VerifiedCheckout | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<AddressPublic[]>([]);
  const [saveAddress, setSaveAddress] = useState(false);
  const [couponValue, setCouponValue] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountCents: number;
  } | null>(null);
  const [couponStatus, setCouponStatus] = useState<
    "idle" | "checking" | "applied" | "error"
  >("idle");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const idempotencyKey = useRef<string | null>(null);

  useEffect(() => {
    const id = window.setTimeout(async () => {
      if (!customer) {
        setSavedAddresses([]);
        setSaveAddress(false);
        return;
      }
      try {
        const response = await fetch("/api/account/addresses");
        const payload = (await response.json()) as {
          data?: { addresses?: AddressPublic[] };
        };
        if (response.ok && Array.isArray(payload.data?.addresses)) {
          setSavedAddresses(payload.data.addresses);
        }
      } catch {
        setSavedAddresses([]);
      }
    }, 0);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer?.id]);

  const cart = verified?.cart ?? initialCart;
  const costs =
    verified?.costs ??
    computeCheckoutCosts(
      cart,
      appliedCoupon
        ? {
            couponCode: appliedCoupon.code,
            discountCents: appliedCoupon.discountCents,
          }
        : undefined,
    );

  const couponCodeForOrder =
    verified?.costs.couponCode ?? appliedCoupon?.code;

  const applyCoupon = async (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code || couponStatus === "checking") return;
    if (cart.subtotalCents <= 0) {
      setCouponStatus("error");
      setCouponMessage("Add items to your cart before applying a coupon.");
      return;
    }
    setCouponStatus("checking");
    setCouponMessage(null);
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          subtotalCents: cart.subtotalCents,
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        data?: { code: string; discountCents: number };
        error?: { message?: string };
      };
      if (!response.ok || payload.ok === false || !payload.data) {
        setCouponStatus("error");
        setCouponMessage(
          payload.error?.message ?? "This coupon couldn't be applied.",
        );
        return;
      }
      setAppliedCoupon({
        code: payload.data.code,
        discountCents: payload.data.discountCents,
      });
      setCouponStatus("applied");
      setCouponValue("");
      setCouponMessage(
        `${payload.data.code} applied — you saved ${formatPrice({
          priceCents: payload.data.discountCents,
          currency: costs.currency,
        })}.`,
      );
      setVerified(null);
    } catch {
      setCouponStatus("error");
      setCouponMessage("Something went wrong. Please try again.");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponStatus("idle");
    setCouponMessage(null);
    setVerified(null);
  };

  const applySavedAddress = (address: AddressPublic) => {
    setForm({
      ...form,
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      region: address.region,
      postalCode: address.postalCode,
      country: address.country,
    });
    setFormError(null);
  };

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

  const placeOrder = useCallback(
    async (payload: CheckoutFormData) => {
      if (!idempotencyKey.current) {
        idempotencyKey.current =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `order_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      }
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idempotencyKey.current,
          ...payload,
          ...(couponCodeForOrder
            ? { couponCode: couponCodeForOrder }
            : {}),
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        data?: {
          order?: { _id: string; accessCode: string };
        };
        error?: { message?: string };
      };
      if (!response.ok || data.ok === false || !data.data?.order) {
        throw new Error(
          data.error?.message ?? "We couldn't place your order. Please try again.",
        );
      }
      if (saveAddress && customer) {
        try {
          await fetch("/api/account/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              label: "Default",
              firstName: payload.firstName,
              lastName: payload.lastName,
              phone: payload.phone,
              addressLine1: payload.addressLine1,
              addressLine2: payload.addressLine2,
              city: payload.city,
              region: payload.region,
              postalCode: payload.postalCode,
              country: payload.country,
              makeDefault: true,
            }),
          });
        } catch {
          // Saving an address is best-effort and must not block the order.
        }
      }
      const order = data.data.order;
      router.push(
        `/order-confirmation/${order._id}?access=${encodeURIComponent(order.accessCode)}`,
      );
    },
    [router, saveAddress, customer, couponCodeForOrder],
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

    if (verified) {
      setSubmitting(true);
      try {
        await placeOrder(form);
      } catch (error) {
        setSubmitting(false);
        setFormError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
      }
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          ...(couponCodeForOrder
            ? { couponCode: couponCodeForOrder }
            : {}),
        }),
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
        {savedAddresses.length > 0 ? (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <label
              htmlFor="saved-address"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-accent"
            >
              Use a saved address
            </label>
            <select
              id="saved-address"
              value=""
              disabled={submitting}
              onChange={(event) => {
                const found = savedAddresses.find(
                  (address) => address.id === event.target.value,
                );
                if (found) applySavedAddress(found);
              }}
              className="mt-2 h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select an address to prefill…</option>
              {savedAddresses.map((address) => (
                <option key={address.id} value={address.id}>
                  {address.label ? `${address.label} — ` : ""}
                  {address.addressLine1}, {address.city}, {address.region}{" "}
                  {address.postalCode}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {customer ? (
          <label className="flex cursor-pointer items-center gap-2.5 rounded-2xl border border-border bg-card px-5 py-4 text-sm text-foreground shadow-sm">
            <input
              type="checkbox"
              checked={saveAddress}
              disabled={submitting}
              onChange={(event) => setSaveAddress(event.target.checked)}
              className="h-4 w-4 accent-amber-500"
            />
            Save this address to my account for next time
          </label>
        ) : null}

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
        couponValue={couponValue}
        onCouponChange={setCouponValue}
        onApplyCoupon={applyCoupon}
        onRemoveCoupon={removeCoupon}
        couponStatus={couponStatus}
        couponMessage={couponMessage}
      />
    </form>
  );
}