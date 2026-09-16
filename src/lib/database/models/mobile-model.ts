import type { ObjectId } from "mongodb";

export const MOBILE_MODEL_COLLECTION = "mobile_models";

export type MobileModelStatus = "active" | "archived";

export interface MobileModel {
  _id: ObjectId;
  brandId: ObjectId;
  name: string;
  slug: string;
  imageUrl: string;
  status: MobileModelStatus;
  createdAt: Date;
  updatedAt: Date;
}