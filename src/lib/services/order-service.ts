import { ObjectId, type Filter } from "mongodb";
import { randomBytes } from "node:crypto";
import { getClient, getDb } from "@/lib/database";
import {
  COUPON_COLLECTION,
  ORDER_COLLECTION,
  ORDER_STATUSES,
  type Coupon,
  type Order,
  type OrderCustomerInfo,
  type OrderItemSnapshot,
  type OrderStatus,
} from "@/lib/database/models";
import { getProduct } from "@/lib/services/product-service";
import { getModelsForProduct } from "@/lib/services/product-compatibility-service";
import { getInventoryByProduct, consumeInventoryByProduct } from "@/lib/services/inventory-service";
import { CouponValidationError, NotFoundError, ValidationError } from "@/lib/services/errors";
import { validateCoupon } from "@/lib/services/coupon-service";
import type { PaginatedResult } from "@/types/pagination";
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
  customerId?: ObjectId;
  couponCode?: string;
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
  let currency = "INR";

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

  const deliveryOption =
    DELIVERY_OPTIONS.find((option) => option.id === form.deliveryMethod) ??
    DELIVERY_OPTIONS[0];

  const couponCode =
    typeof input.couponCode === "string"
      ? input.couponCode.trim().toUpperCase()
      : "";
  const normalizedCoupon = couponCode || undefined;

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

      let appliedCouponCode: string | undefined;
      let discountCents = 0;
      if (normalizedCoupon) {
        const coupon = await db
          .collection<Coupon>(COUPON_COLLECTION)
          .findOne({ code: normalizedCoupon }, { session });
        if (!coupon) {
          throw new CouponValidationError("This coupon code doesn't exist.");
        }
        discountCents = validateCoupon(coupon, subtotalCents);
        if (coupon.usageLimit !== undefined) {
          const claim = await db
            .collection<Coupon>(COUPON_COLLECTION)
            .findOneAndUpdate(
              { _id: coupon._id, usedCount: { $lt: coupon.usageLimit } },
              { $inc: { usedCount: 1 } },
              { session, returnDocument: "after", includeResultMetadata: false },
            );
          if (!claim) {
            throw new CouponValidationError(
              "This coupon could not be applied. It may have been fully redeemed.",
            );
          }
          appliedCouponCode = claim.code;
        } else {
          appliedCouponCode = coupon.code;
        }
      }

      const costs = computeCheckoutCosts(
        { itemCount, subtotalCents, currency },
        appliedCouponCode
          ? { couponCode: appliedCouponCode, discountCents }
          : undefined,
      );

      const now = new Date();
      const nextOrder: Order = {
        _id: new ObjectId(),
        orderNumber: generateOrderNumber(),
        idempotencyKey,
        accessCode: randomBytes(16).toString("hex"),
        ...(input.customerId
          ? { customerId: input.customerId }
          : {}),
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
        ...(appliedCouponCode && costs.discountCents > 0
          ? {
              couponCode: appliedCouponCode,
              discountCents: costs.discountCents,
            }
          : {}),
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

export type CustomerOrderListItem = Pick<
  Order,
  | "_id"
  | "orderNumber"
  | "totalCents"
  | "currency"
  | "status"
  | "paymentStatus"
  | "createdAt"
> & {
  itemCount: number;
};

export async function listCustomerOrders(
  customerId: ObjectId | string,
): Promise<CustomerOrderListItem[]> {
  const id = typeof customerId === "string" ? new ObjectId(customerId) : customerId;
  const db = await getDb();
  const orders = await db
    .collection<Order>(ORDER_COLLECTION)
    .find({ customerId: id })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();
  return orders.map((order) => ({
    _id: order._id,
    orderNumber: order.orderNumber,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    totalCents: order.totalCents,
    currency: order.currency,
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
  }));
}

export async function getCustomerOrder(
  orderId: string,
  customerId: ObjectId | string,
): Promise<Order> {
  if (!ObjectId.isValid(orderId)) {
    throw new ValidationError({ orderId: "Invalid order id." });
  }
  const id = typeof customerId === "string" ? new ObjectId(customerId) : customerId;
  const db = await getDb();
  const order = await db
    .collection<Order>(ORDER_COLLECTION)
    .findOne({ _id: new ObjectId(orderId), customerId: id });
  if (!order) {
    throw new NotFoundError("Order");
  }
  return order;
}

// The accessCode is a bearer token that proves ownership of the order on the
// customer confirmation page. It is excluded from every admin response so it
// never leaves the server.
export type AdminOrder = Omit<Order, "accessCode">;
export type OrderListItemResult = Pick<
  Order,
  | "_id"
  | "orderNumber"
  | "items"
  | "totalCents"
  | "currency"
  | "status"
  | "paymentStatus"
  | "createdAt"
  | "updatedAt"
> & {
  customer: Pick<OrderCustomerInfo, "firstName" | "lastName" | "email">;
};

function toAdminOrder(order: Order): AdminOrder {
  const copy = {
    ...order,
  } as Omit<Order, "accessCode"> & { accessCode?: string };
  delete copy.accessCode;
  return copy as AdminOrder;
}

export async function getAdminOrder(orderId: string): Promise<AdminOrder> {
  return toAdminOrder(await getOrderById(orderId));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type ListOrdersParams = {
  page: number;
  pageSize: number;
  q?: string;
  status?: OrderStatus;
  paymentStatus?: Order["paymentStatus"];
  dateFrom?: Date;
  dateTo?: Date;
};

export async function listOrders(
  params: ListOrdersParams,
): Promise<PaginatedResult<OrderListItemResult>> {
  const filter: Filter<Order> = {};

  const q = params.q?.trim();
  if (q) {
    const pattern = new RegExp(escapeRegExp(q), "i");
    filter.$or = [
      { orderNumber: pattern },
      { "customer.firstName": pattern },
      { "customer.lastName": pattern },
      { "customer.email": pattern },
    ];
  }
  if (params.status) {
    filter.status = params.status;
  }
  if (params.paymentStatus) {
    filter.paymentStatus = params.paymentStatus;
  }
  if (params.dateFrom || params.dateTo) {
    const createdAt: { $gte?: Date; $lte?: Date } = {};
    if (params.dateFrom) {
      createdAt.$gte = params.dateFrom;
    }
    if (params.dateTo) {
      createdAt.$lte = params.dateTo;
    }
    filter.createdAt = createdAt;
  }

  const db = await getDb();
  const orders = db.collection<Order>(ORDER_COLLECTION);
  const projection = {
    orderNumber: 1,
    "customer.firstName": 1,
    "customer.lastName": 1,
    "customer.email": 1,
    "items.quantity": 1,
    totalCents: 1,
    currency: 1,
    status: 1,
    paymentStatus: 1,
    createdAt: 1,
    updatedAt: 1,
  } as const;

  const [total, items] = await Promise.all([
    orders.countDocuments(filter),
    orders
      .find(filter, { projection })
      .sort({ createdAt: -1 })
      .skip((params.page - 1) * params.pageSize)
      .limit(params.pageSize)
      .toArray(),
  ]);

  return {
    items,
    page: params.page,
    pageSize: params.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / params.pageSize)),
  };
}

