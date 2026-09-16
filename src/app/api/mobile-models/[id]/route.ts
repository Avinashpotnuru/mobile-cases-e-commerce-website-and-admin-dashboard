import { handleApiError, ok } from "@/lib/api";
import { getMobileModel } from "@/lib/services/mobile-model-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const model = await getMobileModel(decodeURIComponent(id));
    return ok(model);
  } catch (error) {
    return handleApiError(error);
  }
}