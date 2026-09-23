import type { ObjectId } from "mongodb";

export const ORDER_COLLECTION = "orders";

export type OrderStatus = "pending" | "confirmed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "failed" | "refunded";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "cancelled",
];
export const PAYMENT_STATUSES: PaymentStatus[] = [
  "unpaid",
  "paid",
  "failed",
  "refunded",
];

export interface OrderItemSnapshot {
  productId: ObjectId;
  productSlug: string;
  productName: string;
  modelNames: string[];
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface OrderCustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface OrderShippingAddress {
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

export interface OrderDeliverySnapshot {
  method: string;
  label: string;
  estimate: string;
}

export interface Order {
  _id: ObjectId;
  orderNumber: string;
  idempotencyKey: string;
  // Random bearer token returned to the customer at order creation. It proves
  // ownership of the order on the confirmation page without an account
  // system, since only the person who created the order ever sees it.
  accessCode: string;
  // Set when the customer was signed in at checkout, linking the order to
  // their account for order history.
  customerId?: ObjectId;
  customer: OrderCustomerInfo;
  shippingAddress: OrderShippingAddress;
  delivery: OrderDeliverySnapshot;
  items: OrderItemSnapshot[];
  currency: string;
  subtotalCents: number;
  shippingCents: number;
  // Populated when a coupon was applied at checkout.
  couponCode?: string;
  discountCents?: number;
  totalCents: number;
  // Price/name snapshots are stored on each item so later product changes
  // never alter historical orders.
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}