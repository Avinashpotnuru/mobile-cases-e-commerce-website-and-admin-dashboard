import {
  handleApiError,
  ok,
  parseJsonBody,
  requireAdmin,
} from "@/lib/api";
import {
  deactivateProduct,
  updateProduct,
} from "@/lib/services/product-service";
import { isRecord } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await parseJsonBody(request);
    const product = await updateProduct(id, isRecord(body) ? body : {});

    return ok(product);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const product = await deactivateProduct(id);

    return ok(product);
  } catch (error) {
    return handleApiError(error);
  }
}