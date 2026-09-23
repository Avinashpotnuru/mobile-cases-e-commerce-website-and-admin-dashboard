import { existsSync } from "node:fs";
import { join } from "node:path";
import { ObjectId } from "mongodb";
import { getBrand } from "@/lib/services/brand-service";
import { getMobileModel } from "@/lib/services/mobile-model-service";
import { listProducts, type ProductListingSort } from "@/lib/services/product-service";
import { listInventory } from "@/lib/services/inventory-service";
import { getRatingsForProducts } from "@/lib/services/review-service";
import { parsePositiveInteger } from "@/lib/validation";
import type { Brand, MobileModel } from "@/lib/database/models";

export const PRODUCT_PAGE_SIZE = 12;
export const MAX_SEARCH_LENGTH = 60;
export const MAX_PRICE_DOLLARS = 10000;

const SORTS: ProductListingSort[] = [
  "newest",
  "price_asc",
  "price_desc",
  "name_asc",
];
const AVAILABILITY_FILTERS = ["in_stock", "out_of_stock"] as const;

export type ProductAvailability = "in_stock" | "low_stock" | "out_of_stock";
export type AvailabilityFilter = (typeof AVAILABILITY_FILTERS)[number] | "any";

export type ActiveFilters = {
  q?: string;
  availability: AvailabilityFilter;
  minPrice?: number;
  maxPrice?: number;
};

export type ListingProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string | null;
  priceCents: number;
  marketingPriceCents?: number;
  currency: string;
  availability: ProductAvailability;
  quantity: number | null;
  ratingAvg?: number;
  ratingCount?: number;
};

export type ProductListingResult = {
  brandSlug: string;
  brandName: string;
  modelSlug: string | null;
  modelName: string | null;
  products: ListingProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sort: ProductListingSort;
  filters: ActiveFilters;
};

export type ProductListingQuery = Partial<{
  brand: string;
  model: string;
  page: string;
  sort: string;
  availability: string;
  q: string;
  min: string;
  max: string;
}>;

export function resolveProductImage(src: string | undefined): string | null {
  if (!src) {
    return null;
  }
  if (/^https?:\/\//i.test(src)) {
    return src;
  }
  if (!src.startsWith("/")) {
    return null;
  }
  return existsSync(join(process.cwd(), "public", src)) ? src : null;
}

export function toAvailability(
  quantity: number | undefined,
  lowStockThreshold: number | undefined,
): ProductAvailability {
  if (quantity === undefined || quantity <= 0) {
    return "out_of_stock";
  }
  if (lowStockThreshold !== undefined && quantity <= lowStockThreshold) {
    return "low_stock";
  }
  return "in_stock";
}

function parseSearch(raw: string | undefined): string | undefined {
  const value = raw?.trim().slice(0, MAX_SEARCH_LENGTH);
  return value ? value : undefined;
}

function parsePrice(raw: string | undefined): number | null {
  if (raw === undefined || raw === null || raw.trim() === "") {
    return null;
  }
  const value = raw.trim();
  if (!/^\d+$/.test(value)) {
    return null;
  }
  const dollars = Number(value);
  if (!Number.isSafeInteger(dollars) || dollars > MAX_PRICE_DOLLARS) {
    return null;
  }
  return dollars;
}

export function toListingProduct(product: {
  id: string;
  slug: string;
  name: string;
  description: string;
  images: string[];
  priceCents: number;
  marketingPriceCents?: number;
  currency: string;
  availability: ProductAvailability;
  quantity: number | null;
}): ListingProduct {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    image: resolveProductImage(product.images[0]),
    priceCents: product.priceCents,
    ...(product.marketingPriceCents !== undefined
      ? { marketingPriceCents: product.marketingPriceCents }
      : {}),
    currency: product.currency,
    availability: product.availability,
    quantity: product.quantity,
  };
}

async function attachRatings(items: ListingProduct[]): Promise<ListingProduct[]> {
  if (items.length === 0) return items;
  const ratings = await getRatingsForProducts(
    items.map((item) => new ObjectId(item.id)),
  );
  return items.map((item) => {
    const rating = ratings.get(item.id);
    if (!rating || rating.count === 0) return item;
    return {
      ...item,
      ratingAvg: rating.average ?? undefined,
      ratingCount: rating.count,
    };
  });
}

