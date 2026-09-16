export type FieldErrors = Record<string, string>;

type StringOptions = {
  label?: string;
  maxLength?: number;
  trim?: boolean;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function normalizeString(value: unknown, trim: boolean): string {
  return typeof value === "string" ? (trim ? value.trim() : value) : "";
}

export function requiredString(
  value: unknown,
  field: string,
  options: StringOptions = {},
): string | null {
  const { label = field, maxLength = 200, trim = true } = options;
  const str = normalizeString(value, trim);

  if (!str) {
    return `${label} is required.`;
  }
  if (str.length > maxLength) {
    return `${label} must be ${maxLength} characters or fewer.`;
  }
  return null;
}

export function optionalString(
  value: unknown,
  field: string,
  options: StringOptions = {},
): string | null {
  const str = normalizeString(value, options.trim ?? true);
  if (!str) {
    return null;
  }
  return requiredString(value, field, options);
}

export function validEmail(value: unknown, field: string): string | null {
  const str = typeof value === "string" ? value.trim() : "";
  if (!str) {
    return `${field} is required.`;
  }
  if (!EMAIL_PATTERN.test(str)) {
    return `${field} must be a valid email address.`;
  }
  return null;
}

export function validSlug(
  value: unknown,
  field: string,
  options: Omit<StringOptions, "trim"> = {},
): string | null {
  const { label = field, maxLength = 200 } = options;
  const str = typeof value === "string" ? value.trim() : "";

  if (!str) {
    return `${label} is required.`;
  }
  if (!SLUG_PATTERN.test(str)) {
    return `${label} must be lowercase letters, numbers, and hyphens.`;
  }
  if (str.length > maxLength) {
    return `${label} must be ${maxLength} characters or fewer.`;
  }
  return null;
}

export function collectFieldErrors(
  entries: ReadonlyArray<readonly [string, string | null]>,
): FieldErrors | null {
  const errors: FieldErrors = {};
  let hasError = false;

  for (const [field, message] of entries) {
    if (message) {
      errors[field] = message;
      hasError = true;
    }
  }
  return hasError ? errors : null;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const POSITIVE_INTEGER_PATTERN = /^\d+$/;

export function parsePositiveInteger(value: unknown): number | null {
  if (typeof value !== "string" || !POSITIVE_INTEGER_PATTERN.test(value)) {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return null;
  }
  return parsed;
}