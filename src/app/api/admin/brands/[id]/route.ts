import {
  handleApiError,
  ok,
  parseJsonBody,
  requireAdmin,
} from "@/lib/api";
import {
  deactivateBrand,
  updateBrand,
} from "@/lib/services/brand-service";
import { isRecord } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await parseJsonBody(request);
    const brand = await updateBrand(id, isRecord(body) ? body : {});

    return ok(brand);
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
    const brand = await deactivateBrand(id);

    return ok(brand);
  } catch (error) {
    return handleApiError(error);
  }
}