function sortInMemory<T extends { priceCents: number; name: string; createdAt: Date }>(
  items: T[],
  sort: ProductListingSort,
): T[] {
  const sorted = [...items];
  switch (sort) {
    case "newest":
      return sorted.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
    case "price_asc":
      return sorted.sort((a, b) => a.priceCents - b.priceCents);
    case "price_desc":
      return sorted.sort((a, b) => b.priceCents - a.priceCents);
    case "name_asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export async function loadProductListing(
  query: ProductListingQuery,
): Promise<ProductListingResult> {
  const page = parsePositiveInteger(query.page ?? "1") ?? 1;
  const sort = SORTS.includes(query.sort as ProductListingSort)
    ? (query.sort as ProductListingSort)
    : "newest";
  const availability: AvailabilityFilter = AVAILABILITY_FILTERS.includes(
    query.availability as (typeof AVAILABILITY_FILTERS)[number],
  )
    ? (query.availability as AvailabilityFilter)
    : "any";
  const q = parseSearch(query.q);
  const rawMin = parsePrice(query.min);
  const rawMax = parsePrice(query.max);
  const minDollars =
    rawMin !== null && (rawMax === null || rawMin <= rawMax)
      ? rawMin
      : undefined;
  const maxDollars =
    rawMax !== null && (rawMin === null || (rawMin ?? 0) <= rawMax)
      ? rawMax
      : undefined;

  let brand: Brand | undefined;
  let model: MobileModel | undefined;
  let modelId: ObjectId | undefined;
  let modelName: string | null = null;

  if (query.model) {
    let modelOptions: { brandId?: ObjectId } | undefined;
    if (query.brand) {
      brand = await getBrand(query.brand);
      modelOptions = { brandId: brand._id };
    }
    model = await getMobileModel(query.model, modelOptions);
    modelId = model._id;
    modelName = model.name;
    brand = brand ?? (await getBrand(String(model.brandId)));
  } else if (query.brand) {
    brand = await getBrand(query.brand);
  }
  const brandId = brand?._id;

  const listParams = {
    page,
    pageSize: PRODUCT_PAGE_SIZE,
    sort,
    brandId,
    mobileModelId: modelId,
    q,
    minPriceCents: minDollars !== undefined ? minDollars * 100 : undefined,
    maxPriceCents: maxDollars !== undefined ? maxDollars * 100 : undefined,
  };

  const inventory = await listInventory({
    page: 1,
    pageSize: 1000,
    status: "active",
  });

  const inventoryByProduct = new Map<string, number>();
  const inventoryThreshold = new Map<string, number>();
  for (const record of inventory.items) {
    inventoryByProduct.set(record.productId.toHexString(), record.quantity);
    inventoryThreshold.set(record.productId.toHexString(), record.lowStockThreshold);
  }

  const quantityFor = (record: { _id: { toHexString(): string } }) => {
    const id = record._id.toHexString();
    return inventoryByProduct.get(id);
  };
  const thresholdFor = (record: { _id: { toHexString(): string } }) => {
    const id = record._id.toHexString();
    return inventoryThreshold.get(id);
  };

  const filters: ActiveFilters = {
    q,
    availability,
    minPrice: minDollars,
    maxPrice: maxDollars,
  };

  if (availability === "any") {
    const result = await listProducts(listParams);
    const products = await attachRatings(
      result.items.map((product) =>
        toListingProduct({
          ...product,
          id: product._id.toHexString(),
          availability: toAvailability(
            quantityFor(product),
            thresholdFor(product),
          ),
          quantity: quantityFor(product) ?? null,
        }),
      ),
    );
    return {
      brandSlug: brand?.slug ?? "",
      brandName: brand?.name ?? "All cases",
      modelSlug: query.model ?? null,
      modelName,
      products,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      sort,
      filters,
    };
  }

  const all = await listProducts({
    ...listParams,
    page: 1,
    pageSize: 1000,
  });
  const mapped = all.items
    .map((product) => {
      const quantity = quantityFor(product);
      return {
        ...product,
        id: product._id.toHexString(),
        quantity,
      };
    })
    .filter((product) => {
      const state = toAvailability(product.quantity, thresholdFor(product));
      return availability === "in_stock"
        ? state !== "out_of_stock"
        : state === "out_of_stock";
    });

  const filtered = sortInMemory(mapped, sort);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PRODUCT_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const slice = filtered.slice(
    (safePage - 1) * PRODUCT_PAGE_SIZE,
    safePage * PRODUCT_PAGE_SIZE,
  );

  const products = await attachRatings(
    slice.map((product) =>
      toListingProduct({
        ...product,
        availability: toAvailability(
          product.quantity ?? 0,
          thresholdFor(product),
        ),
        quantity: product.quantity ?? null,
      }),
    ),
  );

  return {
    brandSlug: brand?.slug ?? "",
    brandName: brand?.name ?? "All cases",
    modelSlug: query.model ?? null,
    modelName,
    products,
    total,
    page: safePage,
    pageSize: PRODUCT_PAGE_SIZE,
    totalPages,
    sort,
    filters,
  };
}