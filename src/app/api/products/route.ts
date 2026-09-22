import { ObjectId } from "mongodb";
import { handleApiError, ok, parsePagination } from "@/lib/api";
import {
  listProducts,
  listProductsByIds,
} from "@/lib/services/product-service";
import { resolveProductImage } from "@/lib/storefront/product-listing";
import { ValidationError } from "@/lib/services/errors";
import { collectFieldErrors } from "@/lib/validation";

const MAX_SEARCH_LENGTH = 100;
const MAX_IDS = 50;

export async function GET(request: Request) {
  try {
    const pagination = parsePagination(request.url);
    const { searchParams } = new URL(request.url);

    const rawBrandId = searchParams.get("brandId");
    const rawModelId = searchParams.get("mobileModelId");
    const rawQ = searchParams.get("q");
    const rawIds = searchParams.get("ids");

    const ids = rawIds
      ? rawIds
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
          .slice(0, MAX_IDS)
      : [];

    const fieldErrors = collectFieldErrors([
      [
        "brandId",
        rawBrandId && !ObjectId.isValid(rawBrandId)
          ? "brandId must be a valid id."
          : null,
      ],
      [
        "mobileModelId",
        rawModelId && !ObjectId.isValid(rawModelId)
          ? "mobileModelId must be a valid id."
          : null,
      ],
      [
        "q",
        rawQ !== null && rawQ.length > MAX_SEARCH_LENGTH
          ? `q must be ${MAX_SEARCH_LENGTH} characters or fewer.`
          : null,
      ],
      [
        "ids",
        ids.some((value) => !ObjectId.isValid(value))
          ? "ids must contain valid product ids."
          : null,
      ],
    ]);
    if (fieldErrors) {
      throw new ValidationError(fieldErrors);
    }

    if (ids.length > 0) {
      const products = await listProductsByIds(ids.map((value) => new ObjectId(value)));
      return ok({
        items: products.map((product) => ({
          id: product._id.toHexString(),
          ...product,
          image: resolveProductImage(product.images?.[0]),
        })),
        page: 1,
        pageSize: products.length,
        total: products.length,
        totalPages: 1,
      });
    }

    const result = await listProducts({
      page: pagination.page,
      pageSize: pagination.pageSize,
      brandId: rawBrandId ? new ObjectId(rawBrandId) : undefined,
      mobileModelId: rawModelId ? new ObjectId(rawModelId) : undefined,
      q: rawQ?.trim() || undefined,
    });

    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}