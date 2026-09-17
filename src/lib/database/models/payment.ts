import type { ObjectId } from "mongodb";

export const PAYMENT_COLLECTION = "payment_requests";

export type PaymentRecordStatus =
  | "pending"
  | "succeeded"
  | "failed"
  | "cancelled";

export interface PaymentRecord {
  _id: ObjectId;
  orderId: ObjectId;
  provider: string;
  providerPaymentId: string;
  amountCents: number;
  currency: string;
  status: PaymentRecordStatus;
  createdAt: Date;
  updatedAt: Date;
}