import {
  created,
  handleApiError,
  ok,
  parseJsonBody,
  parsePagination,
  requireAdmin,
} from "@/lib/api";
import {
  createBrand,
  listBrands,
} from "@/lib/services/brand-service";
import { isRecord } from "@/lib/validation";
import type { BrandStatus } from "@/lib/database/models";

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || undefined;
    const includeArchived = searchParams.get("includeArchived") === "true";
    const statusParam = searchParams.get("status");
    const status: BrandStatus | undefined =
      statusParam === "active" || statusParam === "archived"
        ? statusParam
        : undefined;
    const result = await listBrands({
      ...parsePagination(request.url),
      search,
      includeArchived,
      status,
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
    const brand = await createBrand(isRecord(body) ? body : {});

    return created(brand);
  } catch (error) {
    return handleApiError(error);
  }
}