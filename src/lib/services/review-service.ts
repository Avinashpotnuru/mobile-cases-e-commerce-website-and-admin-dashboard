import { ObjectId } from "mongodb";
import { getDb } from "@/lib/database";
import { REVIEW_COLLECTION, type Review } from "@/lib/database/models";
import { getProduct } from "@/lib/services/product-service";
import { NotFoundError, ValidationError } from "@/lib/services/errors";
import type { Customer } from "@/lib/database/models";

export type ReviewInput = {
  rating: unknown;
  title: unknown;
  comment: unknown;
};

export type ProductRatingSummary = {
  average: number | null;
  count: number;
};

export type ProductReviewPublic = {
  id: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: Date;
};

function normalize(input: ReviewInput): {
  rating: number;
  title: string;
  comment: string;
} {
  const rawRating =
    typeof input.rating === "number" ? input.rating : Number(input.rating);
  const rating = Number.isInteger(rawRating) ? rawRating : NaN;
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const comment = typeof input.comment === "string" ? input.comment.trim() : "";
  return { rating, title, comment };
}

function validate(input: {
  rating: number;
  title: string;
  comment: string;
}): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  if (Number.isNaN(input.rating) || input.rating < 1 || input.rating > 5) {
    fieldErrors.rating = "Rating must be a whole number between 1 and 5.";
  }
  if (input.title.length > 80) {
    fieldErrors.title = "Title must be 80 characters or fewer.";
  }
  if (input.comment.length < 5) {
    fieldErrors.comment = "Please write a comment of at least 5 characters.";
  }
  if (input.comment.length > 1000) {
    fieldErrors.comment = "Comment must be 1000 characters or fewer.";
  }
  return fieldErrors;
}

export async function createReview(
  customer: Customer,
  productId: string,
  input: ReviewInput,
): Promise<ProductReviewPublic> {
  if (!ObjectId.isValid(productId)) {
    throw new ValidationError({ productId: "Invalid product id." });
  }
  await getProduct(productId);

  const form = normalize(input);
  const fieldErrors = validate(form);
  if (Object.keys(fieldErrors).length > 0) {
    throw new ValidationError(fieldErrors);
  }

  const db = await getDb();
  const reviews = db.collection<Review>(REVIEW_COLLECTION);
  const now = new Date();
  const review = await reviews.findOneAndUpdate(
    { productId: new ObjectId(productId), customerId: customer._id },
    {
      $set: {
        customerName: `${customer.firstName} ${customer.lastName}`.trim(),
        rating: form.rating,
        title: form.title,
        comment: form.comment,
        status: "approved" as const,
        updatedAt: now,
      },
      $setOnInsert: {
        _id: new ObjectId(),
        productId: new ObjectId(productId),
        customerId: customer._id,
        createdAt: now,
      },
    },
    { returnDocument: "after", upsert: true, includeResultMetadata: false },
  );

  if (!review) {
    throw new Error("Failed to save review.");
  }

  return toPublicReview(review);
}

export async function getProductRating(productId: string): Promise<ProductRatingSummary> {
  if (!ObjectId.isValid(productId)) {
    return { average: null, count: 0 };
  }
  return getRatingsForProducts([new ObjectId(productId)]).then(
    (ratings) => ratings.get(productId) ?? { average: null, count: 0 },
  );
}

export async function getRatingsForProducts(
  productIds: ObjectId[],
): Promise<Map<string, ProductRatingSummary>> {
  const result = new Map<string, ProductRatingSummary>();
  if (productIds.length === 0) return result;
  const db = await getDb();

  const rows = await db
    .collection<Review>(REVIEW_COLLECTION)
    .aggregate<{ _id: ObjectId; average: number; count: number }>([
      {
        $match: {
          productId: { $in: productIds },
          status: "approved",
        },
      },
      {
        $group: {
          _id: "$productId",
          average: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ])
    .toArray();

  for (const row of rows) {
    result.set(row._id.toHexString(), {
      average: Math.round(row.average * 10) / 10,
      count: row.count,
    });
  }
  return result;
}

export async function listProductReviews(
  productId: string,
  limit = 20,
): Promise<ProductReviewPublic[]> {
  if (!ObjectId.isValid(productId)) {
    throw new NotFoundError("Product");
  }
  const db = await getDb();
  const reviews = await db
    .collection<Review>(REVIEW_COLLECTION)
    .find({ productId: new ObjectId(productId), status: "approved" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return reviews.map(toPublicReview);
}

function toPublicReview(review: Review): ProductReviewPublic {
  return {
    id: review._id.toHexString(),
    customerName: review.customerName,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    createdAt: review.createdAt,
  };
}

export async function getStoreRating(): Promise<ProductRatingSummary> {
  const db = await getDb();
  const row = await db
    .collection<Review>(REVIEW_COLLECTION)
    .aggregate<{ average: number | null; count: number }>([
      { $match: { status: "approved" } },
      { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } },
    ])
    .next();
  if (!row) {
    return { average: null, count: 0 };
  }
  return {
    average: row.average === null ? null : Math.round(row.average * 10) / 10,
    count: row.count,
  };
}