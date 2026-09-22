import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

const SCRYPT_KEYLEN = 64;

function encode(buffer: Buffer): string {
  return buffer.toString("base64");
}

function decode(value: string): Buffer {
  return Buffer.from(value, "base64");
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scrypt(password, salt, SCRYPT_KEYLEN)) as Buffer;
  return `$scrypt$${encode(salt)}$${encode(derived)}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [algorithm, saltRaw, hashRaw] = stored.split("$").slice(1);
  if (algorithm !== "scrypt" || !saltRaw || !hashRaw) {
    return false;
  }
  const salt = decode(saltRaw);
  const expected = decode(hashRaw);
  const derived = (await scrypt(password, salt, expected.length)) as Buffer;
  return (
    expected.length === derived.length && timingSafeEqual(expected, derived)
  );
}