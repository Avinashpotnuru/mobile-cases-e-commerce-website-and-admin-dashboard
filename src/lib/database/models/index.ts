import type { Db } from "mongodb";
import {
  BRAND_COLLECTION,
  type Brand,
  type BrandStatus,
} from "./brand.ts";
import {
  MOBILE_MODEL_COLLECTION,
  type MobileModel,
  type MobileModelStatus,
} from "./mobile-model.ts";
import {
  PRODUCT_COLLECTION,
  type Product,
  type ProductStatus,
} from "./product.ts";
import {
  INVENTORY_COLLECTION,
  type Inventory,
  type InventoryStatus,
} from "./inventory.ts";
import {
  ORDER_COLLECTION,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  type Order,
  type OrderStatus,
  type PaymentStatus,
  type OrderItemSnapshot,
  type OrderCustomerInfo,
  type OrderShippingAddress,
  type OrderDeliverySnapshot,
} from "./order.ts";
import {
  PAYMENT_COLLECTION,
  type PaymentRecord,
  type PaymentRecordStatus,
} from "./payment.ts";
import {
  ADMIN_SESSIONS_COLLECTION,
  type AdminSessionRecord,
} from "./admin-session.ts";
import {
  CUSTOMER_COLLECTION,
  type Customer,
} from "./customer.ts";
import {
  CUSTOMER_SESSIONS_COLLECTION,
  type CustomerSessionRecord,
} from "./customer-session.ts";
import {
  CUSTOMER_ADDRESSES_COLLECTION,
  type CustomerAddress,
} from "./customer-address.ts";
import {
  REVIEW_COLLECTION,
  REVIEW_STATUSES,
  type Review,
  type ReviewStatus,
} from "./review.ts";

export async function ensureDatabaseIndexes(db: Db): Promise<void> {
  await db.collection(BRAND_COLLECTION).createIndexes([
    { key: { slug: 1 }, unique: true },
    { key: { status: 1 } },
  ]);

  await db.collection(MOBILE_MODEL_COLLECTION).createIndexes([
    { key: { brandId: 1, slug: 1 }, unique: true },
    { key: { brandId: 1 } },
    { key: { status: 1 } },
  ]);

  await db.collection(PRODUCT_COLLECTION).createIndexes([
    { key: { slug: 1 }, unique: true },
    { key: { compatibleModelIds: 1, status: 1 } },
    { key: { status: 1, createdAt: -1 } },
  ]);

  await db.collection(INVENTORY_COLLECTION).createIndexes([
    { key: { productId: 1 }, unique: true },
    { key: { status: 1, createdAt: -1 } },
  ]);

  await db.collection(ORDER_COLLECTION).createIndexes([
    { key: { idempotencyKey: 1 }, unique: true },
    { key: { status: 1, createdAt: -1 } },
    { key: { createdAt: -1 } },
  ]);

  await db.collection(PAYMENT_COLLECTION).createIndexes([
    { key: { providerPaymentId: 1 }, unique: true },
    { key: { orderId: 1 } },
  ]);

  await db.collection(ADMIN_SESSIONS_COLLECTION).createIndexes([
    { key: { tokenHash: 1 }, unique: true },
    { key: { expiresAt: 1 } },
  ]);

  await db.collection(CUSTOMER_COLLECTION).createIndexes([
    { key: { email: 1 }, unique: true },
    { key: { createdAt: -1 } },
  ]);

  await db.collection(CUSTOMER_SESSIONS_COLLECTION).createIndexes([
    { key: { tokenHash: 1 }, unique: true },
    { key: { expiresAt: 1 } },
  ]);

  await db.collection(CUSTOMER_ADDRESSES_COLLECTION).createIndexes([
    { key: { customerId: 1, createdAt: -1 } },
    { key: { customerId: 1, isDefault: 1 } },
  ]);

  await db.collection(REVIEW_COLLECTION).createIndexes([
    { key: { productId: 1, createdAt: -1 } },
    { key: { productId: 1, status: 1 } },
    { key: { productId: 1, customerId: 1 }, unique: true },
  ]);
}

export {
  BRAND_COLLECTION,
  MOBILE_MODEL_COLLECTION,
  PRODUCT_COLLECTION,
  INVENTORY_COLLECTION,
  ORDER_COLLECTION,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_COLLECTION,
  ADMIN_SESSIONS_COLLECTION,
  CUSTOMER_COLLECTION,
  CUSTOMER_SESSIONS_COLLECTION,
  CUSTOMER_ADDRESSES_COLLECTION,
  REVIEW_COLLECTION,
  REVIEW_STATUSES,
};
export type {
  Brand,
  BrandStatus,
  MobileModel,
  MobileModelStatus,
  Product,
  ProductStatus,
  Inventory,
  InventoryStatus,
  Order,
  OrderStatus,
  PaymentStatus,
  OrderItemSnapshot,
  OrderCustomerInfo,
  OrderShippingAddress,
  OrderDeliverySnapshot,
  PaymentRecord,
  PaymentRecordStatus,
  AdminSessionRecord,
  Customer,
  CustomerSessionRecord,
  CustomerAddress,
  Review,
  ReviewStatus,
};