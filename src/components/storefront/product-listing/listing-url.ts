export function buildListingUrl(
  base: Record<string, string>,
  overrides: Record<string, string | null>,
): string {
  const merged: Record<string, string> = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    if (value === null) {
      delete merged[key];
    } else {
      merged[key] = value;
    }
  }
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    search.set(key, value);
  }
  return `/products?${search.toString()}`;
}