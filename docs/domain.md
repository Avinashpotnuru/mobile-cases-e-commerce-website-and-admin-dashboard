# Domain Model

## Entities

```
Brand
  └── Mobile Model                     Apple → iPhone 15 → compatible cases
        └── Compatible Product
              └── Inventory

Customer ── Address Book (multiple, one default)
Customer ── Order ── Coupon (reference only)
Product  ── Review  (rating, title, body)
Customer ── Wishlist ("saved cases")
```

### Brand

* Slug-unique identity (`{ name, slug, description, logo, … }`).

### Mobile Model

* Belongs to a brand. Identity within its brand by slug.

### Product

* Compatible with one or more mobile models (a model may have many products).
* **Price** — `priceCents` (regular), optional `marketingPriceCents` **compare-at**; when `marketingPriceCents > priceCents` the product is on sale (badge + strike-through + % off). Prices are server-controlled, never accepted from client input.
* Soft-deletable.

### Inventory

* Per product. `quantity` non-negative; reserved/atomic decrement guards.

### Coupon

* Identify by uppercased `code` (`/^[A-Za-z0-9][A-Za-z0-9-_]{2,49}$/`), unique.
* `type: "percent" | "fixed"` — percent is a 1–99 integer; fixed is in cents.
* Optional: `minSubtotalCents`, `maxDiscountCents`, `expiresAt`, `usageLimit` (`usedCount` tracks usage).
* `status: "active" | "inactive"` (delete = deactivate).
* Eligibility is validated server-side; redemption is atomic and clamped to `usageLimit`.

### Order

* `orderNumber` (human-friendly), optional `customerId`, `couponCode?`.
* Items snapshot `{ productId, slug, name, image, priceCents, quantity, … }`.
* Totals: `subtotalCents`, `discountCents`, `shippingCents`, `totalCents`, plus `shippingAddress`.
* Payment block `{ provider, status, transactionId }`. Statuses include `pending` → paid states and `refunded` (currently a status-only state — no automated refund/restock yet).
* `createdAt`, and admin-managed status transitions.

## Invariants

1. Money is always in minor units; the server is the single source of truth for every price and total.
2. Order line prices snapshot the product price at purchase time (later price changes don't rewrite history).
3. Coupon math applies to the cart **subtotal**; shipping / free-shipping threshold is computed on the **pre-discount** subtotal so a coupon can't unlock free shipping.
4. Inventory never goes negative, even under concurrent requests (atomic guarded updates).
5. A coupon's `usedCount` can never exceed `usageLimit`, even under concurrency (guarded `findOneAndUpdate` inside the order write).

## Indexes

Managed centrally in `src/lib/database` (index management on startup). Slugs and coupon codes are unique; queries are index-backed.