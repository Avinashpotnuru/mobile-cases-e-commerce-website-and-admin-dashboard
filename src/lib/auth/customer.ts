import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/database";
import {
  CUSTOMER_SESSIONS_COLLECTION,
  type Customer,
} from "@/lib/database/models";
import { findCustomerByEmail, getCustomerById } from "@/lib/services/customer-service";
import { UnauthorizedError } from "@/lib/services/errors";
import {
  generateSessionToken,
  hashSessionToken,
} from "./session";
import { verifyPassword } from "./password";

export const CUSTOMER_SESSION_COOKIE = "customer_session";
export const CUSTOMER_SESSION_TTL_SECONDS = Number(
  process.env.CUSTOMER_SESSION_TTL_SECONDS ?? 2592000,
);

export type CustomerSession = {
  customerId: string;
  expiresAt: number;
};

export const CUSTOMER_SESSION_COOKIE_OPTIONS = {
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: CUSTOMER_SESSION_TTL_SECONDS,
};

async function sessions() {
  const db = await getDb();
  return db.collection<{
    _id: ObjectId;
    customerId: ObjectId;
    tokenHash: string;
    expiresAt: Date;
    createdAt: Date;
  }>(CUSTOMER_SESSIONS_COLLECTION);
}

async function deleteToken(token: string): Promise<void> {
  await (await sessions()).deleteOne({ tokenHash: hashSessionToken(token) });
}

export async function createCustomerSession(
  customerId: ObjectId,
): Promise<{ token: string; session: CustomerSession }> {
  const token = generateSessionToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CUSTOMER_SESSION_TTL_SECONDS * 1000);
  await (await sessions()).insertOne({
    _id: new ObjectId(),
    customerId,
    tokenHash: hashSessionToken(token),
    expiresAt,
    createdAt: now,
  });
  return {
    token,
    session: { customerId: customerId.toHexString(), expiresAt: expiresAt.getTime() },
  };
}

export async function readCustomerSession(): Promise<CustomerSession | null> {
  const store = await cookies();
  const token = store.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  const record = await (await sessions()).findOne({
    tokenHash: hashSessionToken(token),
  });
  if (!record) {
    return null;
  }
  if (record.expiresAt.getTime() <= Date.now()) {
    await (await sessions()).deleteOne({ _id: record._id });
    return null;
  }
  return {
    customerId: record.customerId.toHexString(),
    expiresAt: record.expiresAt.getTime(),
  };
}

export async function loginCustomer(
  email: string,
  password: string,
): Promise<{ token: string; session: CustomerSession; customer: Customer }> {
  const customer = await findCustomerByEmail(email);
  if (!customer || !(await verifyPassword(password, customer.passwordHash))) {
    throw new UnauthorizedError("Invalid email or password.");
  }
  const { token, session } = await createCustomerSession(customer._id);
  return { token, session, customer };
}

export async function getCurrentCustomer(): Promise<Customer | null> {
  const session = await readCustomerSession();
  if (!session) return null;
  const customer = await getCustomerById(session.customerId);
  if (!customer) return null;
  return customer;
}

export async function requireCustomer(): Promise<Customer> {
  const session = await readCustomerSession();
  if (!session) throw new UnauthorizedError();
  const customer = await getCurrentCustomer();
  if (!customer) throw new UnauthorizedError();
  return customer;
}

export async function requireCustomerPage(): Promise<Customer> {
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect("/account/signin");
  }
  return customer;
}

export async function logoutCustomer(): Promise<void> {
  const store = await cookies();
  const token = store.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (token) {
    await deleteToken(token);
  }
  store.delete(CUSTOMER_SESSION_COOKIE);
}