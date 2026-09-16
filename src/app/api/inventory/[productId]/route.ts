import { handleApiError, ok } from "@/lib/api";
import { getInventoryByProduct } from "@/lib/services/inventory-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const { productId } = await params;
    const inventory = await getInventoryByProduct(
      decodeURIComponent(productId),
    );
    return ok(inventory);
  } catch (error) {
    return handleApiError(error);
  }
}