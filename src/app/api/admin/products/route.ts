import { ObjectId } from "mongodb";
import {
  created,
  handleApiError,
  ok,
  parseJsonBody,
  parsePagination,
  requireAdmin,
} from "@/lib/api";
import {
  createProduct,
  listProducts,
  type ProductListingSort,
} from "@/lib/services/product-service";
import { ValidationError } from "@/lib/services/errors";
import { isRecord } from "@/lib/validation";
import type { ProductStatus } from "@/lib/database/models";

const PRODUCT_STATUSES: ProductStatus[] = ["active", "draft", "archived"];
const PRODUCT_SORTS: ProductListingSort[] = [
  "name_asc",
  "newest",
  "price_asc",
  "price_desc",
];

function parseObjectIdParam(
  value: string,
  field: string,
): ObjectId | undefined {
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
    const includeArchived = searchParams.get("includeArchived") === "true";

    const statusParam = searchParams.get("status");
    const status: ProductStatus | undefined = PRODUCT_STATUSES.includes(
      statusParam as ProductStatus,
    )
      ? (statusParam as ProductStatus)
      : undefined;

    const sortParam = searchParams.get("sort");
    const sort: ProductListingSort | undefined = PRODUCT_SORTS.includes(
      sortParam as ProductListingSort,
    )
      ? (sortParam as ProductListingSort)
      : undefined;

    const brandIdParam = searchParams.get("brandId");
    const mobileModelIdParam = searchParams.get("mobileModelId");

    const result = await listProducts({
      ...parsePagination(request.url),
      q,
      includeArchived,
      status,
      sort,
      brandId: brandIdParam
        ? parseObjectIdParam(brandIdParam, "brandId")
        : undefined,
      mobileModelId: mobileModelIdParam
        ? parseObjectIdParam(mobileModelIdParam, "mobileModelId")
        : undefined,
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
    const product = await createProduct(isRecord(body) ? body : {});

    return created(product);
  } catch (error) {
    return handleApiError(error);
  }
}