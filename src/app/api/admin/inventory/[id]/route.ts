import {
  handleApiError,
  ok,
  parseJsonBody,
  requireAdmin,
} from "@/lib/api";
import {
  deactivateInventory,
  updateInventory,
} from "@/lib/services/inventory-service";
import { isRecord } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await parseJsonBody(request);
    const inventory = await updateInventory(id, isRecord(body) ? body : {});

    return ok(inventory);
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
    const inventory = await deactivateInventory(id);

    return ok(inventory);
  } catch (error) {
    return handleApiError(error);
  }
}