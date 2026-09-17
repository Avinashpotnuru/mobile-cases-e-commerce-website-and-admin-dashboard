import {
  MongoServerError,
  ObjectId,
  type Collection,
  type Filter,
} from "mongodb";
import { getDb } from "@/lib/database";
import {
  MOBILE_MODEL_COLLECTION,
  PRODUCT_COLLECTION,
  type MobileModel,
  type Product,
  type ProductStatus,
} from "@/lib/database/models";
import { NotFoundError, ValidationError } from "@/lib/services/errors";
import {
  collectFieldErrors,
  optionalString,
  requiredString,
  validSlug,
} from "@/lib/validation";
import type { PaginatedResult } from "@/types/pagination";

const DEFAULT_CURRENCY = "USD";
const MAX_IMAGES = 10;
const MAX_IMAGE_URL_LENGTH = 500;
const MAX_MODEL_IDS = 100;

type ProductFields = Pick<
  Product,
  | "name"
  | "slug"
  | "description"
  | "images"
  | "compatibleModelIds"
  | "priceCents"
  | "status"
>;

function collection(): Promise<Collection<Product>> {
  return getDb().then((db) => db.collection<Product>(PRODUCT_COLLECTION));
}

function isProductStatus(value: unknown): value is ProductStatus {
  return value === "active" || value === "draft" || value === "archived";
}

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function validateImages(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_IMAGES) {
    return `images must contain between 1 and ${MAX_IMAGES} image URLs.`;
  }
  for (const item of value) {
    if (
      typeof item !== "string" ||
      item.trim().length === 0 ||
      item.trim().length > MAX_IMAGE_URL_LENGTH
    ) {
      return `Every image must be a URL of ${MAX_IMAGE_URL_LENGTH} characters or fewer.`;
    }
  }
  return null;
}

function parsePriceCents(value: unknown): number | null {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 0 ||
    !Number.isSafeInteger(value)
  ) {
    return null;
  }
  return value;
}

function parseModelIds(value: unknown): {
  ids: ObjectId[] | null;
  error: string | null;
} {
  if (value === undefined || value === null) {
    return { ids: null, error: "compatibleModelIds is required." };
  }
  if (!Array.isArray(value) || value.length === 0) {
    return {
      ids: null,
      error: "compatibleModelIds must contain at least one model.",
    };
  }
  if (value.length > MAX_MODEL_IDS) {
    return {
      ids: null,
      error: `compatibleModelIds must contain ${MAX_MODEL_IDS} models or fewer.`,
    };
  }
  const ids: ObjectId[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !ObjectId.isValid(item)) {
      return { ids: null, error: "Every model id must be a valid id." };
    }
    ids.push(new ObjectId(item));
  }
  return { ids, error: null };
}

async function allModelsExist(ids: ObjectId[]): Promise<boolean> {
  const db = await getDb();
  const count = await db
    .collection<MobileModel>(MOBILE_MODEL_COLLECTION)
    .countDocuments({ _id: { $in: ids } });
  return count === ids.length;
}

async function brandModelIds(brandId: ObjectId): Promise<ObjectId[]> {
  const db = await getDb();
  const models = await db
    .collection<MobileModel>(MOBILE_MODEL_COLLECTION)
    .find({ brandId })
    .project({ _id: 1 })
    .toArray();
  return models.map((model) => model._id);
}

export type ProductListingSort =
  | "name_asc"
  | "newest"
  | "price_asc"
  | "price_desc";

export type ListProductsParams = {
  page: number;
  pageSize: number;
  brandId?: ObjectId;
  mobileModelId?: ObjectId;
  status?: ProductStatus;
  q?: string;
  includeArchived?: boolean;
  sort?: ProductListingSort;
  minPriceCents?: number;
  maxPriceCents?: number;
};

