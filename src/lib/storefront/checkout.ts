import type { CartState } from "@/lib/storefront/cart";
import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  SHIPPING_FEE_CENTS,
} from "@/lib/storefront/cart-constants";

export const DEFAULT_COUNTRY = "US";

export const COUNTRY_OPTIONS: { code: string; label: string }[] = [
  { code: "US", label: "United States" },
  { code: "CA", label: "Canada" },
  { code: "GB", label: "United Kingdom" },
  { code: "IE", label: "Ireland" },
  { code: "DE", label: "Germany" },
  { code: "FR", label: "France" },
  { code: "ES", label: "Spain" },
  { code: "IT", label: "Italy" },
  { code: "NL", label: "Netherlands" },
  { code: "SE", label: "Sweden" },
  { code: "CH", label: "Switzerland" },
  { code: "AU", label: "Australia" },
  { code: "NZ", label: "New Zealand" },
  { code: "IN", label: "India" },
  { code: "JP", label: "Japan" },
  { code: "SG", label: "Singapore" },
  { code: "AE", label: "United Arab Emirates" },
  { code: "MX", label: "Mexico" },
  { code: "BR", label: "Brazil" },
];

const ALLOWED_COUNTRY_CODES = new Set(COUNTRY_OPTIONS.map((c) => c.code));

export const deliveryMethod = "standard" as const;
export type DeliveryMethod = typeof deliveryMethod;

export const DELIVERY_OPTIONS: {
  id: DeliveryMethod;
  label: string;
  estimate: string;
}[] = [
  {
    id: deliveryMethod,
    label: "Standard delivery",
    estimate: "2\u20134 business days",
  },
];

export type CheckoutFormData = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  deliveryMethod: DeliveryMethod;
};

export const emptyCheckoutForm = (): CheckoutFormData => ({
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  region: "",
  postalCode: "",
  country: DEFAULT_COUNTRY,
  deliveryMethod,
});

export type CheckoutCosts = {
  itemCount: number;
  shippingCents: number;
  shippingFree: boolean;
  subtotalCents: number;
  discountCents: number;
  couponCode?: string;
  totalCents: number;
  currency: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s().-]{7,20}$/;
const POSTAL_CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\s-]{2,9}$/;

export function normalizeCheckoutForm(
  input: Record<string, unknown>,
): CheckoutFormData {
  const text = (value: unknown): string =>
    typeof value === "string" ? value.trim() : "";
  return {
    email: text(input.email),
    firstName: text(input.firstName),
    lastName: text(input.lastName),
    phone: text(input.phone),
    addressLine1: text(input.addressLine1),
    addressLine2: text(input.addressLine2),
    city: text(input.city),
    region: text(input.region),
    postalCode: text(input.postalCode),
    country: text(input.country),
    deliveryMethod:
      typeof input.deliveryMethod === "string" &&
      input.deliveryMethod === deliveryMethod
        ? deliveryMethod
        : deliveryMethod,
  };
}

export function validateCheckoutForm(
  form: CheckoutFormData,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.email) {
    errors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(form.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!form.firstName) {
    errors.firstName = "First name is required.";
  }

  if (!form.lastName) {
    errors.lastName = "Last name is required.";
  }

  if (!form.phone) {
    errors.phone = "Phone number is required.";
  } else if (!PHONE_PATTERN.test(form.phone)) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!form.addressLine1) {
    errors.addressLine1 = "Street address is required.";
  }

  if (!form.city) {
    errors.city = "City is required.";
  }

  if (!form.region) {
    errors.region = "State or region is required.";
  }

  if (!form.postalCode) {
    errors.postalCode = "Postal code is required.";
  } else if (!POSTAL_CODE_PATTERN.test(form.postalCode)) {
    errors.postalCode = "Enter a valid postal code.";
  }

  if (!ALLOWED_COUNTRY_CODES.has(form.country)) {
    errors.country = "Select a country.";
  }

  if (form.deliveryMethod !== deliveryMethod) {
    errors.deliveryMethod = "Select a delivery method.";
  }

  return errors;
}

export function computeCheckoutCosts(
  cart: Pick<CartState, "itemCount" | "subtotalCents" | "currency">,
  coupon?: { couponCode?: string; discountCents?: number },
): CheckoutCosts {
  const itemCount = cart.itemCount;
  const subtotalCents = cart.subtotalCents;
  const shippingFree = itemCount > 0 && subtotalCents > 0
    ? subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS
    : true;
  const shippingCents = shippingFree ? 0 : SHIPPING_FEE_CENTS;
  const discountCents = Math.min(
    Math.max(0, coupon?.discountCents ?? 0),
    subtotalCents,
  );
  return {
    itemCount,
    shippingCents,
    shippingFree,
    subtotalCents,
    discountCents,
    ...(coupon?.couponCode && discountCents > 0
      ? { couponCode: coupon.couponCode }
      : {}),
    totalCents: Math.max(0, subtotalCents - discountCents) + shippingCents,
    currency: cart.currency ?? "INR",
  };
}