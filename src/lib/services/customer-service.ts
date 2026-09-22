import { ObjectId } from "mongodb";
import { getDb } from "@/lib/database";
import { CUSTOMER_COLLECTION, type Customer } from "@/lib/database/models";
import { hashPassword } from "@/lib/auth/password";
import { ValidationError } from "@/lib/services/errors";

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export type CustomerPublic = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export function toPublicCustomer(customer: Customer): CustomerPublic {
  return {
    id: customer._id.toHexString(),
    email: customer.email,
    firstName: customer.firstName,
    lastName: customer.lastName,
  };
}

async function customers() {
  const db = await getDb();
  return db.collection<Customer>(CUSTOMER_COLLECTION);
}

export async function getCustomerById(customerId: ObjectId | string): Promise<Customer | null> {
  const id = typeof customerId === "string" ? new ObjectId(customerId) : customerId;
  return (await customers()).findOne({ _id: id });
}

export async function findCustomerByEmail(email: string): Promise<Customer | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  return (await customers()).findOne({ email: normalized });
}

export type CreateCustomerInput = {
  email: unknown;
  firstName: unknown;
  lastName: unknown;
  password: unknown;
};

export function normalizeSignupInput(input: CreateCustomerInput): {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
} {
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const firstName = typeof input.firstName === "string" ? input.firstName.trim() : "";
  const lastName = typeof input.lastName === "string" ? input.lastName.trim() : "";
  const password = typeof input.password === "string" ? input.password : "";
  return { email, firstName, lastName, password };
}

export function validateSignupInput(input: {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!EMAIL_PATTERN.test(input.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (input.firstName.length < 1) {
    errors.firstName = "First name is required.";
  }
  if (input.lastName.length < 1) {
    errors.lastName = "Last name is required.";
  }
  if (input.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (input.password.length > PASSWORD_MAX_LENGTH) {
    errors.password = `Password must be at most ${PASSWORD_MAX_LENGTH} characters.`;
  }
  return errors;
}

export function validateShippingFields(input: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};
  const required = [
    "firstName",
    "lastName",
    "phone",
    "addressLine1",
    "city",
    "region",
    "postalCode",
    "country",
  ] as const;
  for (const key of required) {
    if (!input[key]?.trim()) {
      errors[key] = `${key === "lastName" ? "Last name" : key === "firstName" ? "First name" : key === "addressLine1" ? "Address" : key === "postalCode" ? "Postal code" : key.charAt(0).toUpperCase() + key.slice(1)} is required.`;
    }
  }
  return errors;
}

export async function createCustomer(input: {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}): Promise<Customer> {
  const now = new Date();
  const doc: Customer = {
    _id: new ObjectId(),
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    passwordHash: await hashPassword(input.password),
    createdAt: now,
    updatedAt: now,
  };
  try {
    await (await customers()).insertOne(doc);
  } catch (error) {
    const code = (error as { code?: number }).code;
    if (code === 11000) {
      throw new ValidationError({
        email: "An account with this email already exists.",
      });
    }
    throw error;
  }
  return doc;
}