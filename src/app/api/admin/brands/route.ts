import { created, handleApiError, parseJsonBody, requireAdmin } from "@/lib/api";
import { createBrand } from "@/lib/services/brand-service";
import { isRecord } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await parseJsonBody(request);
    const brand = await createBrand(isRecord(body) ? body : {});

    return created(brand);
  } catch (error) {
    return handleApiError(error);
  }
}