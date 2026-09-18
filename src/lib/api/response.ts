import { NextResponse } from "next/server";
import type {
  ApiErrorPayload,
  ApiResponse,
} from "@/types/api";
import {
  AppError,
  NotFoundError,
  ValidationError,
} from "@/lib/services/errors";
import { logError, logWarn, type LogContext } from "@/lib/server/log";

export function ok<TData>(
  data: TData,
  init?: ResponseInit,
): NextResponse<ApiResponse<TData>> {
  return NextResponse.json(
    { ok: true, data } satisfies ApiResponse<TData>,
    init,
  );
}

export function created<TData>(
  data: TData,
  init?: ResponseInit,
): NextResponse<ApiResponse<TData>> {
  return NextResponse.json(
    { ok: true, data } satisfies ApiResponse<TData>,
    { status: 201, ...init },
  );
}

export function errorResponse(
  error: ApiErrorPayload,
  init?: ResponseInit,
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    { ok: false, error } satisfies ApiResponse<never>,
    init,
  );
}

export function validationErrorResponse(
  fieldErrors: Record<string, string>,
  init?: ResponseInit,
): NextResponse<ApiResponse<never>> {
  return errorResponse(
    { code: "VALIDATION_ERROR", message: "Invalid input.", fieldErrors },
    { status: 400, ...init },
  );
}

export function notFoundResponse(
  message = "Resource not found.",
  init?: ResponseInit,
): NextResponse<ApiResponse<never>> {
  return errorResponse(
    { code: "NOT_FOUND", message },
    { status: 404, ...init },
  );
}

export function serverErrorResponse(
  message = "An unexpected error occurred.",
  init?: ResponseInit,
): NextResponse<ApiResponse<never>> {
  return errorResponse(
    { code: "INTERNAL_ERROR", message },
    { status: 500, ...init },
  );
}

export function handleApiError(
  error: unknown,
  context: LogContext = {},
): NextResponse<ApiResponse<never>> {
  if (error instanceof ValidationError) {
    return validationErrorResponse(error.fieldErrors);
  }
  if (error instanceof NotFoundError) {
    return notFoundResponse(error.message);
  }
  if (error instanceof AppError) {
    // Expected application failures are safe to show, but 5xx-grade ones
    // (e.g. payment provider trouble) are worth surfacing server-side.
    if (error.status >= 500) {
      logWarn(`${error.name} returned to client`, {
        ...context,
        code: error.code,
        message: error.message,
      });
    }
    return errorResponse(
      { code: error.code, message: error.message },
      { status: error.status },
    );
  }

  logError("Unhandled API error", {
    ...context,
    errorName: error instanceof Error ? error.name : typeof error,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
  return serverErrorResponse();
}