import { ValidationError } from "@/lib/services/errors";
import { collectFieldErrors, parsePositiveInteger } from "@/lib/validation";

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export type ParsedPagination = {
  page: number;
  pageSize: number;
};

export function parsePagination(url: string): ParsedPagination {
  const { searchParams } = new URL(url);

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

  return {
    page: page ?? DEFAULT_PAGE,
    pageSize: Math.min(pageSize ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
  };
}