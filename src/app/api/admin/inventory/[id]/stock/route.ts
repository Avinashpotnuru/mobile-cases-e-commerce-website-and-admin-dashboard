import {
  handleApiError,
  ok,
  parseJsonBody,
  requireAdmin,
} from "@/lib/api";
import { setStockQuantity } from "@/lib/services/inventory-service";
import { isRecord } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await parseJsonBody(request);
    const data = isRecord(body) ? body : {};

    const quantity =
      typeof data.quantity === "number" ? data.quantity : NaN;

    const inventory = await setStockQuantity(id, quantity);
    return ok(inventory);
  } catch (error) {
    return handleApiError(error);
  }
}