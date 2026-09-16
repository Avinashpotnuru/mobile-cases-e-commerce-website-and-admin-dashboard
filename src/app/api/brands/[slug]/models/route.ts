import { handleApiError, ok, parsePagination } from "@/lib/api";
import { getBrand } from "@/lib/services/brand-service";
import { listMobileModels } from "@/lib/services/mobile-model-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const pagination = parsePagination(_request.url);

    const brand = await getBrand(decodeURIComponent(slug));
    const result = await listMobileModels({
      page: pagination.page,
      pageSize: pagination.pageSize,
      brandId: brand._id,
    });

    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}