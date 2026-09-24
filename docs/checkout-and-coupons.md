# Checkout & Coupons

## Cost model

All money is integral minor units (`…Cents`).

```
subtotal      = Σ (line priceCents × quantity)        # snapshot of sold price
freeShip      = subtotal (PRE-discount) ≥ FREE_SHIPPING_THRESHOLD
shipping      = 0 if freeShip else zone rate
discount      = min(coupon discount, maxDiscountCents, subtotal)
total         = subtotal − discount + shipping
```

Why pre-discount subtotal for free shipping? So a 50% coupon can't push a small order over a paid-shipping threshold to steal free shipping. `maxDiscountCents` caps a percent coupon's absolute value.

## Coupon lifecycle

1. **Admin creates** a coupon (percent/fixed, limits, expiry, usage limit) → stored with uppercased unique code, `status: "active"`.
2. **Customer discovers** codes on the public `/coupons` page (ISR) or elsewhere and **applies** it in the cart/checkout.
3. **Client estimates** the discount via `POST /api/coupons/validate` (takes `subtotalCents`).
4. **Checkout** (`POST /api/checkout`) includes the coupon in the server-side cost computation.
5. **Order creation** (`POST /api/orders`) re-validates the coupon **inside the order write**:
   * Re-checks active status, expiry, minimum subtotal, and usage limit.
   * When `usageLimit` is set, increments `usedCount` with a guarded `findOneAndUpdate` (`usedCount < usageLimit`) so two concurrent orders can't both redeem the last slot.
   * Fails the whole order if the coupon is unusable (no partial order).
6. A successful order atomically: decrements inventory, redeems the coupon, records `couponCode` + `discountCents` on the order, clears the cart.

Only the server writer pages work through this path in transaction order — never call a separate "redeem" endpoint from checkout.

## Order flow

```
Cart (cookie) → POST /api/checkout (verify cart/coupon/address → CheckoutCosts)
      ↓
POST /api/orders  (server re-validates, writes order, stock, coupon usage)
      ↓
Order confirmation (shows line items, discount row, shipping, total)
```

* Orders snapshot item names/prices at purchase time.
* Orders may be linked to the signed-in customer; the confirmation stores the chosen shipping address (optionally saved to the address book).
* Payment uses the configured provider (`dummy` by default — always succeeds, **replace before production**). Webhook handling uses `DUMMY_WEBHOOK_SECRET`.
* `PaymentStatus` drives confirmation/order-history display; `refunded` is currently a status-only state (no automated refund or inventory restock yet — see Roadmap).

## Sale prices

Products may carry `marketingPriceCents` (compare-at). When it exceeds `priceCents`, the storefront shows a sale badge, "was ₹X" strike-through, and % off on cards and the product page. Clearing it (or equalizing) removes the sale state — enforced in the service layer on every product write.