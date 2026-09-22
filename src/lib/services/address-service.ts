import { ObjectId } from "mongodb";
import { getDb } from "@/lib/database";
import {
  CUSTOMER_ADDRESSES_COLLECTION,
  type CustomerAddress,
} from "@/lib/database/models";
import { ValidationError } from "@/lib/services/errors";
import { COUNTRY_OPTIONS } from "@/lib/storefront/checkout";

const MAX_ADDRESSES = 20;

const PHONE_PATTERN = /^\+?[0-9\s().-]{7,20}$/;
const POSTAL_CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\s-]{2,9}$/;
const ALLOWED_COUNTRY_CODES = new Set(COUNTRY_OPTIONS.map((c) => c.code));

export type AddressPublic = {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  updatedAt: Date;
};

type AddressForm = {
  label: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
};

function normalize(input: Record<string, unknown>): AddressForm {
  const text = (value: unknown): string =>
    typeof value === "string" ? value.trim() : "";
  return {
    label: text(input.label).slice(0, 40),
    firstName: text(input.firstName),
    lastName: text(input.lastName),
    phone: text(input.phone),
    addressLine1: text(input.addressLine1),
    addressLine2: text(input.addressLine2),
    city: text(input.city),
    region: text(input.region),
    postalCode: text(input.postalCode),
    country: text(input.country),
  };
}

function validate(form: AddressForm): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.firstName) {
    errors.firstName = "First name is required.";
  }
  if (!form.lastName) {
    errors.lastName = "Last name is required.";
  }
  if (!form.phone) {
    errors.phone = "Phone number is required.";
  } else if (!PHONE_PATTERN.test(form.phone)) {
    errors.phone = "Enter a valid phone number.";
  }
  if (!form.addressLine1) {
    errors.addressLine1 = "Street address is required.";
  }
  if (!form.city) {
    errors.city = "City is required.";
  }
  if (!form.region) {
    errors.region = "State or region is required.";
  }
  if (!form.postalCode) {
    errors.postalCode = "Postal code is required.";
  } else if (!POSTAL_CODE_PATTERN.test(form.postalCode)) {
    errors.postalCode = "Enter a valid postal code.";
  }
  if (!ALLOWED_COUNTRY_CODES.has(form.country)) {
    errors.country = "Select a country.";
  }
  return errors;
}

export async function listCustomerAddresses(
  customerId: ObjectId,
): Promise<AddressPublic[]> {
  const db = await getDb();
  const addresses = await db
    .collection<CustomerAddress>(CUSTOMER_ADDRESSES_COLLECTION)
    .find({ customerId })
    .sort({ isDefault: -1, updatedAt: -1 })
    .limit(MAX_ADDRESSES)
    .toArray();
  return addresses.map(toPublicAddress);
}

export async function createAddress(
  customerId: ObjectId,
  input: Record<string, unknown>,
  makeDefault = false,
): Promise<AddressPublic> {
  const form = normalize(input);
  const fieldErrors = validate(form);
  if (Object.keys(fieldErrors).length > 0) {
    throw new ValidationError(fieldErrors);
  }

  const db = await getDb();
  const collection = db.collection<CustomerAddress>(CUSTOMER_ADDRESSES_COLLECTION);
  const existing = await collection.countDocuments({ customerId });
  if (existing >= MAX_ADDRESSES) {
    throw new ValidationError({
      label: `You can save up to ${MAX_ADDRESSES} addresses.`,
    });
  }

  const isDefault = makeDefault || existing === 0;
  const now = new Date();
  const address: CustomerAddress = {
    _id: new ObjectId(),
    customerId,
    label: form.label,
    firstName: form.firstName,
    lastName: form.lastName,
    phone: form.phone,
    addressLine1: form.addressLine1,
    addressLine2: form.addressLine2,
    city: form.city,
    region: form.region,
    postalCode: form.postalCode,
    country: form.country,
    isDefault,
    createdAt: now,
    updatedAt: now,
  };
  await collection.insertOne(address);

  if (isDefault) {
    await db
      .collection<CustomerAddress>(CUSTOMER_ADDRESSES_COLLECTION)
      .updateMany(
        { customerId, _id: { $ne: address._id } },
        { $set: { isDefault: false, updatedAt: now } },
      );
  }

  return toPublicAddress(address);
}

