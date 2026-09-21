import { ObjectId } from "mongodb";
import { getProduct } from "@/lib/services/product-service";
import { getInventoryByProduct } from "@/lib/services/inventory-service";
import { getModelsForProduct } from "@/lib/services/product-compatibility-service";
import { NotFoundError, ValidationError } from "@/lib/services/errors";
import {
  toAvailability,
  toListingProduct,
} from "@/lib/storefront/product-listing";

export {
  FREE_SHIPPING_THRESHOLD_CENTS,
  SHIPPING_FEE_CENTS,
  CART_COOKIE,
} from "@/lib/storefront/cart-constants";
export const MAX_CART_LINES = 20;
export const MAX_QUANTITY_PER_ITEM = 99;

export type CartLineInput = { productId: string; quantity: number };

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  priceCents: number;
  currency: string;
  quantity: number;
  availableQuantity: number;
  inStock: boolean;
  lowStock: boolean;
  // Server-computed. Always 0 for unavailable items.
  lineTotalCents: number;
  modelNames: string[];
};

export type CartState = {
  items: CartItem[];
  itemCount: number;
  subtotalCents: number;
  currency: string | null;
};

export function parseCartCookie(value: string | undefined): CartLineInput[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    const grouped = new Map<string, number>();
    for (const raw of parsed) {
      if (typeof raw !== "object" || raw === null) continue;
      const entry = raw as { productId?: unknown; quantity?: unknown };
      if (
        typeof entry.productId !== "string" ||
        !ObjectId.isValid(entry.productId)
      ) {
        continue;
      }
      const quantity =
        typeof entry.quantity === "number" && Number.isInteger(entry.quantity)
          ? entry.quantity
          : 1;
      if (quantity < 1) continue;
      const current = grouped.get(entry.productId) ?? 0;
      grouped.set(
        entry.productId,
        Math.min(current + quantity, MAX_QUANTITY_PER_ITEM),
      );
    }

    return [...grouped.entries()]
      .slice(0, MAX_CART_LINES)
      .map(([productId, quantity]) => ({ productId, quantity }));
  } catch {
    return [];
  }
}

export function serializeCartCookie(lines: CartLineInput[]): string {
  return JSON.stringify(lines.slice(0, MAX_CART_LINES));
}

async function availableStock(productId: string): Promise<number> {
  try {
    const inventory = await getInventoryByProduct(productId);
    return inventory.quantity;
  } catch (error) {
    if (error instanceof NotFoundError) return 0;
    throw error;
  }
}

async function requireQuantityInput(input: {
  productId: unknown;
  quantity: unknown;
}): Promise<{ productId: string; quantity: number }> {
  const productId =
    typeof input.productId === "string" ? input.productId : "";
  if (!ObjectId.isValid(productId)) {
    throw new ValidationError({ productId: "Invalid product id." });
  }
  if (
    typeof input.quantity !== "number" ||
    !Number.isInteger(input.quantity) ||
    input.quantity < 1 ||
    input.quantity > MAX_QUANTITY_PER_ITEM
  ) {
    throw new ValidationError({
      quantity: `quantity must be an integer between 1 and ${MAX_QUANTITY_PER_ITEM}.`,
    });
  }
  return { productId, quantity: input.quantity };
}

export async function addCartItem(
  lines: CartLineInput[],
  input: { productId: unknown; quantity: unknown },
): Promise<CartLineInput[]> {
  const { productId, quantity } = await requireQuantityInput(input);
  const product = await getProduct(productId);
  const id = product._id.toHexString();
  const stock = await availableStock(id);
  if (stock <= 0) {
    throw new ValidationError({
      productId: "This product is currently out of stock.",
    });
  }

  const rest = lines.filter((line) => line.productId !== id);
  if (rest.length >= MAX_CART_LINES) {
    throw new ValidationError({
      cart: `Your cart can hold a maximum of ${MAX_CART_LINES} items.`,
    });
  }

  const existing = lines.find((line) => line.productId === id)?.quantity ?? 0;
  const merged = Math.min(existing + quantity, stock, MAX_QUANTITY_PER_ITEM);
  return [...rest, { productId: id, quantity: merged }];
}

export async function updateCartItemQuantity(
  lines: CartLineInput[],
  input: { productId: unknown; quantity: unknown },
): Promise<CartLineInput[]> {
  const productId =
    typeof input.productId === "string" ? input.productId : "";
  if (!ObjectId.isValid(productId)) {
    throw new ValidationError({ productId: "Invalid product id." });
  }
  const quantity = input.quantity;
  if (
    typeof quantity !== "number" ||
    !Number.isInteger(quantity) ||
    quantity < 0 ||
    quantity > MAX_QUANTITY_PER_ITEM
  ) {
    throw new ValidationError({
      quantity: `quantity must be an integer between 0 and ${MAX_QUANTITY_PER_ITEM}.`,
    });
  }

  await getProduct(productId);
  const rest = lines.filter((line) => line.productId !== productId);
  if (quantity === 0) {
    return rest;
  }

  const stock = await availableStock(productId);
  if (stock <= 0) return lines;

  const clamped = Math.min(quantity, stock);
  return [...rest, { productId, quantity: clamped }];
}

export function removeCartItem(
  lines: CartLineInput[],
  productId: string,
): CartLineInput[] {
  return lines.filter((line) => line.productId !== productId);
}

export async function loadCartState(
  lines?: CartLineInput[],
): Promise<CartState> {
  const grouped = new Map<string, number>();
  for (const line of lines ?? []) {
    if (!ObjectId.isValid(line.productId)) continue;
    const current = grouped.get(line.productId) ?? 0;
    grouped.set(
      line.productId,
      Math.min(current + line.quantity, MAX_QUANTITY_PER_ITEM),
    );
  }

  const items: CartItem[] = [];
  for (const [productId, requested] of grouped) {
    try {
      const product = await getProduct(productId);
      const id = product._id.toHexString();

      let available = 0;
      let threshold: number | undefined;
      try {
        const record = await getInventoryByProduct(id);
        available = record.quantity;
        threshold = record.lowStockThreshold;
      } catch (error) {
        if (!(error instanceof NotFoundError)) throw error;
      }

      const availability = toAvailability(available, threshold);
      const inStock = available > 0;
      const listing = toListingProduct({
        id,
        slug: product.slug,
        name: product.name,
        description: product.description,
        images: product.images,
        priceCents: product.priceCents,
        currency: product.currency,
        availability,
        quantity: available,
      });

      const models = await getModelsForProduct(id);
      const modelNames = models
        .filter((model) => model.status === "active")
        .map((model) => model.name);

      items.push({
        productId: id,
        slug: listing.slug,
        name: listing.name,
        image: listing.image,
        priceCents: listing.priceCents,
        currency: listing.currency,
        quantity: inStock ? Math.min(requested, available) : requested,
        availableQuantity: available,
        inStock,
        lowStock: inStock && availability === "low_stock",
        lineTotalCents: inStock ? listing.priceCents * Math.min(requested, available) : 0,
        modelNames,
      });
    } catch (error) {
      if (error instanceof NotFoundError) continue;
      throw error;
    }
  }

  const availableItems = items.filter((item) => item.inStock);
  return {
    items,
    itemCount: availableItems.reduce((sum, item) => sum + item.quantity, 0),
    subtotalCents: availableItems.reduce(
      (sum, item) => sum + item.lineTotalCents,
      0,
    ),
    currency: items.find((item) => item.currency)?.currency ?? null,
  };
}