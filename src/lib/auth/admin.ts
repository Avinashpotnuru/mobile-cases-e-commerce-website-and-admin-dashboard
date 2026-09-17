import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/database";
import { ADMIN_SESSIONS_COLLECTION } from "@/lib/database/models";
import { UnauthorizedError } from "@/lib/services/errors";
import { getAdminCredentials, verifyCredentials } from "./credentials";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_SUBJECT,
  ADMIN_SESSION_TTL_SECONDS,
  generateSessionToken,
  hashSessionToken,
  type AdminSession,
} from "./session";

export const ADMIN_SESSION_COOKIE_OPTIONS = {
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: ADMIN_SESSION_TTL_SECONDS,
};

async function sessions() {
  const db = await getDb();
  return db.collection<{
    _id: ObjectId;
    tokenHash: string;
    subject: string;
    expiresAt: Date;
    createdAt: Date;
  }>(ADMIN_SESSIONS_COLLECTION);
}

export async function createAdminSession(): Promise<{
  token: string;
  session: AdminSession;
}> {
  const token = generateSessionToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ADMIN_SESSION_TTL_SECONDS * 1000);
  await (await sessions()).insertOne({
    _id: new ObjectId(),
    tokenHash: hashSessionToken(token),
    subject: ADMIN_SESSION_SUBJECT,
    expiresAt,
    createdAt: now,
  });
  return {
    token,
    session: { subject: ADMIN_SESSION_SUBJECT, expiresAt: expiresAt.getTime() },
  };
}

async function deleteSessionToken(token: string): Promise<void> {
  await (await sessions()).deleteOne({ tokenHash: hashSessionToken(token) });
}

export async function readAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  const collection = await sessions();
  const record = await collection.findOne({ tokenHash: hashSessionToken(token) });
  if (!record) {
    return null;
  }
  if (record.expiresAt.getTime() <= Date.now()) {
    // Expired sessions are cleaned up on access.
    await collection.deleteOne({ _id: record._id });
    return null;
  }
  return { subject: record.subject, expiresAt: record.expiresAt.getTime() };
}

export async function loginAdmin(
  username: string,
  password: string,
): Promise<{ token: string; session: AdminSession }> {
  // Constant-time check; a wrong username and a wrong password are both
  // reported as an identical generic failure.
  if (!verifyCredentials(username, password)) {
    throw new UnauthorizedError("Invalid credentials.");
  }
  return createAdminSession();
}

export async function requireAdmin(): Promise<void> {
  if (!(await readAdminSession())) {
    throw new UnauthorizedError();
  }
}

export async function requireAdminPage(): Promise<void> {
  const session = await readAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
}

export async function logoutAdmin(): Promise<void> {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (token) {
    await deleteSessionToken(token);
  }
  store.delete(ADMIN_SESSION_COOKIE);
}

export function configuredAdminUsername(): string {
  return getAdminCredentials().username;
}