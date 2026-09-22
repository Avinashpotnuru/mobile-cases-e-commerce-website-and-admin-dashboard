import { handleApiError, ok } from "@/lib/api";
import { logoutCustomer } from "@/lib/auth/customer";

export async function POST(request: Request) {
  try {
    await logoutCustomer();
    return ok({ signedOut: true });
  } catch (error) {
    return handleApiError(error, { method: request.method, url: request.url });
  }
}