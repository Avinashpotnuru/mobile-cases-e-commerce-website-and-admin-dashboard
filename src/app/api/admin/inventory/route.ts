import {
  created,
  handleApiError,
  ok,
  parseJsonBody,
  parsePagination,
  requireAdmin,
} from "@/lib/api";
import {
  createInventory,
  listAdminInventory,
} from "@/lib/services/inventory-service";
import type { InventoryStatus } from "@/lib/database/models";
import { isRecord } from "@/lib/validation";
import { ValidationError } from "@/lib/services/errors";
import { ObjectId } from "mongodb";

function parseObjectIdParam(
  value: string | null,
  field: string,
): ObjectId | undefined {
  if (!value) {
    return undefined;
  }
  if (!ObjectId.isValid(value)) {
    throw new ValidationError({ [field]: `${field} must be a valid id.` });
  }
  return new ObjectId(value);
}

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || undefined;
    const statusParam = searchParams.get("status");
    const status: InventoryStatus | undefined =
      statusParam === "active" || statusParam === "archived"
        ? statusParam
        : undefined;
    const includeArchived = searchParams.get("includeArchived") === "true";
    const productId = parseObjectIdParam(
      searchParams.get("productId"),
      "productId",
    );
    const mobileModelId = parseObjectIdParam(
      searchParams.get("mobileModelId"),
      "mobileModelId",
    );

    const result = await listAdminInventory({
      ...parsePagination(request.url),
      q,
      status,
      includeArchived,
      productId,
      mobileModelId,
    });

    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}

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