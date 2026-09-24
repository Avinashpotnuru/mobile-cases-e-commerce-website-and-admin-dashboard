# API Reference

All endpoints return the JSON envelope:

```json
{ "ok": true, "data": … }
{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "…", "fieldErrors": { … } } }
```

Errors are typed (`AppError`, `ValidationError`, `NotFoundError`, `UnauthorizedError`) and serialized by the shared `handleApiError` helper. List endpoints support `page` and `pageSize` (validated, capped at 100).

## Public storefront

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/brands` | Paginated brands |
| GET | `/api/brands/{slug}` | Brand by slug |
| GET | `/api/brands/{slug}/models` | Models for a brand |
| GET | `/api/brands/{slug}/models/{modelSlug}` | Model within a brand |
| GET | `/api/brands/{slug}/models/{modelSlug}/products` | Products for a model (customer flow) |
| GET | `/api/mobile-models` | Paginated models (`?brandId=`) |
| GET | `/api/products` | Paginated products (`?brandId=`, `?mobileModelId=`, `?q=`) |
| GET | `/api/products/{slug}` | Product by id/slug |
| GET | `/api/products/{slug}/compatible-models` | Compatible models |
| GET | `/api/inventory` | Paginated inventory |
| GET | `/api/inventory/{productId}` | Inventory for a product |
| GET | `/api/cart` | Read the guest cart cookie |
| POST | `/api/cart` | Replace the guest cart cookie |

## Checkout & orders

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/coupons/validate` | Validate a `couponCode` against a `subtotalCents`; returns discount estimate |
| POST | `/api/checkout` | Verify cart + coupon + address; computes shipping/discount and returns `CheckoutCosts` |
| POST | `/api/orders` | Create an order (optional `couponCode`), decrements inventory, redeems coupon, clears cart |

Note: the client calls `/api/checkout` for live cost estimates, but `/api/orders` **re-validates everything server-side** before persisting — never trust client totals.

## Customer accounts

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/customer/session` | Current session / customer |
| POST | `/api/customer/signup` | Create account (scrypt-hashed password) |
| POST | `/api/customer/login` | Sign in |
| POST | `/api/customer/logout` | Sign out |
| GET/POST | `/api/account/addresses` | List / add addresses |
| PATCH/DELETE | `/api/account/addresses/{id}` | Update / delete (incl. set default) |

## Admin (`/api/admin/**`)

Guarded by `requireAdmin()` — session-based auth via:

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/admin/login` | Sign in (username + password) |
| POST | `/api/admin/logout` | Sign out |
| GET | `/api/admin/session` | Current admin session |

Catalog / product / inventory / orders / coupons management covers create, update, and soft-delete:

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET/POST | `/api/admin/brands` | List / create brands |
| PATCH/DELETE | `/api/admin/brands/{id}` | Update / soft-delete brand |
| GET/POST | `/api/admin/mobile-models` | List / create models |
| PATCH/DELETE | `/api/admin/mobile-models/{id}` | Update / soft-delete model |
| GET/POST | `/api/admin/products` | List / create products (incl. compatibility) |
| PATCH/DELETE | `/api/admin/products/{id}` | Update / soft-delete product (incl. `marketingPriceCents`) |
| GET | `/api/admin/inventory` | List inventory |
| PATCH | `/api/admin/inventory/{productId}` | Stock operations (atomic) |
| GET/PATCH | `/api/admin/orders` | List orders / update order status |
| GET/POST | `/api/admin/coupons` | List / create coupons |
| PATCH/DELETE | `/api/admin/coupons/{id}` | Update / deactivate coupon |

## Example: validate a coupon

```http
POST /api/coupons/validate
Content-Type: application/json

{ "couponCode": "WELCOME10", "subtotalCents": 200000 }
```

```json
{ "ok": true, "data": { "valid": true, "discountCents": 20000, "type": "percent", "value": 10 } }
```

## Example: error

```http
POST /api/coupons/validate
{ "couponCode": "EXPIRED5", "subtotalCents": 10000 }
```

```json
{ "ok": false, "error": { "code": "COUPON_EXPIRED", "message": "This coupon has expired." } }
```