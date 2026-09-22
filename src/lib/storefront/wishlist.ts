export const WISHLIST_KEY = "wishlist";
export const WISHLIST_CHANGE_EVENT = "wishlist:change";
export const MAX_WISHLIST_ITEMS = 100;

function parseWishlist(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen: string[] = [];
    for (const id of parsed) {
      if (typeof id !== "string" || !id) continue;
      if (seen.includes(id)) continue;
      seen.push(id);
      if (seen.length >= MAX_WISHLIST_ITEMS) break;
    }
    return seen;
  } catch {
    return [];
  }
}

function store(): string[] {
  if (typeof window === "undefined") return [];
  return parseWishlist(window.localStorage.getItem(WISHLIST_KEY));
}

function persist(ids: string[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(WISHLIST_CHANGE_EVENT));
}

export function readWishlist(): string[] {
  return store();
}

export function countWishlist(): number {
  return store().length;
}

export function isWishlisted(productId: string): boolean {
  return store().includes(productId);
}

export function toggleWishlist(productId: string): boolean {
  const ids = store();
  const exists = ids.includes(productId);
  const next = exists
    ? ids.filter((id) => id !== productId)
    : [...ids, productId].slice(0, MAX_WISHLIST_ITEMS);
  persist(next);
  return !exists;
}