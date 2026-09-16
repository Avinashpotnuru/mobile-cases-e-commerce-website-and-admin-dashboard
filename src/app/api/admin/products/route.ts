import { created, handleApiError, parseJsonBody, requireAdmin } from "@/lib/api";
import { createProduct } from "@/lib/services/product-service";
import { isRecord } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await parseJsonBody(request);
    const product = await createProduct(isRecord(body) ? body : {});

    return created(product);
  } catch (error) {
    return handleApiError(error);
  }
}