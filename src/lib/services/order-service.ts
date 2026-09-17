import { ObjectId } from "mongodb";
import { randomBytes } from "node:crypto";
import { getClient, getDb } from "@/lib/database";
import {
  ORDER_COLLECTION,
  type Order,
  type OrderItemSnapshot,
} from "@/lib/database/models";
import { getProduct } from "@/lib/services/product-service";
import { getModelsForProduct } from "@/lib/services/product-compatibility-service";
import { getInventoryByProduct, consumeInventoryByProduct } from "@/lib/services/inventory-service";
import { NotFoundError, ValidationError } from "@/lib/services/errors";
import {
  DELIVERY_OPTIONS,
  computeCheckoutCosts,
  normalizeCheckoutForm,
  validateCheckoutForm,
} from "@/lib/storefront/checkout";
import type { CartLineInput } from "@/lib/storefront/cart";

const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9_-]{8,80}$/;

export type CreateOrderInput = {
  idempotencyKey: unknown;
  form: Record<string, unknown>;
  lines: CartLineInput[];
};

export type CreateOrderResult = {
  order: Order;
  created: boolean;
};

function generateOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const salt = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MC-${stamp}${salt}`;
}

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  const idempotencyKey =
    typeof input.idempotencyKey === "string" ? input.idempotencyKey.trim() : "";
  if (!IDEMPOTENCY_KEY_PATTERN.test(idempotencyKey)) {
    throw new ValidationError({
      idempotencyKey:
        "idempotencyKey must be 8-80 characters using letters, numbers, underscores or dashes.",
    });
  }

  if (!Array.isArray(input.lines) || input.lines.length === 0) {
    throw new ValidationError({ cart: "Your cart is empty." });
  }

  const form = normalizeCheckoutForm(input.form);
  const fieldErrors = validateCheckoutForm(form);
  if (Object.keys(fieldErrors).length > 0) {
    throw new ValidationError(fieldErrors);
  }

  // Re-fetch every product and its inventory from the database. Nothing in the
  // request body is trusted; prices, availability and totals are recalculated
  // here so only {productId, quantity} lines flow into the order.
  const snapshots: OrderItemSnapshot[] = [];
  let subtotalCents = 0;
  let itemCount = 0;
  let currency = "USD";

  for (const line of input.lines) {
    if (!ObjectId.isValid(line.productId)) {
      throw new ValidationError({ items: "Cart contains an invalid product." });
    }
    const product = await getProduct(line.productId);
    const id = product._id.toHexString();
    if (!Number.isInteger(line.quantity) || line.quantity < 1) {
      throw new ValidationError({
        items: `"${product.name}" has an invalid quantity.`,
      });
    }
    const inventory = await getInventoryByProduct(id);
    if (inventory.quantity <= 0) {
      throw new ValidationError({
        items: `"${product.name}" is currently out of stock.`,
      });
    }
    if (line.quantity > inventory.quantity) {
      throw new ValidationError({
        items: `Only ${inventory.quantity} of "${product.name}" is available.`,
      });
    }
    const models = await getModelsForProduct(id);
    const modelNames = models
      .filter((model) => model.status === "active")
      .map((model) => model.name);

    snapshots.push({
      productId: product._id,
      productSlug: product.slug,
      productName: product.name,
      modelNames,
      quantity: line.quantity,
      unitPriceCents: product.priceCents,
      lineTotalCents: product.priceCents * line.quantity,
    });
    itemCount += line.quantity;
    subtotalCents += product.priceCents * line.quantity;
    currency = product.currency;
  }

  const costs = computeCheckoutCosts({
    itemCount,
    subtotalCents,
    currency,
  });

  const deliveryOption =
    DELIVERY_OPTIONS.find((option) => option.id === form.deliveryMethod) ??
    DELIVERY_OPTIONS[0];

  const client = await getClient();
  const db = await getDb();
  const session = client.startSession();

  try {
    let order: Order | null = null;
    let created = true;

    await session.withTransaction(async () => {
      const orders = db.collection<Order>(ORDER_COLLECTION);
      const existing = await orders.findOne({ idempotencyKey }, { session });
      if (existing) {
        order = existing;
        created = false;
        return;
      }

      const now = new Date();
      const nextOrder: Order = {
        _id: new ObjectId(),
        orderNumber: generateOrderNumber(),
        idempotencyKey,
        accessCode: randomBytes(16).toString("hex"),
        customer: {
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
        },
        shippingAddress: {
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2,
          city: form.city,
          region: form.region,
          postalCode: form.postalCode,
          country: form.country,
        },
        delivery: {
          method: deliveryOption.id,
          label: deliveryOption.label,
          estimate: deliveryOption.estimate,
        },
        items: snapshots,
        currency,
        subtotalCents,
        shippingCents: costs.shippingCents,
        totalCents: costs.totalCents,
        status: "pending",
        paymentStatus: "unpaid",
        createdAt: now,
        updatedAt: now,
      };

      for (const item of snapshots) {
        await consumeInventoryByProduct(
          item.productId.toHexString(),
          item.quantity,
          session,
        );
      }

      await orders.insertOne(nextOrder, { session });
      order = nextOrder;
    });

    if (!order) {
      throw new Error("Order could not be created.");
    }
    return { order, created };
  } finally {
    await session.endSession();
  }
}

export async function getOrderById(orderId: string): Promise<Order> {
  if (!ObjectId.isValid(orderId)) {
    throw new ValidationError({ orderId: "Invalid order id." });
  }
  const db = await getDb();
  const order = await db
    .collection<Order>(ORDER_COLLECTION)
    .findOne({ _id: new ObjectId(orderId) });
  if (!order) {
    throw new NotFoundError("Order");
  }
  return order;
}

export async function getOrderForConfirmation(
  orderId: string,
  accessCode: string,
): Promise<Order> {
  if (!ObjectId.isValid(orderId)) {
    throw new ValidationError({ orderId: "Invalid order id." });
  }
  if (typeof accessCode !== "string" || accessCode.trim().length < 16) {
    throw new ValidationError({ accessCode: "Invalid order access code." });
  }
  const db = await getDb();
  const order = await db
    .collection<Order>(ORDER_COLLECTION)
    .findOne({ _id: new ObjectId(orderId), accessCode: accessCode.trim() });
  if (!order) {
    throw new NotFoundError("Order");
  }
  return order;
}