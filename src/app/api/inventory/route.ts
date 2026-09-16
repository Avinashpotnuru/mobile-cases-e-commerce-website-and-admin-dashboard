import { handleApiError, ok, parsePagination } from "@/lib/api";
import { listInventory } from "@/lib/services/inventory-service";

export async function GET(request: Request) {
  try {
    const pagination = parsePagination(request.url);

    const result = await listInventory({
      page: pagination.page,
      pageSize: pagination.pageSize,
    });

    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}