"use client";

import { cn } from "@/components/ui/cn";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatPrice } from "@/components/storefront/home/price";
import { FREE_SHIPPING_THRESHOLD_CENTS } from "@/lib/storefront/cart-constants";
import {
  DELIVERY_OPTIONS,
  type CheckoutCosts,
  type CheckoutFormData,
} from "@/lib/storefront/checkout";

type SectionProps = {
  form: CheckoutFormData;
  errors: Record<string, string>;
  costs: CheckoutCosts;
  disabled: boolean;
  onFieldChange: (key: keyof CheckoutFormData, value: string) => void;
};

export function DeliverySection({
  form,
  errors,
  costs,
  disabled,
  onFieldChange,
}: SectionProps) {
  return (
    <Card>
      <CardHeader>
        <p className="text-[11px] font-bold tracking-[0.28em] text-accent uppercase">
          {"03 \u00B7 Delivery"}
        </p>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Delivery information
        </h2>
      </CardHeader>
      <CardContent>
        <fieldset disabled={disabled}>
          <legend className="sr-only">Delivery method</legend>
          <div className="space-y-3">
            {DELIVERY_OPTIONS.map((option) => {
              const selected = form.deliveryMethod === option.id;
              return (
                <label
                  key={option.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors focus-within:ring-2 focus-within:ring-ring",
                    selected
                      ? "border-accent/60 bg-accent/5"
                      : "border-border hover:border-accent/30",
                  )}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value={option.id}
                    checked={selected}
                    onChange={() => onFieldChange("deliveryMethod", option.id)}
                    className="h-4 w-4 accent-accent"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">
                      {option.label}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Arrives in {option.estimate}
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-foreground tabular-nums">
                    {costs.shippingFree ? (
                      <span className="text-success">Free</span>
                    ) : (
                      formatPrice({
                        priceCents: costs.shippingCents,
                        currency: costs.currency,
                      })
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
        {errors.deliveryMethod ? (
          <p
            role="alert"
            className="mt-2 text-sm text-destructive"
            id="deliveryMethod-error"
          >
            {errors.deliveryMethod}
          </p>
        ) : null}
        {!costs.shippingFree ? (
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Free delivery is unlocked when your subtotal reaches {formatPrice({
              priceCents: FREE_SHIPPING_THRESHOLD_CENTS,
              currency: costs.currency,
            })}. Shipping is calculated by the server and added to your order
            total.
          </p>
        ) : (
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Your order qualifies for free standard delivery.
          </p>
        )}
      </CardContent>
    </Card>
  );
}