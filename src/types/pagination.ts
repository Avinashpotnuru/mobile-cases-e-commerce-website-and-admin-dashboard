export type PaginationParams = {
  page: number;
  pageSize: number;
};

export type PaginatedResult<T> = PaginationParams & {
  items: T[];
  total: number;
  totalPages: number;
};