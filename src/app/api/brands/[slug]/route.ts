import { handleApiError, ok } from "@/lib/api";
import { getBrand } from "@/lib/services/brand-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const brand = await getBrand(decodeURIComponent(slug));
    return ok(brand);
  } catch (error) {
    return handleApiError(error);
  }
}