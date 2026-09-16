import { handleApiError, ok } from "@/lib/api";
import { getProduct } from "@/lib/services/product-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const product = await getProduct(decodeURIComponent(slug));
    return ok(product);
  } catch (error) {
    return handleApiError(error);
  }
}