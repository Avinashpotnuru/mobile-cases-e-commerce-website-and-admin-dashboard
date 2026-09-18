import {
  handleApiError,
  ok,
  parsePagination,
  requireAdmin,
} from "@/lib/api";
import { listOrders } from "@/lib/services/order-service";
import { ValidationError } from "@/lib/services/errors";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/database/models";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseDateParam(
  value: string | null,
  field: string,
): Date | undefined {
  if (!value) {
    return undefined;
  }
  if (!DATE_PATTERN.test(value)) {
    throw new ValidationError({
      [field]: `${field} must use the YYYY-MM-DD format.`,
    });
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    throw new ValidationError({ [field]: `${field} must be a valid date.` });
  }
  return parsed;
}

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || undefined;

    const statusParam = searchParams.get("status");
    const status: OrderStatus | undefined = ORDER_STATUSES.includes(
      statusParam as OrderStatus,
    )
      ? (statusParam as OrderStatus)
      : undefined;

    const paymentStatusParam = searchParams.get("paymentStatus");
    const paymentStatus: PaymentStatus | undefined =
      PAYMENT_STATUSES.includes(paymentStatusParam as PaymentStatus)
        ? (paymentStatusParam as PaymentStatus)
        : undefined;

    const dateFrom = parseDateParam(searchParams.get("dateFrom"), "dateFrom");
    const dateTo = parseDateParam(searchParams.get("dateTo"), "dateTo");
    if (dateFrom && dateTo && dateFrom.getTime() > dateTo.getTime()) {
      throw new ValidationError({
        dateTo: "dateTo must be on or after dateFrom.",
      });
    }

    const result = await listOrders({
      ...parsePagination(request.url),
      q,
      status,
      paymentStatus,
      dateFrom,
      dateTo,
    });

    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}