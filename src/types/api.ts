export type ApiErrorPayload = {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
};

export type ApiResponse<TData = undefined> =
  | { ok: true; data: TData }
  | { ok: false; error: ApiErrorPayload };