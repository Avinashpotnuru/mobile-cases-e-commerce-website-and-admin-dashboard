# Security

## Authentication

### Admin

* Username + password from `.env.local` (`ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` — **scrypt**).
* Successful login creates an **httpOnly session cookie** signed with `ADMIN_SESSION_SECRET`.
* Every `/api/admin/**` route is guarded server-side by `requireAdmin()`; page routes are protected too. Authorization is never client-only.
* Generate a fresh hash per environment: `npm run admin:hash -- "password"`.

### Customer

* Passwords hashed with **scrypt** (salted) before storage.
* Logged-in state uses an **httpOnly session cookie**.
* Sessions are server-validated on every authenticated request.

## Server-side integrity

* **Prices & totals are server-computed only.** Client input never sets `priceCents`, `totalCents`, or discount values — checkout results (`/api/checkout`, `/api/orders`) are recomputed from persisted catalog data.
* **Coupons re-validated in the order write.** Active status, expiry, minimum subtotal, and usage limit are all re-checked inside the order transaction, and `usedCount` is clamped atomically (a coupon can never redeem past `usageLimit` under concurrency).
* **Free-shipping threshold uses pre-discount subtotal**, so coupon discounts can't be used to unlock shipping discounts fraudulently.
* **Inventory is atomic and non-negative** — decrements use guarded conditional `findOneAndUpdate` operations, safe under concurrent checkout.

## Data integrity & validation

* Every write is validated by dedicated server-side validators before hitting a service.
* Services are the only layer that touches Mongo.
* Bad input returns typed errors (`VALIDATION_ERROR` with `fieldErrors`), not stack traces.

## Secrets

* Secrets live only in `.env.local`, which is gitignored.
* `.env.example` documents a placeholder hash explicitly so no real credential is ever committed.
* Admin and payment/webhook secrets are read from env at runtime, never baked into code.

## Session hardening notes

* Cookies are httpOnly; sensitive session writes flow through server-only routes/services.
* Admin session secret should be a long random hex value per environment.

## Production gaps (Roadmap)

* **Payment** — swap `PAYMENT_PROVIDER=dummy` for a real gateway (e.g. Razorpay/Stripe), keeping server-side verification + idempotent webhooks.
* **Refunds & cancellations** — `refunded` is a badge-only status today; no automated refund or inventory restock yet.
* **Rate limiting / captcha** — none currently (add Cloudflare Turnstile / rate limiting before public launch).
* **Transactional email** — only `mailto:` links exist; add an email provider (Resend/Brevo) for order confirmations, password reset, and marketing.
* **Wishlist & cart** — cookie-based for guests; not yet synced to customer accounts.
* **Admin ops** — no admin customer management UI yet.