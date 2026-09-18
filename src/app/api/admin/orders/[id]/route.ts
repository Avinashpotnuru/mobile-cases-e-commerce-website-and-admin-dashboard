import { handleApiError, ok, parseJsonBody, requireAdmin } from "@/lib/api";
import {
  getAdminOrder,
  updateOrderStatus,
} from "@/lib/services/order-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const order = await getAdminOrder(id);

    return ok(order);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = (await parseJsonBody(request)) as Record<string, unknown> | null;
    const order = await updateOrderStatus(id, body?.status);

    return ok(order);
  } catch (error) {
    return handleApiError(error);
  }
}