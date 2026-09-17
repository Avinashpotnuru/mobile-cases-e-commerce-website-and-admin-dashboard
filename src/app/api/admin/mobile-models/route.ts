import { ObjectId } from "mongodb";
import {
  created,
  handleApiError,
  ok,
  parseJsonBody,
  parsePagination,
  requireAdmin,
} from "@/lib/api";
import {
  createMobileModel,
  listMobileModels,
} from "@/lib/services/mobile-model-service";
import { ValidationError } from "@/lib/services/errors";
import { isRecord } from "@/lib/validation";
import type { MobileModelStatus } from "@/lib/database/models";

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || undefined;
    const includeArchived = searchParams.get("includeArchived") === "true";
    const statusParam = searchParams.get("status");
    const status: MobileModelStatus | undefined =
      statusParam === "active" || statusParam === "archived"
        ? statusParam
        : undefined;
    const brandIdParam = searchParams.get("brandId");
    let brandId;
    if (brandIdParam) {
      if (!ObjectId.isValid(brandIdParam)) {
        throw new ValidationError({ brandId: "brandId must be a valid id." });
      }
      brandId = new ObjectId(brandIdParam);
    }

    const result = await listMobileModels({
      ...parsePagination(request.url),
      search,
      includeArchived,
      status,
      brandId,
    });

    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await parseJsonBody(request);
    const model = await createMobileModel(isRecord(body) ? body : {});

    return created(model);
  } catch (error) {
    return handleApiError(error);
  }
}