const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["cancelled"],
  cancelled: [],
};

export async function updateOrderStatus(
  orderId: string,
  rawStatus: unknown,
): Promise<AdminOrder> {
  if (!ObjectId.isValid(orderId)) {
    throw new ValidationError({ orderId: "Invalid order id." });
  }
  const order = await getOrderById(orderId);

  if (
    typeof rawStatus !== "string" ||
    !ORDER_STATUSES.includes(rawStatus as OrderStatus)
  ) {
    throw new ValidationError({
      status: 'status must be one of "pending", "confirmed" or "cancelled".',
    });
  }
  const status = rawStatus as OrderStatus;

  if (status === order.status) {
    throw new ValidationError({ status: `The order is already ${status}.` });
  }
  const allowed = ORDER_TRANSITIONS[order.status];
  if (!allowed.includes(status)) {
    throw new ValidationError({
      status: `Cannot change order status from ${order.status} to ${status}.`,
    });
  }
  if (status === "cancelled" && order.paymentStatus === "paid") {
    throw new ValidationError({
      status: "This order has already been paid and cannot be cancelled.",
    });
  }

  const db = await getDb();
  const updated = await db
    .collection<Order>(ORDER_COLLECTION)
    .findOneAndUpdate(
      { _id: order._id },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: "after", includeResultMetadata: false },
    );
  if (!updated) {
    throw new NotFoundError("Order");
  }
  return toAdminOrder(updated);
}