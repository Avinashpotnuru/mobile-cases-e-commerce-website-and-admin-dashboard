import { created, handleApiError, parseJsonBody, requireAdmin } from "@/lib/api";
import { createMobileModel } from "@/lib/services/mobile-model-service";
import { isRecord } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await parseJsonBody(request);
    const model = await createMobileModel(isRecord(body) ? body : {});

    return created(model);
  } catch (error) {
    return handleApiError(error);
  }
}