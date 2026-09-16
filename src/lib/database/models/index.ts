import type { Db } from "mongodb";
import {
  BRAND_COLLECTION,
  type Brand,
  type BrandStatus,
} from "./brand.ts";
import {
  MOBILE_MODEL_COLLECTION,
  type MobileModel,
  type MobileModelStatus,
} from "./mobile-model.ts";
import {
  PRODUCT_COLLECTION,
  type Product,
  type ProductStatus,
} from "./product.ts";
import {
  INVENTORY_COLLECTION,
  type Inventory,
  type InventoryStatus,
} from "./inventory.ts";

export async function ensureDatabaseIndexes(db: Db): Promise<void> {
  await db.collection(BRAND_COLLECTION).createIndexes([
    { key: { slug: 1 }, unique: true },
    { key: { status: 1 } },
  ]);

  await db.collection(MOBILE_MODEL_COLLECTION).createIndexes([
    { key: { brandId: 1, slug: 1 }, unique: true },
    { key: { brandId: 1 } },
    { key: { status: 1 } },
  ]);

  await db.collection(PRODUCT_COLLECTION).createIndexes([
    { key: { slug: 1 }, unique: true },
    { key: { compatibleModelIds: 1, status: 1 } },
    { key: { status: 1, createdAt: -1 } },
  ]);

  await db.collection(INVENTORY_COLLECTION).createIndexes([
    { key: { productId: 1 }, unique: true },
    { key: { status: 1 } },
  ]);
}

export {
  BRAND_COLLECTION,
  MOBILE_MODEL_COLLECTION,
  PRODUCT_COLLECTION,
  INVENTORY_COLLECTION,
};
export type {
  Brand,
  BrandStatus,
  MobileModel,
  MobileModelStatus,
  Product,
  ProductStatus,
  Inventory,
  InventoryStatus,
};