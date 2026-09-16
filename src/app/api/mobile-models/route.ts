import { ObjectId } from "mongodb";
import { handleApiError, ok, parsePagination } from "@/lib/api";
import { listMobileModels } from "@/lib/services/mobile-model-service";
import { ValidationError } from "@/lib/services/errors";

export async function GET(request: Request) {
  try {
    const pagination = parsePagination(request.url);

    const { searchParams } = new URL(request.url);
    const rawBrandId = searchParams.get("brandId");
    let brandId: ObjectId | undefined;
    if (rawBrandId) {
      if (!ObjectId.isValid(rawBrandId)) {
        throw new ValidationError({ brandId: "brandId must be a valid id." });
      }
      brandId = new ObjectId(rawBrandId);
    }

    const result = await listMobileModels({
      page: pagination.page,
      pageSize: pagination.pageSize,
      brandId,
    });

    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}