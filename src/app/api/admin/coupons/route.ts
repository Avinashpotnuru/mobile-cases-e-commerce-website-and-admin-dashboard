import {
  created,
  handleApiError,
  ok,
  parseJsonBody,
  parsePagination,
  requireAdmin,
} from "@/lib/api";
import {
  createCoupon,
  listCoupons,
} from "@/lib/services/coupon-service";
import type { CouponStatus } from "@/lib/database/models";

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || undefined;
    const includeInactive = searchParams.get("includeInactive") === "true";
    const statusParam = searchParams.get("status");
    const status: CouponStatus | undefined =
      statusParam === "active" || statusParam === "inactive"
        ? statusParam
        : undefined;
    const result = await listCoupons({
      ...parsePagination(request.url),
      search,
      includeInactive,
      status,
    });

    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await parseJsonBody(request);
    const coupon = await createCoupon(body);

    return created(coupon);
  } catch (error) {
    return handleApiError(error);
  }
}