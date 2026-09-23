export type CatalogStatus = "active" | "archived";
export type ProductStatus = "active" | "draft" | "archived";

export interface BrandRow {
  _id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  status: CatalogStatus;
  updatedAt: string;
}

export interface MobileModelRow {
  _id: string;
  brandId: string;
  name: string;
  slug: string;
  imageUrl: string;
  status: CatalogStatus;
  updatedAt: string;
}

export interface ProductRow {
  _id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  priceCents: number;
  marketingPriceCents?: number;
  currency: string;
  compatibleModelIds: string[];
  status: ProductStatus;
  updatedAt: string;
}

export interface StockRow {
  _id: string;
  productId: string;
  quantity: number;
  lowStockThreshold: number;
  status: CatalogStatus;
  updatedAt: string;
}

export interface InventoryAdminRow {
  _id: string;
  productId: string;
  productName: string;
  productSlug: string;
  modelNames: string[];
  quantity: number;
  lowStockThreshold: number;
  status: CatalogStatus;
  updatedAt: string;
}

export interface ProductFormValues {
  name: string;
  slug: string;
  description: string;
  images: string[];
  priceCents: number;
  marketingPriceCents?: number;
  status: ProductStatus;
  compatibleModelIds: string[];
}

export type CouponStatus = "active" | "inactive";
export type CouponType = "percent" | "fixed";

export interface CouponRow {
  _id: string;
  code: string;
  type: CouponType;
  value: number;
  minSubtotalCents?: number;
  maxDiscountCents?: number;
  expiresAt?: string;
  usageLimit?: number;
  usedCount: number;
  status: CouponStatus;
  updatedAt: string;
}