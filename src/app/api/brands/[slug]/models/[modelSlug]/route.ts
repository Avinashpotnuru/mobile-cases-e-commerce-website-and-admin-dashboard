import { handleApiError, ok } from "@/lib/api";
import { getBrand } from "@/lib/services/brand-service";
import { getMobileModel } from "@/lib/services/mobile-model-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; modelSlug: string }> },
) {
  try {
    const { slug, modelSlug } = await params;

    const brand = await getBrand(decodeURIComponent(slug));
    const model = await getMobileModel(decodeURIComponent(modelSlug), {
      brandId: brand._id,
    });

    return ok(model);
  } catch (error) {
    return handleApiError(error);
  }
}