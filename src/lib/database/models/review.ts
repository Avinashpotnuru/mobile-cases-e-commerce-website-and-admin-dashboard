import type { ObjectId } from "mongodb";

export const REVIEW_COLLECTION = "reviews";

export const REVIEW_STATUSES = ["approved", "pending", "rejected"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export interface Review {
  _id: ObjectId;
  productId: ObjectId;
  customerId: ObjectId;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  status: ReviewStatus;
  createdAt: Date;
}