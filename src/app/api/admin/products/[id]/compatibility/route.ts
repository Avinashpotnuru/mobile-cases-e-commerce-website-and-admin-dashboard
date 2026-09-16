import { handleApiError, ok, parseJsonBody, requireAdmin } from "@/lib/api";
import { addCompatibility } from "@/lib/services/product-compatibility-service";
import { isRecord } from "@/lib/validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await parseJsonBody(request);
    const data = isRecord(body) ? body : {};

    const modelId =
      typeof data.mobileModelId === "string" ? data.mobileModelId.trim() : "";

    const product = await addCompatibility(id, modelId);
    return ok(product);
  } catch (error) {
    return handleApiError(error);
  }
}