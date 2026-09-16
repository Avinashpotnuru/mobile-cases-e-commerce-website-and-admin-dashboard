import { handleApiError, ok } from "@/lib/api";
import { listBrands } from "@/lib/services/brand-service";
import { ValidationError } from "@/lib/services/errors";
import { collectFieldErrors, parsePositiveInteger } from "@/lib/validation";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parsePositiveInteger(
      searchParams.get("page") ?? String(DEFAULT_PAGE),
    );
    const pageSize = parsePositiveInteger(
      searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE),
    );

    const fieldErrors = collectFieldErrors([
      ["page", page === null ? "page must be a positive integer." : null],
      [
        "pageSize",
        pageSize === null ? "pageSize must be a positive integer." : null,
      ],
    ]);

    if (fieldErrors) {
      throw new ValidationError(fieldErrors);
    }

    const result = await listBrands({
      page: page ?? DEFAULT_PAGE,
      pageSize: Math.min(pageSize ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
    });

    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}