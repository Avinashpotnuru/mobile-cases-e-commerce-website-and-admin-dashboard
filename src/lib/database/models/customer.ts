import type { ObjectId } from "mongodb";

export const CUSTOMER_COLLECTION = "customers";

export interface Customer {
  _id: ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}