export async function updateAddress(
  customerId: ObjectId,
  addressId: string,
  input: Record<string, unknown>,
  makeDefault = false,
): Promise<AddressPublic> {
  if (!ObjectId.isValid(addressId)) {
    throw new ValidationError({ id: "Invalid address id." });
  }
  const form = normalize(input);
  const fieldErrors = validate(form);
  if (Object.keys(fieldErrors).length > 0) {
    throw new ValidationError(fieldErrors);
  }

  const db = await getDb();
  const collection = db.collection<CustomerAddress>(CUSTOMER_ADDRESSES_COLLECTION);
  const now = new Date();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(addressId), customerId },
    {
      $set: {
        label: form.label,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        city: form.city,
        region: form.region,
        postalCode: form.postalCode,
        country: form.country,
        isDefault: makeDefault,
        updatedAt: now,
      },
    },
    { returnDocument: "after", includeResultMetadata: false },
  );
  if (!result) {
    throw new ValidationError({ id: "Address not found." });
  }

  if (makeDefault) {
    await db
      .collection<CustomerAddress>(CUSTOMER_ADDRESSES_COLLECTION)
      .updateMany(
        { customerId, _id: { $ne: result._id } },
        { $set: { isDefault: false, updatedAt: now } },
      );
  }

  return toPublicAddress(result);
}

export async function deleteAddress(
  customerId: ObjectId,
  addressId: string,
): Promise<void> {
  if (!ObjectId.isValid(addressId)) {
    throw new ValidationError({ id: "Invalid address id." });
  }
  const db = await getDb();
  const collection = db.collection<CustomerAddress>(CUSTOMER_ADDRESSES_COLLECTION);
  const deleted = await collection.findOneAndDelete({
    _id: new ObjectId(addressId),
    customerId,
  });
  if (!deleted) {
    throw new ValidationError({ id: "Address not found." });
  }

  if (deleted.isDefault) {
    const next = await collection
      .find({ customerId })
      .sort({ updatedAt: -1 })
      .limit(1)
      .next();
    if (next) {
      const now = new Date();
      await collection.updateOne(
        { _id: next._id },
        { $set: { isDefault: true, updatedAt: now } },
      );
    }
  }
}

export async function setDefaultAddress(
  customerId: ObjectId,
  addressId: string,
): Promise<void> {
  if (!ObjectId.isValid(addressId)) {
    throw new ValidationError({ id: "Invalid address id." });
  }
  const db = await getDb();
  const collection = db.collection<CustomerAddress>(CUSTOMER_ADDRESSES_COLLECTION);
  const now = new Date();
  const result = await collection.updateOne(
    { _id: new ObjectId(addressId), customerId },
    { $set: { isDefault: true, updatedAt: now } },
  );
  if (result.matchedCount === 0) {
    throw new ValidationError({ id: "Address not found." });
  }
  await db
    .collection<CustomerAddress>(CUSTOMER_ADDRESSES_COLLECTION)
    .updateMany(
      { customerId, _id: { $ne: new ObjectId(addressId) } },
      { $set: { isDefault: false, updatedAt: now } },
    );
}

function toPublicAddress(address: CustomerAddress): AddressPublic {
  return {
    id: address._id.toHexString(),
    label: address.label,
    firstName: address.firstName,
    lastName: address.lastName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
    city: address.city,
    region: address.region,
    postalCode: address.postalCode,
    country: address.country,
    isDefault: address.isDefault,
    updatedAt: address.updatedAt,
  };
}