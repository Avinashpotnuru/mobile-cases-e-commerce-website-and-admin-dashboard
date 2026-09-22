import { handleApiError, ok, parseJsonBody } from "@/lib/api";
import { requireCustomer } from "@/lib/auth/customer";
import {
  deleteAddress,
  setDefaultAddress,
  updateAddress,
} from "@/lib/services/address-service";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const customer = await requireCustomer();
    const { id } = await params;
    const body = (await parseJsonBody(request)) as
      | (Record<string, unknown> & { makeDefault?: unknown })
      | null;
    const address = await updateAddress(
      customer._id,
      id,
      body ?? {},
      body?.makeDefault === true,
    );
    return ok({ address });
  } catch (error) {
    return handleApiError(error, { method: request.method, url: request.url });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const customer = await requireCustomer();
    const { id } = await params;
    await deleteAddress(customer._id, id);
    return ok({ deleted: true });
  } catch (error) {
    return handleApiError(error, { method: request.method, url: request.url });
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const customer = await requireCustomer();
    const { id } = await params;
    await setDefaultAddress(customer._id, id);
    return ok({ updated: true });
  } catch (error) {
    return handleApiError(error, { method: request.method, url: request.url });
  }
}