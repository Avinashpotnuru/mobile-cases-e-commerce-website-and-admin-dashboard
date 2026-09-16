import {
  handleApiError,
  ok,
  parseJsonBody,
  requireAdmin,
} from "@/lib/api";
import {
  deactivateMobileModel,
  updateMobileModel,
} from "@/lib/services/mobile-model-service";
import { isRecord } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await parseJsonBody(request);
    const model = await updateMobileModel(id, isRecord(body) ? body : {});

    return ok(model);
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
    const model = await deactivateMobileModel(id);

    return ok(model);
  } catch (error) {
    return handleApiError(error);
  }
}