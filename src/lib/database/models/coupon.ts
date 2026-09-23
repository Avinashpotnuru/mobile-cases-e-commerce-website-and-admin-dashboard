import type { ObjectId } from "mongodb";

export const COUPON_COLLECTION = "coupons";

export type CouponStatus = "active" | "inactive";
export type CouponType = "percent" | "fixed";

export interface Coupon {
  _id: ObjectId;
  // Uppercased, case-insensitively unique.
  code: string;
  type: CouponType;
  // percent: 1–99. fixed: discount in minor units (cents).
  value: number;
  // Minimum cart subtotal (cents) for the coupon to apply.
  minSubtotalCents?: number;
  // Hard cap on the discount amount (cents).
  maxDiscountCents?: number;
  expiresAt?: Date;
  // Total number of times the coupon may be redeemed.
  usageLimit?: number;
  usedCount: number;
  status: CouponStatus;
  createdAt: Date;
  updatedAt: Date;
}