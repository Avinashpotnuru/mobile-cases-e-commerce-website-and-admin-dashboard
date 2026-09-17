import { ObjectId } from "mongodb";
import { handleApiError, ok, parsePagination } from "@/lib/api";
import { listInventory } from "@/lib/services/inventory-service";
import { ValidationError } from "@/lib/services/errors";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(request.url);

    const productIdsParam = searchParams.get("productIds");
    let productIds: ObjectId[] | undefined;
    if (productIdsParam) {
      const rawIds = productIdsParam
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      if (rawIds.length === 0 || rawIds.length > 100) {
        throw new ValidationError({
          productIds: "productIds must contain between 1 and 100 ids.",
        });
      }
      const ids: ObjectId[] = [];
      for (const rawId of rawIds) {
        if (!ObjectId.isValid(rawId)) {
          throw new ValidationError({
            productIds: "Every product id must be a valid id.",
          });
        }
        ids.push(new ObjectId(rawId));
      }
      productIds = ids;
    }

    const result = await listInventory({
      page: pagination.page,
      pageSize: Math.max(pagination.pageSize, productIds?.length ?? 20),
      productIds,
    });

    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}