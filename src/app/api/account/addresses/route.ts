import { handleApiError, ok, parseJsonBody } from "@/lib/api";
import { requireCustomer } from "@/lib/auth/customer";
import {
  createAddress,
  listCustomerAddresses,
} from "@/lib/services/address-service";

export async function GET() {
  try {
    const customer = await requireCustomer();
    const addresses = await listCustomerAddresses(customer._id);
    return ok({ addresses, limit: 20 });
  } catch (error) {
    return handleApiError(error, { method: "GET", url: "/api/account/addresses" });
  }
}

export async function POST(request: Request) {
  try {
    const customer = await requireCustomer();
    const body = (await parseJsonBody(request)) as
      | (Record<string, unknown> & { makeDefault?: unknown })
      | null;
    const address = await createAddress(
      customer._id,
      body ?? {},
      body?.makeDefault === true,
    );
    return ok({ address });
  } catch (error) {
    return handleApiError(error, { method: request.method, url: request.url });
  }
}