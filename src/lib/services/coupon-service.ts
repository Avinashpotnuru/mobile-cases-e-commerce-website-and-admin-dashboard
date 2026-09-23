import {
  MongoServerError,
  ObjectId,
  type Collection,
  type Filter,
} from "mongodb";
import { getDb } from "@/lib/database";
import {
  COUPON_COLLECTION,
  type Coupon,
  type CouponStatus,
  type CouponType,
} from "@/lib/database/models";
import {
  CouponValidationError,
  NotFoundError,
  ValidationError,
} from "@/lib/services/errors";
import { collectFieldErrors, isRecord } from "@/lib/validation";
import type { PaginatedResult } from "@/types/pagination";

export const COUPON_CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-_]{2,49}$/;
const MAX_VALUE_PERCENT = 99;

export type CouponFields = Pick<
  Coupon,
  | "code"
  | "type"
  | "value"
  | "minSubtotalCents"
  | "maxDiscountCents"
  | "expiresAt"
  | "usageLimit"
  | "status"
>;

function collection(): Promise<Collection<Coupon>> {
  return getDb().then((db) => db.collection<Coupon>(COUPON_COLLECTION));
}

function isCouponStatus(value: unknown): value is CouponStatus {
  return value === "active" || value === "inactive";
}

function isCouponType(value: unknown): value is CouponType {
  return value === "percent" || value === "fixed";
}

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

