import { cookies } from "next/headers";
import { handleApiError, ok, parseJsonBody } from "@/lib/api";
import {
  CUSTOMER_SESSION_COOKIE,
  CUSTOMER_SESSION_COOKIE_OPTIONS,
  loginCustomer,
} from "@/lib/auth/customer";
import { toPublicCustomer } from "@/lib/services/customer-service";

export async function POST(request: Request) {
  try {
    const body = (await parseJsonBody(request)) as Record<string, unknown> | null;
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    const { token, customer } = await loginCustomer(email, password);
    const store = await cookies();
    store.set(CUSTOMER_SESSION_COOKIE, token, CUSTOMER_SESSION_COOKIE_OPTIONS);

    return ok({ customer: toPublicCustomer(customer) });
  } catch (error) {
    return handleApiError(error, { method: request.method, url: request.url });
  }
}