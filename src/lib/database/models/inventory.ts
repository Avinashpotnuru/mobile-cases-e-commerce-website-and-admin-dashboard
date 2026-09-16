import type { ObjectId } from "mongodb";

export const INVENTORY_COLLECTION = "inventory";

export type InventoryStatus = "active" | "archived";

export interface Inventory {
  _id: ObjectId;
  productId: ObjectId;
  quantity: number;
  lowStockThreshold: number;
  status: InventoryStatus;
  createdAt: Date;
  updatedAt: Date;
}