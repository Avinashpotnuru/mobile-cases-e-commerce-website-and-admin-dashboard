import type { Document } from "mongodb";
import { getDb } from "@/lib/database";
import {
  BRAND_COLLECTION,
  INVENTORY_COLLECTION,
  MOBILE_MODEL_COLLECTION,
  ORDER_COLLECTION,
  PRODUCT_COLLECTION,
  type Order,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/database/models";

export const RECENT_ORDERS_LIMIT = 6;

export interface DashboardCatalogSummary {
  brands: number;
  models: number;
  products: number;
  activeProducts: number;
  draftProducts: number;
}

export interface DashboardInventorySummary {
  items: number;
  unitsInStock: number;
  lowStock: number;
  outOfStock: number;
}

export interface RecentOrder {
  _id: Order["_id"];
  orderNumber: string;
  customer: Order["customer"];
  items: { quantity: number }[];
  totalCents: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
}

export interface DashboardOrderSummary {
  total: number;
  paid: number;
  pendingPayment: number;
  revenueCents: number;
  recent: RecentOrder[];
}

export interface DashboardStats {
  catalog: DashboardCatalogSummary;
  inventory: DashboardInventorySummary;
  orders: DashboardOrderSummary;
}

async function getCatalogSummary(): Promise<DashboardCatalogSummary> {
  const db = await getDb();
  const [brands, models, productGroups] = await Promise.all([
    db.collection(BRAND_COLLECTION).countDocuments(),
    db.collection(MOBILE_MODEL_COLLECTION).countDocuments(),
    db
      .collection(PRODUCT_COLLECTION)
      .aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ])
      .toArray(),
  ]);
  const byStatus = Object.fromEntries(
    productGroups.map((group) => [group._id, group.count]),
  );
  return {
    brands,
    models,
    products:
      (byStatus["active"] ?? 0) +
      (byStatus["draft"] ?? 0) +
      (byStatus["archived"] ?? 0),
    activeProducts: byStatus["active"] ?? 0,
    draftProducts: byStatus["draft"] ?? 0,
  };
}

async function getInventorySummary(): Promise<DashboardInventorySummary> {
  const db = await getDb();
  const pipeline: Document[] = [
    { $match: { status: "active" } },
    {
      $addFields: {
        isLowStock: { $lt: ["$quantity", "$lowStockThreshold"] },
        isOutOfStock: { $lte: ["$quantity", 0] },
      },
    },
    {
      $group: {
        _id: null,
        items: { $sum: 1 },
        unitsInStock: { $sum: "$quantity" },
        lowStock: { $sum: { $cond: ["$isLowStock", 1, 0] } },
        outOfStock: { $sum: { $cond: ["$isOutOfStock", 1, 0] } },
      },
    },
  ];
  const [row] = await db
    .collection(INVENTORY_COLLECTION)
    .aggregate<{
      items: number;
      unitsInStock: number;
      lowStock: number;
      outOfStock: number;
    }>(pipeline)
    .toArray();
  return row ?? { items: 0, unitsInStock: 0, lowStock: 0, outOfStock: 0 };
}

async function getOrderSummary(): Promise<DashboardOrderSummary> {
  const db = await getDb();
  const [orders, recent] = await Promise.all([
    db
      .collection(ORDER_COLLECTION)
      .aggregate<{
        total: number;
        paid: number;
        pendingPayment: number;
        revenueCents: number;
      }>([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            paid: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] } },
            pendingPayment: {
              $sum: {
                $cond: [{ $in: ["$paymentStatus", ["unpaid", "failed"]] }, 1, 0],
              },
            },
            revenueCents: {
              $sum: {
                $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalCents", 0],
              },
            },
          },
        },
      ])
      .toArray(),
    db
      .collection<Order>(ORDER_COLLECTION)
      .find(
        {},
        {
          projection: {
            orderNumber: 1,
            customer: 1,
            items: 1,
            totalCents: 1,
            currency: 1,
            status: 1,
            paymentStatus: 1,
            createdAt: 1,
          },
        },
      )
      .sort({ createdAt: -1 })
      .limit(RECENT_ORDERS_LIMIT)
      .toArray(),
  ]);
  const summary = orders[0] ?? {
    total: 0,
    paid: 0,
    pendingPayment: 0,
    revenueCents: 0,
  };
  return { ...summary, recent };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [catalog, inventory, orders] = await Promise.all([
    getCatalogSummary(),
    getInventorySummary(),
    getOrderSummary(),
  ]);
  return { catalog, inventory, orders };
}