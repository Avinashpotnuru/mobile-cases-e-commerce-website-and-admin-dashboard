import { handleApiError, ok, requireAdmin } from "@/lib/api";
import { removeCompatibility } from "@/lib/services/product-compatibility-service";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; modelId: string }> },
) {
  try {
    await requireAdmin();

    const { id, modelId } = await params;
    const product = await removeCompatibility(
      id,
      decodeURIComponent(modelId),
    );

    return ok(product);
  } catch (error) {
    return handleApiError(error);
  }
}