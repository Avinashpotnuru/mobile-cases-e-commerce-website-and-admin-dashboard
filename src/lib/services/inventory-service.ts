import {
  MongoServerError,
  ObjectId,
  type Collection,
  type Filter,
} from "mongodb";
import { getDb } from "@/lib/database";
import {
  INVENTORY_COLLECTION,
  PRODUCT_COLLECTION,
  type Inventory,
  type InventoryStatus,
  type Product,
} from "@/lib/database/models";
import { NotFoundError, ValidationError } from "@/lib/services/errors";
import { collectFieldErrors } from "@/lib/validation";
import type { PaginatedResult } from "@/types/pagination";

type InventoryFields = Pick<Inventory, "lowStockThreshold" | "status">;

function collection(): Promise<Collection<Inventory>> {
  return getDb().then((db) =>
    db.collection<Inventory>(INVENTORY_COLLECTION),
  );
}

function isInventoryStatus(value: unknown): value is InventoryStatus {
  return value === "active" || value === "archived";
}

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

async function productExists(productId: ObjectId): Promise<boolean> {
  const db = await getDb();
  const count = await db
    .collection<Product>(PRODUCT_COLLECTION)
    .countDocuments({ _id: productId });
  return count > 0;
}

export async function getInventoryByProduct(
  productId: string,
): Promise<Inventory> {
  if (!ObjectId.isValid(productId)) {
    throw new ValidationError({ productId: "Invalid product id." });
  }
  const inventories = await collection();
  const inventory = await inventories.findOne({
    productId: new ObjectId(productId),
    status: "active",
  });
  if (!inventory) {
    throw new NotFoundError("Inventory");
  }
  return inventory;
}

export type ListInventoryParams = {
  page: number;
  pageSize: number;
  status?: InventoryStatus;
  includeArchived?: boolean;
};

