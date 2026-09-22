import { handleApiError, ok } from "@/lib/api";
import { getCurrentCustomer } from "@/lib/auth/customer";
import { toPublicCustomer } from "@/lib/services/customer-service";

export async function GET(request: Request) {
  try {
    const customer = await getCurrentCustomer();
    return ok({ customer: customer ? toPublicCustomer(customer) : null });
  } catch (error) {
    return handleApiError(error, { method: request.method, url: request.url });
  }
}