import type { ApiResponse } from "@/types/api";

export class AdminApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    status: number,
    fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export class AdminUnauthorized extends Error {
  constructor() {
    super("Your session has expired. Please sign in again.");
    this.name = "AdminUnauthorized";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

export async function apiRequest<TData>(
  url: string,
  options: RequestOptions = {},
): Promise<TData> {
  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      "content-type": "application/json",
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (response.status === 401) {
    throw new AdminUnauthorized();
  }

  let payload: ApiResponse<TData>;
  try {
    payload = (await response.json()) as ApiResponse<TData>;
  } catch {
    throw new AdminApiError(
      "The server returned an unexpected response.",
      response.status,
    );
  }

  if (!response.ok || !payload.ok) {
    const error = "error" in payload ? payload.error : undefined;
    throw new AdminApiError(
      error?.message ?? "Request failed.",
      response.status,
      error?.fieldErrors,
    );
  }

  return "data" in payload ? payload.data : (undefined as TData);
}