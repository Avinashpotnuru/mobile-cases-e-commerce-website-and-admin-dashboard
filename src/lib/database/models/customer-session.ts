import type { ObjectId } from "mongodb";

export const CUSTOMER_SESSIONS_COLLECTION = "customer_sessions";

export interface CustomerSessionRecord {
  _id: ObjectId;
  customerId: ObjectId;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}