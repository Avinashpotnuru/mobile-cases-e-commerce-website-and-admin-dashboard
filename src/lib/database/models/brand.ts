import type { ObjectId } from "mongodb";

export const BRAND_COLLECTION = "brands";

export type BrandStatus = "active" | "archived";

export interface Brand {
  _id: ObjectId;
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  status: BrandStatus;
  createdAt: Date;
  updatedAt: Date;
}