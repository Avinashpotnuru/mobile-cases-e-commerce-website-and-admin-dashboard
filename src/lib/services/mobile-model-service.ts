import {
  MongoServerError,
  ObjectId,
  type Collection,
  type Filter,
} from "mongodb";
import { getDb } from "@/lib/database";
import {
  BRAND_COLLECTION,
  MOBILE_MODEL_COLLECTION,
  type MobileModel,
  type MobileModelStatus,
} from "@/lib/database/models";
import { NotFoundError, ValidationError } from "@/lib/services/errors";
import {
  collectFieldErrors,
  optionalString,
  requiredString,
  validSlug,
} from "@/lib/validation";
import type { PaginatedResult } from "@/types/pagination";

type MobileModelFields = Pick<
  MobileModel,
  "brandId" | "name" | "slug" | "imageUrl" | "status"
>;

function collection(): Promise<Collection<MobileModel>> {
  return getDb().then((db) =>
    db.collection<MobileModel>(MOBILE_MODEL_COLLECTION),
  );
}

function isMobileModelStatus(value: unknown): value is MobileModelStatus {
  return value === "active" || value === "archived";
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

async function brandExists(brandId: ObjectId): Promise<boolean> {
  const db = await getDb();
  const count = await db
    .collection(BRAND_COLLECTION)
    .countDocuments({ _id: brandId });
  return count > 0;
}

export type ListMobileModelsParams = {
  page: number;
  pageSize: number;
  brandId?: ObjectId;
  includeArchived?: boolean;
};

export async function listMobileModels(
  params: ListMobileModelsParams,
): Promise<PaginatedResult<MobileModel>> {
  const { page, pageSize } = params;
  const filter: Filter<MobileModel> = params.includeArchived
    ? {}
    : { status: "active" as const };
  if (params.brandId) {
    filter.brandId = params.brandId;
  }
  const models = await collection();

  const [total, items] = await Promise.all([
    models.countDocuments(filter),
    models
      .find(filter)
      .sort({ name: 1 })
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

export type GetMobileModelOptions = {
  brandId?: ObjectId;
  includeArchived?: boolean;
};

export async function getMobileModel(
  slugOrId: string,
  options: GetMobileModelOptions = {},
): Promise<MobileModel> {
  const models = await collection();

  const query: Filter<MobileModel> = { status: "active" as const };
  if (ObjectId.isValid(slugOrId)) {
    query._id = new ObjectId(slugOrId);
  } else {
    query.slug = slugOrId;
  }
  if (options.brandId) {
    query.brandId = options.brandId;
  }
  if (options.includeArchived) {
    delete query.status;
  }

  const model = await models.findOne(query);
  if (!model) {
    throw new NotFoundError("Mobile model");
  }
  return model;
}

export async function createMobileModel(
  body: Record<string, unknown>,
): Promise<MobileModel> {
  const fieldErrors: Array<[string, string | null]> = [];

  const rawBrandId =
    typeof body.brandId === "string" ? body.brandId.trim() : body.brandId;
  fieldErrors.push(["brandId", requiredString(rawBrandId, "brandId")]);

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
    "imageUrl",
    optionalString(body.imageUrl, "imageUrl", { maxLength: 500 }),
  ]);

  let status: MobileModelStatus = "active";
  if (!isEmpty(body.status)) {
    fieldErrors.push([
      "status",
      isMobileModelStatus(body.status)
        ? null
        : `status must be "active" or "archived".`,
    ]);
    if (isMobileModelStatus(body.status)) {
      status = body.status;
    }
  }

  let brandId: ObjectId | null = null;
  if (typeof rawBrandId === "string" && !ObjectId.isValid(rawBrandId)) {
    fieldErrors.push(["brandId", "brandId must be a valid id."]);
  } else if (typeof rawBrandId === "string") {
    brandId = new ObjectId(rawBrandId);
  }

  const errors = collectFieldErrors(fieldErrors);
  if (errors) {
    throw new ValidationError(errors);
  }

  if (!brandId) {
    throw new ValidationError({ brandId: "brandId is required." });
  }
  if (!(await brandExists(brandId))) {
    throw new ValidationError({
      brandId: "The referenced brand does not exist.",
    });
  }

  const finalSlug = slug ?? "";
  const finalName = typeof name === "string" ? name : "";
  const models = await collection();

  const duplicate = await models.findOne({
    brandId,
    $or: [{ slug: finalSlug }, { name: finalName }],
  });
  if (duplicate) {
    throw new ValidationError({
      slug: "A model with this slug already exists for this brand.",
      name: "A model with this name already exists for this brand.",
    });
  }

  const now = new Date();
  const doc: MobileModel = {
    _id: new ObjectId(),
    brandId,
    name: finalName,
    slug: finalSlug,
    imageUrl: typeof body.imageUrl === "string" ? body.imageUrl.trim() : "",
    status,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await models.insertOne(doc);
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      throw new ValidationError({
        slug: "A model with this slug already exists for this brand.",
      });
    }
    throw error;
  }
  return doc;
}

export async function updateMobileModel(
  id: string,
  body: Record<string, unknown>,
): Promise<MobileModel> {
  if (!ObjectId.isValid(id)) {
    throw new ValidationError({ id: "Invalid mobile model id." });
  }
  const modelId = new ObjectId(id);

  const fieldErrors: Array<[string, string | null]> = [];
  const set: Partial<MobileModelFields> = {};

  if ("brandId" in body) {
    const value =
      typeof body.brandId === "string" ? body.brandId.trim() : undefined;
    const message = requiredString(value, "brandId");
    fieldErrors.push(["brandId", message]);
    if (message === null && value !== undefined && ObjectId.isValid(value)) {
      set.brandId = new ObjectId(value);
    } else if (value !== undefined && !ObjectId.isValid(value)) {
      fieldErrors.push(["brandId", "brandId must be a valid id."]);
    }
  }
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
  if ("imageUrl" in body) {
    const value =
      typeof body.imageUrl === "string" ? body.imageUrl.trim() : undefined;
    const message = optionalString(value, "imageUrl", { maxLength: 500 });
    fieldErrors.push(["imageUrl", message]);
    if (message === null && typeof value === "string") {
      set.imageUrl = value;
    }
  }
  if ("status" in body) {
    fieldErrors.push([
      "status",
      isMobileModelStatus(body.status)
        ? null
        : `status must be "active" or "archived".`,
    ]);
    if (isMobileModelStatus(body.status)) {
      set.status = body.status;
    }
  }

  const errors = collectFieldErrors(fieldErrors);
  if (errors) {
    throw new ValidationError(errors);
  }

  const models = await collection();

  const existing = await models.findOne({ _id: modelId });
  if (!existing) {
    throw new NotFoundError("Mobile model");
  }

  const effectiveBrandId = set.brandId ?? existing.brandId;

  if (set.brandId && !(await brandExists(set.brandId))) {
    throw new ValidationError({
      brandId: "The referenced brand does not exist.",
    });
  }
  if (set.name) {
    const exists = await models.countDocuments({
      brandId: effectiveBrandId,
      name: set.name,
      _id: { $ne: modelId },
    });
    if (exists > 0) {
      throw new ValidationError({
        name: "A model with this name already exists for this brand.",
      });
    }
  }
  if (set.slug) {
    const exists = await models.countDocuments({
      brandId: effectiveBrandId,
      slug: set.slug,
      _id: { $ne: modelId },
    });
    if (exists > 0) {
      throw new ValidationError({
        slug: "A model with this slug already exists for this brand.",
      });
    }
  }

  const updated = await models.findOneAndUpdate(
    { _id: modelId },
    { $set: { ...set, updatedAt: new Date() } },
    { returnDocument: "after", includeResultMetadata: false },
  );
  if (!updated) {
    throw new NotFoundError("Mobile model");
  }
  return updated;
}

export async function deactivateMobileModel(id: string): Promise<MobileModel> {
  if (!ObjectId.isValid(id)) {
    throw new ValidationError({ id: "Invalid mobile model id." });
  }
  const modelId = new ObjectId(id);
  const models = await collection();

  const updated = await models.findOneAndUpdate(
    { _id: modelId },
    { $set: { status: "archived", updatedAt: new Date() } },
    { returnDocument: "after", includeResultMetadata: false },
  );
  if (!updated) {
    throw new NotFoundError("Mobile model");
  }
  return updated;
}