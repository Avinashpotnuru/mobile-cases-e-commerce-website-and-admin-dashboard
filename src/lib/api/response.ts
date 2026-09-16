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

export function handleApiError(error: unknown): NextResponse<ApiResponse<never>> {
  if (error instanceof ValidationError) {
    return validationErrorResponse(error.fieldErrors);
  }
  if (error instanceof NotFoundError) {
    return notFoundResponse(error.message);
  }
  if (error instanceof AppError) {
    return errorResponse(
      { code: error.code, message: error.message },
      { status: error.status },
    );
  }

  console.error("Unhandled API error:", error);
  return serverErrorResponse();
}