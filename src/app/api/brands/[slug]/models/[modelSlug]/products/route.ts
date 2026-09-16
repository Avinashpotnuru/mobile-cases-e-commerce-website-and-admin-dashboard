import { handleApiError, ok, parsePagination } from "@/lib/api";
import { getBrand } from "@/lib/services/brand-service";
import { getMobileModel } from "@/lib/services/mobile-model-service";
import { getProductsForModel } from "@/lib/services/product-compatibility-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; modelSlug: string }> },
) {
  try {
    const { slug, modelSlug } = await params;
    const pagination = parsePagination(_request.url);

    const brand = await getBrand(decodeURIComponent(slug));
    const model = await getMobileModel(decodeURIComponent(modelSlug), {
      brandId: brand._id,
    });

    const result = await getProductsForModel(model._id.toHexString(), {
      page: pagination.page,
      pageSize: pagination.pageSize,
    });

    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}