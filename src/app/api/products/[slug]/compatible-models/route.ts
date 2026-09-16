import { handleApiError, ok } from "@/lib/api";
import { getModelsForProduct } from "@/lib/services/product-compatibility-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const models = await getModelsForProduct(decodeURIComponent(slug));
    return ok(models);
  } catch (error) {
    return handleApiError(error);
  }
}