function normalizeCode(value: unknown): string {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function parseCents(value: unknown): number | null {
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

function parseOptionalDate(value: unknown): Date | undefined {
  if (isEmpty(value)) {
    return undefined;
  }
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  return undefined;
}

export async function listCoupons(params: {
  page: number;
  pageSize: number;
  includeInactive?: boolean;
  search?: string;
  status?: CouponStatus;
}): Promise<PaginatedResult<Coupon>> {
  const { page, pageSize } = params;
  const filter: Filter<Coupon> = {};
  if (params.status) {
    filter.status = params.status;
  } else if (!params.includeInactive) {
    filter.status = "active" as const;
  }
  const search = params.search?.trim();
  if (search) {
    filter.code = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  }
  const coupons = await collection();

  const [total, items] = await Promise.all([
    coupons.countDocuments(filter),
    coupons
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

export async function getCoupon(
  codeOrId: string,
  options: { includeInactive?: boolean } = {},
): Promise<Coupon> {
  const coupons = await collection();

  const query: Filter<Coupon> = {};
  if (ObjectId.isValid(codeOrId)) {
    query._id = new ObjectId(codeOrId);
  } else {
    query.code = codeOrId.trim().toUpperCase();
  }
  if (!options.includeInactive) {
    query.status = "active" as const;
  }

  const coupon = await coupons.findOne(query);
  if (!coupon) {
    throw new NotFoundError("Coupon");
  }
  return coupon;
}

export function computeCouponDiscount(
  coupon: Pick<
    Coupon,
    "type" | "value" | "maxDiscountCents" | "minSubtotalCents"
  >,
  subtotalCents: number,
): number {
  const subtotal = Math.max(0, subtotalCents);
  const raw =
    coupon.type === "percent"
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value;
  let discount = Math.min(raw, subtotal);
  if (coupon.maxDiscountCents !== undefined) {
    discount = Math.min(discount, coupon.maxDiscountCents);
  }
  return Math.max(0, discount);
}

export function validateCoupon(
  coupon: Coupon,
  subtotalCents: number,
): number {
  if (coupon.status !== "active") {
    throw new CouponValidationError("This coupon is no longer available.");
  }
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    throw new CouponValidationError("This coupon has expired.");
  }
  if (
    coupon.usageLimit !== undefined &&
    coupon.usedCount >= coupon.usageLimit
  ) {
    throw new CouponValidationError("This coupon has been fully redeemed.");
  }
  if (
    coupon.minSubtotalCents !== undefined &&
    subtotalCents < coupon.minSubtotalCents
  ) {
    throw new CouponValidationError(
      `Add ${((coupon.minSubtotalCents - subtotalCents) / 100).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      })} more to use this coupon.`,
    );
  }
  return computeCouponDiscount(coupon, subtotalCents);
}

export async function createCoupon(body: unknown): Promise<Coupon> {
  const input = isRecord(body) ? body : {};
  const fieldErrors: Array<[string, string | null]> = [];

  const code = normalizeCode(input.code);
  fieldErrors.push([
    "code",
    code
      ? COUPON_CODE_PATTERN.test(code)
        ? null
        : "code must be 3–50 letters, numbers, hyphens, or underscores."
      : "code is required.",
  ]);

  let type: CouponType = "percent";
  if (isEmpty(input.type)) {
    fieldErrors.push(["type", null]);
  } else {
    fieldErrors.push([
      "type",
      isCouponType(input.type) ? null : `type must be "percent" or "fixed".`,
    ]);
    if (isCouponType(input.type)) {
      type = input.type;
    }
  }

  let value: number | null = null;
  if (rawIsEmpty(input.value)) {
    fieldErrors.push(["value", "value is required."]);
  } else if (typeof input.value !== "number") {
    fieldErrors.push(["value", "value must be a number."]);
    value = null;
  } else if (type === "percent") {
    if (
      !Number.isInteger(input.value) ||
      input.value < 1 ||
      input.value > MAX_VALUE_PERCENT
    ) {
      fieldErrors.push([
        "value",
        `value must be an integer between 1 and ${MAX_VALUE_PERCENT} for percentage coupons.`,
      ]);
    } else {
      value = input.value;
    }
  } else if (parseCents(input.value) === null || input.value <= 0) {
    fieldErrors.push([
      "value",
      "value must be a positive integer amount (in cents).",
    ]);
  } else {
    value = input.value;
  }

  const minSubtotal = isEmpty(input.minSubtotalCents)
    ? 0
    : parseCents(input.minSubtotalCents);
  if (!isEmpty(input.minSubtotalCents) && minSubtotal === null) {
    fieldErrors.push([
      "minSubtotalCents",
      "minSubtotalCents must be a non-negative integer.",
    ]);
  }

  const maxDiscount = isEmpty(input.maxDiscountCents)
    ? 0
    : parseCents(input.maxDiscountCents);
  if (!isEmpty(input.maxDiscountCents) && maxDiscount === null) {
    fieldErrors.push([
      "maxDiscountCents",
      "maxDiscountCents must be a non-negative integer.",
    ]);
  }

  const expiresAt = parseOptionalDate(input.expiresAt);
  if (!isEmpty(input.expiresAt) && expiresAt === undefined) {
    fieldErrors.push(["expiresAt", "expiresAt must be a valid date."]);
  }

  let usageLimit: number | null = null;
  if (!isEmpty(input.usageLimit)) {
    if (
      typeof input.usageLimit !== "number" ||
      !Number.isInteger(input.usageLimit) ||
      input.usageLimit < 1
    ) {
      fieldErrors.push([
        "usageLimit",
        "usageLimit must be a positive integer.",
      ]);
    } else {
      usageLimit = input.usageLimit;
    }
  }

  let status: CouponStatus = "active";
  if (!isEmpty(input.status)) {
    fieldErrors.push([
      "status",
      isCouponStatus(input.status)
        ? null
        : `status must be "active" or "inactive".`,
    ]);
    if (isCouponStatus(input.status)) {
      status = input.status;
    }
  }

  const errors = collectFieldErrors(fieldErrors);
  if (errors) {
    throw new ValidationError(errors);
  }

  const coupons = await collection();
  const duplicate = await coupons.countDocuments({ code });
  if (duplicate > 0) {
    throw new ValidationError({
      code: "A coupon with this code already exists.",
    });
  }

  const now = new Date();
  const doc: Coupon = {
    _id: new ObjectId(),
    code,
    type,
    value: value ?? 0,
    ...((minSubtotal ?? 0) > 0 ? { minSubtotalCents: minSubtotal ?? 0 } : {}),
    ...((maxDiscount ?? 0) > 0 ? { maxDiscountCents: maxDiscount ?? 0 } : {}),
    ...(expiresAt ? { expiresAt } : {}),
    ...(usageLimit !== null ? { usageLimit } : {}),
    usedCount: 0,
    status,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await coupons.insertOne(doc);
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      throw new ValidationError({
        code: "A coupon with this code already exists.",
      });
    }
    throw error;
  }
  return doc;
}

function rawIsEmpty(value: unknown): boolean {
  return value === undefined || value === null;
}

export async function updateCoupon(
  id: string,
  body: unknown,
): Promise<Coupon> {
  if (!ObjectId.isValid(id)) {
    throw new ValidationError({ id: "Invalid coupon id." });
  }
  const couponId = new ObjectId(id);
  const input = isRecord(body) ? body : {};

  const fieldErrors: Array<[string, string | null]> = [];
  const set: Partial<CouponFields> = {};
  const unset: Array<keyof CouponFields> = [];

  if ("code" in input) {
    const code = normalizeCode(input.code);
    fieldErrors.push([
      "code",
      code
        ? COUPON_CODE_PATTERN.test(code)
          ? null
          : "code must be 3–50 letters, numbers, hyphens, or underscores."
        : "code is required.",
    ]);
    if (code && COUPON_CODE_PATTERN.test(code)) {
      set.code = code;
    }
  }
  if ("type" in input) {
    fieldErrors.push([
      "type",
      isCouponType(input.type) ? null : `type must be "percent" or "fixed".`,
    ]);
    if (isCouponType(input.type)) {
      set.type = input.type;
    }
  }
  if ("value" in input) {
    if (rawIsEmpty(input.value) || typeof input.value !== "number") {
      fieldErrors.push(["value", "value must be a number."]);
    } else {
      const type = set.type ?? (await currentCoupon(couponId))?.type ?? "percent";
      if (type === "percent") {
        if (
          !Number.isInteger(input.value) ||
          input.value < 1 ||
          input.value > MAX_VALUE_PERCENT
        ) {
          fieldErrors.push([
            "value",
            `value must be an integer between 1 and ${MAX_VALUE_PERCENT} for percentage coupons.`,
          ]);
        } else {
          set.value = input.value;
        }
      } else if (parseCents(input.value) === null || input.value <= 0) {
        fieldErrors.push([
          "value",
          "value must be a positive integer amount (in cents).",
        ]);
      } else {
        set.value = input.value;
      }
    }
  }
  if ("minSubtotalCents" in input) {
    if (isEmpty(input.minSubtotalCents)) {
      unset.push("minSubtotalCents");
    } else {
      const minSubtotal = parseCents(input.minSubtotalCents);
      if (minSubtotal === null) {
        fieldErrors.push([
          "minSubtotalCents",
          "minSubtotalCents must be a non-negative integer.",
        ]);
      } else {
        set.minSubtotalCents = minSubtotal;
      }
    }
  }
  if ("maxDiscountCents" in input) {
    if (isEmpty(input.maxDiscountCents)) {
      unset.push("maxDiscountCents");
    } else {
      const maxDiscount = parseCents(input.maxDiscountCents);
      if (maxDiscount === null) {
        fieldErrors.push([
          "maxDiscountCents",
          "maxDiscountCents must be a non-negative integer.",
        ]);
      } else {
        set.maxDiscountCents = maxDiscount;
      }
    }
  }
  if ("expiresAt" in input) {
    if (isEmpty(input.expiresAt)) {
      unset.push("expiresAt");
    } else {
      const expiresAt = parseOptionalDate(input.expiresAt);
      if (expiresAt === undefined) {
        fieldErrors.push(["expiresAt", "expiresAt must be a valid date."]);
      } else {
        set.expiresAt = expiresAt;
      }
    }
  }
  if ("usageLimit" in input) {
    if (isEmpty(input.usageLimit)) {
      unset.push("usageLimit");
    } else if (
      typeof input.usageLimit !== "number" ||
      !Number.isInteger(input.usageLimit) ||
      input.usageLimit < 1
    ) {
      fieldErrors.push(["usageLimit", "usageLimit must be a positive integer."]);
    } else {
      set.usageLimit = input.usageLimit;
    }
  }
  if ("status" in input) {
    fieldErrors.push([
      "status",
      isCouponStatus(input.status) ? null : `status must be "active" or "inactive".`,
    ]);
    if (isCouponStatus(input.status)) {
      set.status = input.status;
    }
  }

  const errors = collectFieldErrors(fieldErrors);
  if (errors) {
    throw new ValidationError(errors);
  }

  const coupons = await collection();

  if (set.code) {
    const exists = await coupons.countDocuments({
      code: set.code,
      _id: { $ne: couponId },
    });
    if (exists > 0) {
      throw new ValidationError({
        code: "A coupon with this code already exists.",
      });
    }
  }

  const operations: Record<string, unknown> = { $set: { ...set, updatedAt: new Date() } };
  if (unset.length > 0) {
    operations.$unset = Object.fromEntries(unset.map((key) => [key, ""]));
  }

  const updated = await coupons.findOneAndUpdate(
    { _id: couponId },
    operations,
    { returnDocument: "after", includeResultMetadata: false },
  );
  if (!updated) {
    throw new NotFoundError("Coupon");
  }
  return updated;
}

async function currentCoupon(id: ObjectId): Promise<Coupon | null> {
  const coupons = await collection();
  return coupons.findOne({ _id: id });
}

/**
 * Redeems a coupon against an order subtotal. Validates eligibility and
 * atomically increments the usage counter (if the coupon is limited).
 */
export async function redeemCoupon(
  code: string,
  subtotalCents: number,
): Promise<{ discountCents: number; code: string }> {
  const coupon = await getCoupon(code, { includeInactive: true });
  const discountCents = validateCoupon(coupon, subtotalCents);

  if (coupon.usageLimit !== undefined) {
    const coupons = await collection();
    const result = await coupons.findOneAndUpdate(
      {
        _id: coupon._id,
        usedCount: { $lt: coupon.usageLimit },
      },
      { $inc: { usedCount: 1 } },
      { returnDocument: "after", includeResultMetadata: false },
    );
    if (!result) {
      throw new CouponValidationError(
        "This coupon could not be applied. It may have been fully redeemed.",
      );
    }
    return { discountCents, code: result.code };
  }

  return { discountCents, code: coupon.code };
}

export async function deactivateCoupon(id: string): Promise<Coupon> {
  if (!ObjectId.isValid(id)) {
    throw new ValidationError({ id: "Invalid coupon id." });
  }
  const couponId = new ObjectId(id);
  const coupons = await collection();

  const updated = await coupons.findOneAndUpdate(
    { _id: couponId },
    { $set: { status: "inactive", updatedAt: new Date() } },
    { returnDocument: "after", includeResultMetadata: false },
  );
  if (!updated) {
    throw new NotFoundError("Coupon");
  }
  return updated;
}

export type StorefrontCoupon = {
  code: string;
  type: CouponType;
  value: number;
  minSubtotalCents?: number;
  maxDiscountCents?: number;
  expiresAt?: Date;
};

/**
 * Public-facing list of coupons customers can currently redeem at checkout.
 * Excludes internal state (usedCount, status) and filters out coupons that
 * are inactive, expired, or fully redeemed.
 */
export async function listStorefrontCoupons(): Promise<StorefrontCoupon[]> {
  const coupons = await collection();
  const docs = await coupons
    .find({
      status: "active",
      $and: [
        {
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: new Date() } },
          ],
        },
        {
          $or: [
            { usageLimit: { $exists: false } },
            { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
          ],
        },
      ],
    })
    .sort({ createdAt: 1 })
    .toArray();

  return docs.map(({ code, type, value, minSubtotalCents, maxDiscountCents, expiresAt }) => ({
    code,
    type,
    value,
    ...(minSubtotalCents !== undefined ? { minSubtotalCents } : {}),
    ...(maxDiscountCents !== undefined ? { maxDiscountCents } : {}),
    ...(expiresAt !== undefined ? { expiresAt } : {}),
  }));
}