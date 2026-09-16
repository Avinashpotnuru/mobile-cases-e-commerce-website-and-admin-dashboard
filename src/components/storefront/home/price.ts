import type { Product } from "@/lib/database/models";

export function formatPrice(
  product: Pick<Product, "priceCents" | "currency">,
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currency,
  }).format(product.priceCents / 100);
}