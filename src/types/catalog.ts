export type CatalogStatus = "active" | "archived";

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