import { ObjectId } from "mongodb";
import { getDb } from "@/lib/database";
import {
  MOBILE_MODEL_COLLECTION,
  PRODUCT_COLLECTION,
  type MobileModel,
  type Product,
} from "@/lib/database/models";
import {
  getProduct,
  listProducts,
} from "@/lib/services/product-service";
import { NotFoundError, ValidationError } from "@/lib/services/errors";
import type { PaginatedResult } from "@/types/pagination";

export async function getProductsForModel(
  modelId: string,
  params: { page: number; pageSize: number },
): Promise<PaginatedResult<Product>> {
  if (!ObjectId.isValid(modelId)) {
    throw new ValidationError({ modelId: "Invalid mobile model id." });
  }
  const objectId = new ObjectId(modelId);
  const db = await getDb();

  const model = await db
    .collection<MobileModel>(MOBILE_MODEL_COLLECTION)
    .findOne({ _id: objectId });
  if (!model) {
    throw new NotFoundError("Mobile model");
  }
  if (model.status !== "active") {
    return { items: [], page: params.page, pageSize: params.pageSize, total: 0, totalPages: 1 };
  }

  return listProducts({ ...params, mobileModelId: objectId });
}

export async function getModelsForProduct(
  slugOrId: string,
): Promise<MobileModel[]> {
  const product = await getProduct(slugOrId);
  if (product.compatibleModelIds.length === 0) {
    return [];
  }

  const db = await getDb();
  const models = await db
    .collection<MobileModel>(MOBILE_MODEL_COLLECTION)
    .find({ _id: { $in: product.compatibleModelIds } })
    .toArray();
  return models;
}

export async function addCompatibility(
  productId: string,
  modelId: string,
): Promise<Product> {
  if (!ObjectId.isValid(productId)) {
    throw new ValidationError({ productId: "Invalid product id." });
  }
  if (!ObjectId.isValid(modelId)) {
    throw new ValidationError({ mobileModelId: "Invalid mobile model id." });
  }
  const productObjectId = new ObjectId(productId);
  const modelObjectId = new ObjectId(modelId);
  const db = await getDb();

  const product = await db
    .collection<Product>(PRODUCT_COLLECTION)
    .findOne({ _id: productObjectId });
  if (!product) {
    throw new NotFoundError("Product");
  }

  const model = await db
    .collection<MobileModel>(MOBILE_MODEL_COLLECTION)
    .findOne({ _id: modelObjectId, status: "active" });
  if (!model) {
    throw new ValidationError({
      mobileModelId: "The mobile model does not exist or is inactive.",
    });
  }

  if (product.compatibleModelIds.some((item) => item.equals(modelObjectId))) {
    throw new ValidationError({
      mobileModelId: "This mobile model is already compatible with the product.",
    });
  }

  await db.collection<Product>(PRODUCT_COLLECTION).updateOne(
    { _id: productObjectId },
    {
      $addToSet: { compatibleModelIds: modelObjectId },
      $set: { updatedAt: new Date() },
    },
  );

  return getProduct(productId, { includeArchived: true });
}

export async function removeCompatibility(
  productId: string,
  modelId: string,
): Promise<Product> {
  if (!ObjectId.isValid(productId)) {
    throw new ValidationError({ productId: "Invalid product id." });
  }
  if (!ObjectId.isValid(modelId)) {
    throw new ValidationError({ mobileModelId: "Invalid mobile model id." });
  }
  const productObjectId = new ObjectId(productId);
  const modelObjectId = new ObjectId(modelId);
  const db = await getDb();

  const product = await db
    .collection<Product>(PRODUCT_COLLECTION)
    .findOne({ _id: productObjectId });
  if (!product) {
    throw new NotFoundError("Product");
  }

  if (!product.compatibleModelIds.some((item) => item.equals(modelObjectId))) {
    throw new ValidationError({
      mobileModelId: "This mobile model is not compatible with the product.",
    });
  }
  if (product.compatibleModelIds.length === 1) {
    throw new ValidationError({
      mobileModelId: "A product must remain compatible with at least one mobile model.",
    });
  }

  const result = await db.collection<Product>(PRODUCT_COLLECTION).updateOne(
    { _id: productObjectId },
    {
      $pull: { compatibleModelIds: modelObjectId },
      $set: { updatedAt: new Date() },
    },
  );
  if (result.matchedCount === 0) {
    throw new NotFoundError("Product");
  }

  return getProduct(productId, { includeArchived: true });
}