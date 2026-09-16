import {
  MongoServerError,
  ObjectId,
  type Collection,
  type Filter,
} from "mongodb";
import { getDb } from "@/lib/database";
import {
  BRAND_COLLECTION,
  type Brand,
  type BrandStatus,
} from "@/lib/database/models";
import { NotFoundError, ValidationError } from "@/lib/services/errors";
import {
  collectFieldErrors,
  optionalString,
  requiredString,
  validSlug,
} from "@/lib/validation";
import type { PaginatedResult } from "@/types/pagination";

type BrandFields = Pick<
  Brand,
  "name" | "slug" | "description" | "logoUrl" | "status"
>;

function collection(): Promise<Collection<Brand>> {
  return getDb().then((db) => db.collection<Brand>(BRAND_COLLECTION));
}

function isBrandStatus(value: unknown): value is BrandStatus {
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

export type ListBrandsParams = {
  page: number;
  pageSize: number;
  includeArchived?: boolean;
};

export async function listBrands(
  params: ListBrandsParams,
): Promise<PaginatedResult<Brand>> {
  const { page, pageSize } = params;
  const filter: Filter<Brand> = params.includeArchived
    ? {}
    : { status: "active" as const };
  const brands = await collection();

  const [total, items] = await Promise.all([
    brands.countDocuments(filter),
    brands
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

export async function getBrand(
  slugOrId: string,
  options: { includeArchived?: boolean } = {},
): Promise<Brand> {
  const brands = await collection();

  const query: Filter<Brand> = { status: "active" as const };
  if (ObjectId.isValid(slugOrId)) {
    query._id = new ObjectId(slugOrId);
  } else {
    query.slug = slugOrId;
  }
  if (options.includeArchived) {
    delete query.status;
  }

  const brand = await brands.findOne(query);
  if (!brand) {
    throw new NotFoundError("Brand");
  }
  return brand;
}

export async function createBrand(body: Record<string, unknown>): Promise<Brand> {
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
    optionalString(body.description, "description", { maxLength: 2000 }),
  ]);
  fieldErrors.push([
    "logoUrl",
    optionalString(body.logoUrl, "logoUrl", { maxLength: 500 }),
  ]);

  let status: BrandStatus = "active";
  if (!isEmpty(body.status)) {
    fieldErrors.push([
      "status",
      isBrandStatus(body.status)
        ? null
        : `status must be "active" or "archived".`,
    ]);
    if (isBrandStatus(body.status)) {
      status = body.status;
    }
  }

  const errors = collectFieldErrors(fieldErrors);
  if (errors) {
    throw new ValidationError(errors);
  }

  const finalSlug = slug ?? "";
  const finalName = typeof name === "string" ? name : "";
  const brands = await collection();

  const duplicateCount = await brands.countDocuments({
    $or: [{ slug: finalSlug }, { name: finalName }],
  });
  if (duplicateCount > 0) {
    throw new ValidationError({
      slug: "A brand with this slug already exists.",
      name: "A brand with this name already exists.",
    });
  }

  const now = new Date();
  const doc: Brand = {
    _id: new ObjectId(),
    name: finalName,
    slug: finalSlug,
    description:
      typeof body.description === "string" ? body.description.trim() : "",
    logoUrl: typeof body.logoUrl === "string" ? body.logoUrl.trim() : "",
    status,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await brands.insertOne(doc);
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      throw new ValidationError({
        slug: "A brand with this slug already exists.",
      });
    }
    throw error;
  }
  return doc;
}

export async function updateBrand(
  id: string,
  body: Record<string, unknown>,
): Promise<Brand> {
  if (!ObjectId.isValid(id)) {
    throw new ValidationError({ id: "Invalid brand id." });
  }
  const brandId = new ObjectId(id);

  const fieldErrors: Array<[string, string | null]> = [];
  const set: Partial<BrandFields> = {};

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
      maxLength: 2000,
    });
    fieldErrors.push(["description", message]);
    if (message === null && typeof value === "string") {
      set.description = value;
    }
  }
  if ("logoUrl" in body) {
    const value =
      typeof body.logoUrl === "string" ? body.logoUrl.trim() : undefined;
    const message = optionalString(value, "logoUrl", {
      maxLength: 500,
    });
    fieldErrors.push(["logoUrl", message]);
    if (message === null && typeof value === "string") {
      set.logoUrl = value;
    }
  }
  if ("status" in body) {
    fieldErrors.push([
      "status",
      isBrandStatus(body.status)
        ? null
        : `status must be "active" or "archived".`,
    ]);
    if (isBrandStatus(body.status)) {
      set.status = body.status;
    }
  }

  const errors = collectFieldErrors(fieldErrors);
  if (errors) {
    throw new ValidationError(errors);
  }

  const brands = await collection();

  if (set.name) {
    const exists = await brands.countDocuments({
      name: set.name,
      _id: { $ne: brandId },
    });
    if (exists > 0) {
      throw new ValidationError({
        name: "A brand with this name already exists.",
      });
    }
  }
  if (set.slug) {
    const exists = await brands.countDocuments({
      slug: set.slug,
      _id: { $ne: brandId },
    });
    if (exists > 0) {
      throw new ValidationError({
        slug: "A brand with this slug already exists.",
      });
    }
  }

  const updated = await brands.findOneAndUpdate(
    { _id: brandId },
    { $set: { ...set, updatedAt: new Date() } },
    { returnDocument: "after", includeResultMetadata: false },
  );
  if (!updated) {
    throw new NotFoundError("Brand");
  }
  return updated;
}

export async function deactivateBrand(id: string): Promise<Brand> {
  if (!ObjectId.isValid(id)) {
    throw new ValidationError({ id: "Invalid brand id." });
  }
  const brandId = new ObjectId(id);
  const brands = await collection();

  const updated = await brands.findOneAndUpdate(
    { _id: brandId },
    { $set: { status: "archived", updatedAt: new Date() } },
    { returnDocument: "after", includeResultMetadata: false },
  );
  if (!updated) {
    throw new NotFoundError("Brand");
  }
  return updated;
}