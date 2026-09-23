import { existsSync } from "node:fs";
import { join } from "node:path";
import { getProduct, listProducts } from "@/lib/services/product-service";
import {
  getInventoryByProduct,
  listInventory,
} from "@/lib/services/inventory-service";
import { getModelsForProduct } from "@/lib/services/product-compatibility-service";
import { getBrand } from "@/lib/services/brand-service";
import {
  toAvailability,
  toListingProduct,
  type ListingProduct,
} from "@/lib/storefront/product-listing";
import { NotFoundError } from "@/lib/services/errors";

export type CompatibleModel = {
  id: string;
  name: string;
  slug: string;
  brandId: string;
  brandName: string;
  brandSlug: string;
};

export type ProductDetailResult = {
  product: ListingProduct;
  inStock: boolean;
  lowStock: boolean;
  availableQuantity: number;
  availableImages: string[];
  models: CompatibleModel[];
  related: ListingProduct[];
};

function resolveImage(src: string): string | null {
  if (/^https?:\/\//i.test(src)) {
    return src;
  }
  if (!src.startsWith("/")) {
    return null;
  }
  return existsSync(join(process.cwd(), "public", src)) ? src : null;
}

export async function loadProductDetail(
  productId: string,
): Promise<ProductDetailResult> {
  const product = await getProduct(productId);
  const id = product._id.toHexString();

  let quantity = 0;
  let threshold: number | undefined;
  try {
    const record = await getInventoryByProduct(id);
    quantity = record.quantity;
    threshold = record.lowStockThreshold;
  } catch (error) {
    if (!(error instanceof NotFoundError)) throw error;
  }

  const availability = toAvailability(quantity, threshold);
  const resolvedImages = product.images
    .map(resolveImage)
    .filter((img): img is string => img !== null);

  const allModels = await getModelsForProduct(id);
  const activeModels = allModels.filter((m) => m.status === "active");

  const uniqueBrandIds = [
    ...new Set(activeModels.map((m) => m.brandId.toHexString())),
  ];
  const brands = await Promise.all(
    uniqueBrandIds.map(async (id) => {
      const b = await getBrand(id);
      return {
        id: b._id.toHexString(),
        name: b.name,
        slug: b.slug,
      };
    }),
  );
  const brandById = new Map(brands.map((b) => [b.id, b]));

  const models: CompatibleModel[] = activeModels.map((m) => {
    const bid = m.brandId.toHexString();
    const brand = brandById.get(bid);
    return {
      id: m._id.toHexString(),
      name: m.name,
      slug: m.slug,
      brandId: bid,
      brandName: brand?.name ?? "Unknown",
      brandSlug: brand?.slug ?? "",
    };
  });

  let related: ListingProduct[] = [];
  if (activeModels.length > 0) {
    const primaryModel = activeModels[0];
    const result = await listProducts({
      page: 1,
      pageSize: 5,
      mobileModelId: primaryModel._id,
    });
    const others = result.items.filter(
      (p) => p._id.toHexString() !== id,
    );
    if (others.length > 0) {
      const inv = await listInventory({
        page: 1,
        pageSize: 50,
        productIds: others.map((p) => p._id),
      });
      const invByProduct = new Map(
        inv.items.map((r) => [r.productId.toHexString(), r]),
      );
      related = others.map((p) => {
        const r = invByProduct.get(p._id.toHexString());
        const q = r?.quantity ?? 0;
        return toListingProduct({
          id: p._id.toHexString(),
          slug: p.slug,
          name: p.name,
          description: p.description,
          images: p.images,
          priceCents: p.priceCents,
          ...(p.marketingPriceCents !== undefined
            ? { marketingPriceCents: p.marketingPriceCents }
            : {}),
          currency: p.currency,
          availability: toAvailability(q, r?.lowStockThreshold),
          quantity: q,
        });
      });
    }
  }

  return {
    product: toListingProduct({
      id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      images: product.images,
      priceCents: product.priceCents,
      ...(product.marketingPriceCents !== undefined
        ? { marketingPriceCents: product.marketingPriceCents }
        : {}),
      currency: product.currency,
      availability,
      quantity,
    }),
    inStock: quantity > 0,
    lowStock: availability === "low_stock",
    availableQuantity: quantity,
    availableImages: resolvedImages,
    models,
    related,
  };
}
