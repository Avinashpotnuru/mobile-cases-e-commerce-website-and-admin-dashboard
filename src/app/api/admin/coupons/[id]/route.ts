import {
  handleApiError,
  ok,
  parseJsonBody,
  requireAdmin,
} from "@/lib/api";
import {
  deactivateCoupon,
  updateCoupon,
} from "@/lib/services/coupon-service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await parseJsonBody(request);
    const coupon = await updateCoupon(id, body);

    return ok(coupon);
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
    const coupon = await deactivateCoupon(id);

    return ok(coupon);
  } catch (error) {
    return handleApiError(error);
  }
}