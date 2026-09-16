import { ObjectId } from "mongodb";
import { handleApiError, ok, parsePagination } from "@/lib/api";
import { listProducts } from "@/lib/services/product-service";
import { ValidationError } from "@/lib/services/errors";
import { collectFieldErrors } from "@/lib/validation";

const MAX_SEARCH_LENGTH = 100;

export async function GET(request: Request) {
  try {
    const pagination = parsePagination(request.url);
    const { searchParams } = new URL(request.url);

    const rawBrandId = searchParams.get("brandId");
    const rawModelId = searchParams.get("mobileModelId");
    const rawQ = searchParams.get("q");

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
    ]);
    if (fieldErrors) {
      throw new ValidationError(fieldErrors);
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