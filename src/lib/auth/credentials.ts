import {
  scryptSync,
  timingSafeEqual,
  randomBytes,
} from "node:crypto";

const SCRYPT_KEYLEN = 64;
const DEFAULT_N = 16384;
const DEFAULT_R = 8;
const DEFAULT_P = 1;

export class AuthConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthConfigurationError";
  }
}

export type AdminCredentials = {
  username: string;
  passwordHash: string;
};

export type ScryptHash = {
  n: number;
  r: number;
  p: number;
  salt: Buffer;
  hash: Buffer;
};

export function getAdminCredentials(): AdminCredentials {
  const username = process.env.ADMIN_USERNAME ?? "";
  const passwordHash = process.env.ADMIN_PASSWORD_HASH ?? "";
  if (!username || !passwordHash) {
    throw new AuthConfigurationError(
      "Admin authentication is not configured (ADMIN_USERNAME / ADMIN_PASSWORD_HASH).",
    );
  }
  return { username, passwordHash };
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN, {
    N: DEFAULT_N,
    r: DEFAULT_R,
    p: DEFAULT_P,
  });
  return [
    "scrypt",
    DEFAULT_N,
    DEFAULT_R,
    DEFAULT_P,
    salt.toString("hex"),
    hash.toString("hex"),
  ].join(":");
}

export function parsePasswordHash(value: string): ScryptHash {
  const [scheme, n, r, p, saltHex, hashHex] = value.split(":");
  if (
    scheme !== "scrypt" ||
    !n ||
    !r ||
    !p ||
    !saltHex ||
    !hashHex
  ) {
    throw new AuthConfigurationError("ADMIN_PASSWORD_HASH is malformed.");
  }
  return {
    n: Number(n),
    r: Number(r),
    p: Number(p),
    salt: Buffer.from(saltHex, "hex"),
    hash: Buffer.from(hashHex, "hex"),
  };
}

function safeEqualHex(expected: string, actual: string): boolean {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(actual, "utf8");
  if (a.length === 0) {
    return false;
  }
  return a.length === b.length && timingSafeEqual(a, b);
}

export function verifyPassword(password: string, hash: string): boolean {
  if (typeof password !== "string" || password.length === 0) {
    // Still run a verification to keep compare timing uniform.
    try {
      const parsed = parsePasswordHash(hash);
      scryptSync("\u0000", parsed.salt, parsed.hash.length, {
        N: parsed.n,
        r: parsed.r,
        p: parsed.p,
      });
    } catch {
      // Neither branch reveals whether the username or password was wrong.
    }
    return false;
  }
  const parsed = parsePasswordHash(hash);
  const derived = scryptSync(password, parsed.salt, parsed.hash.length, {
    N: parsed.n,
    r: parsed.r,
    p: parsed.p,
  });
  return derived.length === parsed.hash.length && timingSafeEqual(derived, parsed.hash);
}

export function verifyCredentials(username: string, password: string): boolean {
  const credentials = getAdminCredentials();
  const userMatches = safeEqualHex(credentials.username, username);
  const passMatches = verifyPassword(password, credentials.passwordHash);
  return userMatches && passMatches;
}