export async function listProducts(
  params: ListProductsParams,
): Promise<PaginatedResult<Product>> {
  const { page, pageSize } = params;

  const filter: Filter<Product> = {};
  if (params.status) {
    filter.status = params.status;
  } else if (!params.includeArchived) {
    filter.status = "active" as const;
  }
  if (params.q) {
    filter.name = { $regex: escapeRegex(params.q), $options: "i" };
  }

  if (
    params.minPriceCents !== undefined ||
    params.maxPriceCents !== undefined
  ) {
    const range: { $gte?: number; $lte?: number } = {};
    if (params.minPriceCents !== undefined) {
      range.$gte = params.minPriceCents;
    }
    if (params.maxPriceCents !== undefined) {
      range.$lte = params.maxPriceCents;
    }
    filter.priceCents = range;
  }

  if (params.brandId) {
    const modelIds = await brandModelIds(params.brandId);
    if (modelIds.length === 0) {
      return {
        items: [],
        page,
        pageSize,
        total: 0,
        totalPages: 1,
      };
    }
    const compatibility = params.mobileModelId
      ? { $all: [params.mobileModelId], $in: modelIds }
      : { $in: modelIds };
    filter.compatibleModelIds = compatibility;
  } else if (params.mobileModelId) {
    filter.compatibleModelIds = params.mobileModelId;
  }

  const products = await collection();

  const sortMap: Record<ProductListingSort, Record<string, 1 | -1>> = {
    name_asc: { name: 1 },
    newest: { createdAt: -1 },
    price_asc: { priceCents: 1 },
    price_desc: { priceCents: -1 },
  };

  const [total, items] = await Promise.all([
    products.countDocuments(filter),
    products
      .find(filter)
      .sort(sortMap[params.sort ?? "name_asc"])
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

export type GetProductOptions = {
  includeArchived?: boolean;
};

export async function getProduct(
  slugOrId: string,
  options: GetProductOptions = {},
): Promise<Product> {
  const products = await collection();

  const query: Filter<Product> = { status: "active" as const };
  if (ObjectId.isValid(slugOrId)) {
    query._id = new ObjectId(slugOrId);
  } else {
    query.slug = slugOrId;
  }
  if (options.includeArchived) {
    delete query.status;
  }

  const product = await products.findOne(query);
  if (!product) {
    throw new NotFoundError("Product");
  }
  return product;
}

export async function createProduct(
  body: Record<string, unknown>,
): Promise<Product> {
  const fieldErrors: Array<[string, string | null]> = [];

  const name = typeof body.name === "string" ? body.name.trim() : body.name;
  fieldErrors.push(["name", requiredString(name, "name")]);

  let slug: string | undefined;
  const rawSlug = typeof body.slug === "string" ? body.slug.trim() : body.slug;
  const slugError = isEmpty(body.slug) ? null : validSlug(rawSlug, "slug");
  fieldErrors.push(["slug", slugError]);
  if (slugError === null && !isEmpty(body.slug) && typeof rawSlug === "string") {
    slug = rawSlug;
  } else if (typeof name === "string") {
    slug = slugifyName(name);
  }

  fieldErrors.push([
    "description",
    optionalString(body.description, "description", { maxLength: 4000 }),
  ]);
  fieldErrors.push(["images", validateImages(body.images)]);

  fieldErrors.push([
    "priceCents",
    isEmpty(body.priceCents)
      ? null
      : parsePriceCents(body.priceCents) === null
        ? `priceCents must be a non-negative integer.`
        : null,
  ]);

  const modelIdsResult = parseModelIds(body.compatibleModelIds);
  fieldErrors.push(["compatibleModelIds", modelIdsResult.error]);

  let status: ProductStatus = "active";
  if (!isEmpty(body.status)) {
    fieldErrors.push([
      "status",
      isProductStatus(body.status)
        ? null
        : `status must be "active", "draft", or "archived".`,
    ]);
    if (isProductStatus(body.status)) {
      status = body.status;
    }
  }

  const errors = collectFieldErrors(fieldErrors);
  if (errors) {
    throw new ValidationError(errors);
  }

  const compatibleModelIds = modelIdsResult.ids;
  if (!compatibleModelIds) {
    throw new ValidationError({
      compatibleModelIds: "compatibleModelIds is required.",
    });
  }
  if (!(await allModelsExist(compatibleModelIds))) {
    throw new ValidationError({
      compatibleModelIds: "One or more referenced mobile models do not exist.",
    });
  }

  const finalSlug = slug ?? "";
  const finalName = typeof name === "string" ? name : "";
  const products = await collection();

  const duplicate = await products.findOne({ slug: finalSlug });
  if (duplicate) {
    throw new ValidationError({
      slug: "A product with this slug already exists.",
    });
  }

  const now = new Date();
  const doc: Product = {
    _id: new ObjectId(),
    name: finalName,
    slug: finalSlug,
    description:
      typeof body.description === "string" ? body.description.trim() : "",
    images: Array.isArray(body.images)
      ? body.images.map((url) => String(url).trim())
      : [],
    priceCents: parsePriceCents(body.priceCents) ?? 0,
    currency: DEFAULT_CURRENCY,
    compatibleModelIds,
    status,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await products.insertOne(doc);
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      throw new ValidationError({
        slug: "A product with this slug already exists.",
      });
    }
    throw error;
  }
  return doc;
}

export async function updateProduct(
  id: string,
  body: Record<string, unknown>,
): Promise<Product> {
  if (!ObjectId.isValid(id)) {
    throw new ValidationError({ id: "Invalid product id." });
  }
  const productId = new ObjectId(id);

  const fieldErrors: Array<[string, string | null]> = [];
  const set: Partial<ProductFields> = {};

  if ("name" in body) {
    const value =
      typeof body.name === "string" ? body.name.trim() : undefined;
    const message = requiredString(value, "name");
    fieldErrors.push(["name", message]);
    if (message === null && typeof value === "string") {
      set.name = value;
    }
  }
  if ("slug" in body) {
    const value =
      typeof body.slug === "string" ? body.slug.trim() : undefined;
    const message = validSlug(value, "slug");
    fieldErrors.push(["slug", message]);
    if (message === null && typeof value === "string") {
      set.slug = value;
    }
  }
  if ("description" in body) {
    const value =
      typeof body.description === "string" ? body.description.trim() : undefined;
    const message = optionalString(value, "description", {
      maxLength: 4000,
    });
    fieldErrors.push(["description", message]);
    if (message === null && typeof value === "string") {
      set.description = value;
    }
  }
  if ("images" in body) {
    const message = validateImages(body.images);
    fieldErrors.push(["images", message]);
    if (message === null && Array.isArray(body.images)) {
      set.images = body.images.map((url) => String(url).trim());
    }
  }
  if ("priceCents" in body) {
    const cents = parsePriceCents(body.priceCents);
    if (cents === null) {
      fieldErrors.push([
        "priceCents",
        "priceCents must be a non-negative integer.",
      ]);
    } else {
      set.priceCents = cents;
    }
  }
  if ("compatibleModelIds" in body) {
    const modelIdsResult = parseModelIds(body.compatibleModelIds);
    if (modelIdsResult.ids) {
      if (await allModelsExist(modelIdsResult.ids)) {
        set.compatibleModelIds = modelIdsResult.ids;
      } else {
        fieldErrors.push([
          "compatibleModelIds",
          "One or more referenced mobile models do not exist.",
        ]);
      }
    } else {
      fieldErrors.push(["compatibleModelIds", modelIdsResult.error]);
    }
  }
  if ("status" in body) {
    fieldErrors.push([
      "status",
      isProductStatus(body.status)
        ? null
        : `status must be "active", "draft", or "archived".`,
    ]);
    if (isProductStatus(body.status)) {
      set.status = body.status;
    }
  }

  const errors = collectFieldErrors(fieldErrors);
  if (errors) {
    throw new ValidationError(errors);
  }

  const products = await collection();

  if (set.slug) {
    const exists = await products.countDocuments({
      slug: set.slug,
      _id: { $ne: productId },
    });
    if (exists > 0) {
      throw new ValidationError({
        slug: "A product with this slug already exists.",
      });
    }
  }

  const updated = await products.findOneAndUpdate(
    { _id: productId },
    { $set: { ...set, updatedAt: new Date() } },
    { returnDocument: "after", includeResultMetadata: false },
  );
  if (!updated) {
    throw new NotFoundError("Product");
  }
  return updated;
}

export async function deactivateProduct(id: string): Promise<Product> {
  if (!ObjectId.isValid(id)) {
    throw new ValidationError({ id: "Invalid product id." });
  }
  const productId = new ObjectId(id);
  const products = await collection();

  const updated = await products.findOneAndUpdate(
    { _id: productId },
    { $set: { status: "archived", updatedAt: new Date() } },
    { returnDocument: "after", includeResultMetadata: false },
  );
  if (!updated) {
    throw new NotFoundError("Product");
  }
  return updated;
}