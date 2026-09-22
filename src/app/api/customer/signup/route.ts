import { cookies } from "next/headers";
import { handleApiError, ok, parseJsonBody } from "@/lib/api";
import {
  CUSTOMER_SESSION_COOKIE,
  CUSTOMER_SESSION_COOKIE_OPTIONS,
  createCustomerSession,
} from "@/lib/auth/customer";
import {
  createCustomer,
  normalizeSignupInput,
  toPublicCustomer,
  validateSignupInput,
} from "@/lib/services/customer-service";
import { ValidationError } from "@/lib/services/errors";

export async function POST(request: Request) {
  try {
    const body = (await parseJsonBody(request)) as Record<string, unknown> | null;
    const input = normalizeSignupInput({
      email: body?.email,
      firstName: body?.firstName,
      lastName: body?.lastName,
      password: body?.password,
    });
    const fieldErrors = validateSignupInput(input);
    if (Object.keys(fieldErrors).length > 0) {
      throw new ValidationError(fieldErrors);
    }

    const customer = await createCustomer(input);
    const { token } = await createCustomerSession(customer._id);
    const store = await cookies();
    store.set(CUSTOMER_SESSION_COOKIE, token, CUSTOMER_SESSION_COOKIE_OPTIONS);

    return ok({ customer: toPublicCustomer(customer) });
  } catch (error) {
    return handleApiError(error, { method: request.method, url: request.url });
  }
}