import { createHash, randomBytes } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_TTL_SECONDS = Number(
  process.env.ADMIN_SESSION_TTL_SECONDS ?? 28800,
);

export type AdminSession = {
  subject: string;
  expiresAt: number;
};

export const ADMIN_SESSION_SUBJECT = "admin";

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

// Sessions are stored hashed so a database leak never exposes usable tokens.
export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}