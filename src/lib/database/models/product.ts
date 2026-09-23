import type { ObjectId } from "mongodb";

export const PRODUCT_COLLECTION = "products";

export type ProductStatus = "active" | "draft" | "archived";

export interface Product {
  _id: ObjectId;
  name: string;
  slug: string;
  description: string;
  images: string[];
  // Price is stored in minor units (cents) to avoid float precision issues.
  priceCents: number;
  // Optional compare-at price used to show a sale (strike-through) when it is
  // greater than priceCents. Stored in the same minor units.
  marketingPriceCents?: number;
  currency: string;
  compatibleModelIds: ObjectId[];
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}