export async function listInventory(
  params: ListInventoryParams,
): Promise<PaginatedResult<Inventory>> {
  const { page, pageSize } = params;
  const filter: Filter<Inventory> = { status: "active" as const };
  if (params.includeArchived) {
    delete filter.status;
  } else if (params.status) {
    filter.status = params.status;
  }

  const inventories = await collection();
  const [total, items] = await Promise.all([
    inventories.countDocuments(filter),
    inventories
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray(),
  ]);

  return {
    items,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function createInventory(
  body: Record<string, unknown>,
): Promise<Inventory> {
  const fieldErrors: Array<[string, string | null]> = [];

  const rawProductId =
    typeof body.productId === "string" ? body.productId.trim() : body.productId;
  fieldErrors.push(["productId", rawProductId ? null : "productId is required."]);

  let productId: ObjectId | null = null;
  if (typeof rawProductId === "string" && !isEmpty(rawProductId)) {
    if (ObjectId.isValid(rawProductId)) {
      productId = new ObjectId(rawProductId);
    } else {
      fieldErrors.push(["productId", "productId must be a valid id."]);
    }
  }

  const rawQuantity = body.quantity;
  if (typeof rawQuantity !== "number" || !Number.isInteger(rawQuantity) || rawQuantity < 0) {
    fieldErrors.push([
      "quantity",
      "quantity must be a non-negative integer.",
    ]);
  }

  const rawLowStock = body.lowStockThreshold;
  if (
    typeof rawLowStock !== "number" ||
    !Number.isInteger(rawLowStock) ||
    rawLowStock < 0
  ) {
    fieldErrors.push([
      "lowStockThreshold",
      "lowStockThreshold must be a non-negative integer.",
    ]);
  }

  let status: InventoryStatus = "active";
  if (!isEmpty(body.status)) {
    fieldErrors.push([
      "status",
      isInventoryStatus(body.status)
        ? null
        : `status must be "active" or "archived".`,
    ]);
    if (isInventoryStatus(body.status)) {
      status = body.status;
    }
  }

  const errors = collectFieldErrors(fieldErrors);
  if (errors) {
    throw new ValidationError(errors);
  }

  if (!productId) {
    throw new ValidationError({ productId: "productId is required." });
  }
  if (!(await productExists(productId))) {
    throw new ValidationError({
      productId: "The referenced product does not exist.",
    });
  }

  const inventories = await collection();
  const duplicate = await inventories.findOne({ productId });
  if (duplicate) {
    throw new ValidationError({
      productId: "An inventory record already exists for this product.",
    });
  }

  const now = new Date();
  const doc: Inventory = {
    _id: new ObjectId(),
    productId,
    quantity: Math.floor(rawQuantity as number),
    lowStockThreshold: Math.floor(rawLowStock as number),
    status,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await inventories.insertOne(doc);
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      throw new ValidationError({
        productId: "An inventory record already exists for this product.",
      });
    }
    throw error;
  }
  return doc;
}

export async function updateInventory(
  id: string,
  body: Record<string, unknown>,
): Promise<Inventory> {
  if (!ObjectId.isValid(id)) {
    throw new ValidationError({ id: "Invalid inventory id." });
  }
  const inventoryId = new ObjectId(id);

  const fieldErrors: Array<[string, string | null]> = [];
  const set: Partial<InventoryFields> = {};

  if ("lowStockThreshold" in body) {
    const value = body.lowStockThreshold;
    if (
      typeof value !== "number" ||
      !Number.isInteger(value) ||
      value < 0
    ) {
      fieldErrors.push([
        "lowStockThreshold",
        "lowStockThreshold must be a non-negative integer.",
      ]);
    } else {
      set.lowStockThreshold = Math.floor(value);
    }
  }
  if ("status" in body) {
    fieldErrors.push([
      "status",
      isInventoryStatus(body.status)
        ? null
        : `status must be "active" or "archived".`,
    ]);
    if (isInventoryStatus(body.status)) {
      set.status = body.status;
    }
  }

  const errors = collectFieldErrors(fieldErrors);
  if (errors) {
    throw new ValidationError(errors);
  }

  if (Object.keys(set).length === 0) {
    throw new ValidationError({ body: "No valid fields to update." });
  }

  const inventories = await collection();
  const result = await inventories.findOneAndUpdate(
    { _id: inventoryId },
    { $set: { ...set, updatedAt: new Date() } },
    { returnDocument: "after", includeResultMetadata: false },
  );
  if (!result) {
    throw new NotFoundError("Inventory");
  }
  return result;
}

export async function setStockQuantity(
  id: string,
  quantity: number,
): Promise<Inventory> {
  if (!ObjectId.isValid(id)) {
    throw new ValidationError({ id: "Invalid inventory id." });
  }
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new ValidationError({
      quantity: "quantity must be a non-negative integer.",
    });
  }

  const inventoryId = new ObjectId(id);
  const inventories = await collection();

  const result = await inventories.findOneAndUpdate(
    { _id: inventoryId, status: "active" as const },
    { $set: { quantity, updatedAt: new Date() } },
    { returnDocument: "after", includeResultMetadata: false },
  );
  if (!result) {
    const existing = await inventories.findOne({ _id: inventoryId });
    if (!existing) {
      throw new NotFoundError("Inventory");
    }
    throw new ValidationError({ id: "Inventory is not active." });
  }
  return result;
}

export async function adjustStockQuantity(
  id: string,
  delta: number,
): Promise<Inventory> {
  if (!ObjectId.isValid(id)) {
    throw new ValidationError({ id: "Invalid inventory id." });
  }
  if (!Number.isInteger(delta)) {
    throw new ValidationError({ delta: "delta must be an integer." });
  }

  const inventoryId = new ObjectId(id);
  const inventories = await collection();

  const filter: Filter<Inventory> = { _id: inventoryId, status: "active" as const };
  if (delta < 0) {
    filter.quantity = { $gte: Math.abs(delta) };
  }

  const result = await inventories.findOneAndUpdate(
    filter,
    { $inc: { quantity: delta }, $set: { updatedAt: new Date() } },
    { returnDocument: "after", includeResultMetadata: false },
  );
  if (!result) {
    const existing = await inventories.findOne({ _id: inventoryId });
    if (!existing) {
      throw new NotFoundError("Inventory");
    }
    if (existing.status !== "active") {
      throw new ValidationError({ id: "Inventory is not active." });
    }
    throw new ValidationError({
      delta: "Insufficient stock to complete this adjustment.",
    });
  }
  return result;
}

export async function deactivateInventory(id: string): Promise<Inventory> {
  if (!ObjectId.isValid(id)) {
    throw new ValidationError({ id: "Invalid inventory id." });
  }
  const inventoryId = new ObjectId(id);
  const inventories = await collection();

  const result = await inventories.findOneAndUpdate(
    { _id: inventoryId },
    { $set: { status: "archived", updatedAt: new Date() } },
    { returnDocument: "after", includeResultMetadata: false },
  );
  if (!result) {
    throw new NotFoundError("Inventory");
  }
  return result;
}