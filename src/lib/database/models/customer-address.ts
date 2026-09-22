import type { ObjectId } from "mongodb";

export const CUSTOMER_ADDRESSES_COLLECTION = "customer_addresses";

export interface CustomerAddress {
  _id: ObjectId;
  customerId: ObjectId;
  label: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}