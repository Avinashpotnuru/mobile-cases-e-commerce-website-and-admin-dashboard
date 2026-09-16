import {
  handleApiError,
  ok,
  parseJsonBody,
  requireAdmin,
} from "@/lib/api";
import { adjustStockQuantity } from "@/lib/services/inventory-service";
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

    const delta = typeof data.delta === "number" ? data.delta : NaN;

    const inventory = await adjustStockQuantity(id, delta);
    return ok(inventory);
  } catch (error) {
    return handleApiError(error);
  }
}