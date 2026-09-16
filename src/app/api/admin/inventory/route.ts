import {
  created,
  handleApiError,
  parseJsonBody,
  requireAdmin,
} from "@/lib/api";
import { createInventory } from "@/lib/services/inventory-service";
import { isRecord } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await parseJsonBody(request);
    const inventory = await createInventory(isRecord(body) ? body : {});

    return created(inventory);
  } catch (error) {
    return handleApiError(error);
  }
}