# Mobile Cases

A production-ready e-commerce application for selling mobile phone cases, built with Next.js, TypeScript, and MongoDB.

## Stack

* **Framework** — Next.js 16 (App Router) with React 19
* **Language** — TypeScript (strict, no `any`)
* **Database** — MongoDB via the official `mongodb` driver (no ODM)
* **Styling** — Tailwind CSS v4 with a premium dark + gold design system
* **Lint / Typecheck** — ESLint, `tsc --noEmit`

## Documentation

Full documentation lives in [`docs/`](docs/README.md) — getting started, architecture, domain model, API reference, checkout & coupons, and security.

## Getting Started

### Prerequisites

* Node.js 24+ (supports running `.ts` files directly)
* A MongoDB Atlas cluster (or local instance)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and set your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net
MONGODB_DB=mobile-cases-ecommerce
```

`.env.local` is gitignored and never committed.

### 3. Seed the database

Wipes and reseeds the catalog collections (brands, mobile models, products with sale prices, inventory) with realistic sample data. Requires explicit confirmation:

```powershell
$env:SEED_CONFIRM="1"
npm run db:seed
```

### 4. Run the app

```bash
npm run dev
```

Open http://localhost:3000.

## Scripts

| Command                | Purpose                              |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Start the development server          |
| `npm run build`        | Production build                      |
| `npm run start`        | Start the production server           |
| `npm run lint`         | Run ESLint                           |
| `npm run typecheck`    | Type-check with `tsc --noEmit`        |
| `npm run db:seed`      | Reset and reseed sample data          |

## Architecture

Strict separation of concerns following the flow:

```
UI → Server/API → Service → Database
```

```
src/
├── app/                 # Next.js App Router (pages + API routes)
│   ├── api/
│   │   ├── coupons/             # Public coupon validation
│   │   ├── brands/              # Public brand catalog
│   │   ├── mobile-models/       # Public mobile model catalog
│   │   ├── products/            # Public product catalog + compatibility
│   │   ├── inventory/           # Public inventory lookups
│   │   ├── customer/            # Customer auth + address book
│   │   ├── orders/              # Public order creation
│   │   ├── checkout/            # Checkout verification
│   │   ├── cart/                # Guest cart cookie API
│   │   └── admin/               # Admin APIs (auth-guarded)
│   └── ...                      # Storefront / admin pages
├── components/
│   ├── ui/               # Shared UI components
│   ├── admin/            # Admin app components
│   └── storefront/       # Storefront components
├── lib/
│   ├── api/              # Response helpers, body parsing, auth guard, pagination
│   ├── auth/             # Admin + customer session management
│   ├── database/         # Mongo connection + models + index management
│   ├── services/         # Business logic (brand, model, product, inventory, coupon, order)
│   ├── validation/       # Server-side input validators
│   └── storefront/       # Cart cookie + checkout cost math
└── types/                # Shared TypeScript types
```

### Layering rules

* Services own all database access — routes never touch Mongo directly.
* All server inputs are validated before use.
* Use the existing API/error/response helpers (`ok`, `created`, `handleApiError`, etc.).

## Domain Model

```
Brand
  └── Mobile Model
        └── Compatible Product
              └── Inventory

Customer ── Address Book
Customer ── Order ── Coupon
Admin   ── Coupon (CRUD)
```

* A **product** is compatible with one or more **mobile models** (multiple products per model).
* **Price** is stored in minor units (`priceCents`) and is strictly server-controlled — it is never accepted from client input.
* **Sale pricing**: an optional `marketingPriceCents` (compare-at) drives sale badges and strike-through prices when it exceeds `priceCents`.
* **Coupons** are `percent` or `fixed` amount, with optional minimum order, maximum discount, expiry, and usage limit. Codes are case-insensitively unique; eligibility is validated server-side and redemptions are counted atomically inside the order transaction.
* **Inventory** quantity is `non-negative`, stock changes use atomic Mongo updates, and mutations require active inventory.

## API Overview

Public endpoints (JSON envelope: `{ ok: true, data }` / `{ ok: false, error }`):

| Method | Endpoint                                  | Description                          |
| ------ | ----------------------------------------- | ------------------------------------ |
| GET    | `/api/brands`                             | Paginated brands                    |
| GET    | `/api/brands/{slug}`                      | Brand by slug                       |
| GET    | `/api/brands/{slug}/models`               | Models for a brand                  |
| GET    | `/api/brands/{slug}/models/{modelSlug}`   | Model within a brand                |
| GET    | `/api/brands/{slug}/models/{modelSlug}/products` | Products for a model (customer flow) |
| GET    | `/api/mobile-models`                      | Paginated models (`?brandId=`)      |
| GET    | `/api/products`                           | Paginated products (`?brandId=`, `?mobileModelId=`, `?q=`) |
| GET    | `/api/products/{slug}`                    | Product by id/slug                  |
| GET    | `/api/products/{slug}/compatible-models`  | Models compatible with a product    |
| GET    | `/api/inventory`                          | Paginated inventory                 |
| GET    | `/api/inventory/{productId}`              | Inventory for a product             |
| GET    | `/api/cart`                               | Read the guest cart cookie          |
| POST   | `/api/cart`                               | Replace the guest cart cookie       |
| POST   | `/api/checkout`                           | Verify cart, coupon `couponCode`, address & shipping costs |
| POST   | `/api/orders`                             | Create an order (optional `couponCode`), clears the cart |
| POST   | `/api/coupons/validate`                   | Validate a code against a subtotal  |
| GET    | `/api/customer/session`                   | Current customer session            |
| POST   | `/api/customer/signup`                   | Create a customer account           |
| POST   | `/api/customer/login`                    | Sign in                             |
| POST   | `/api/customer/logout`                   | Sign out                            |
| GET/POST/DELETE | `/api/account/addresses`        | Customer address book               |

Admin endpoints (`/api/admin/**`) are guarded by `requireAdmin()` (session-based authentication via `/api/admin/login`, `/api/admin/logout`, and `/api/admin/session`). They cover brand, model, product, inventory, order, and coupon management with soft-deletes and atomic stock operations:

| Method | Endpoint                              | Description                          |
| ------ | ------------------------------------- | ------------------------------------ |
| GET/POST | `/api/admin/brands`                 | List / create brands                 |
| GET/PATCH/DELETE | `/api/admin/brands/{id}`    | Read / update / soft-delete a brand  |
| GET/POST | `/api/admin/mobile-models`          | List / create mobile models          |
| GET/PATCH/DELETE | `/api/admin/mobile-models/{id}`| Read / update / soft-delete a model |
| GET/POST | `/api/admin/products`               | List / create products               |
| GET/PATCH/DELETE | `/api/admin/products/{id}`   | Read / update / soft-delete a product |
| POST | `/api/admin/products/{id}/compatibility` | Attach a compatible model          |
| DELETE | `/api/admin/products/{id}/compatibility/{modelId}` | Remove a compatible model |
| GET/POST | `/api/admin/inventory`             | List / create inventory records      |
| GET/PATCH/DELETE | `/api/admin/inventory/{id}` | Read / update / delete inventory     |
| POST | `/api/admin/inventory/{id}/adjust`  | Adjust stock by a delta              |
| PATCH | `/api/admin/inventory/{id}/stock`  | Set an absolute stock level          |
| GET | `/api/admin/orders`                   | List orders                          |
| GET/PATCH | `/api/admin/orders/{id}`            | Read / update an order               |
| GET/POST | `/api/admin/coupons`                | List / create coupons                |
| GET/PATCH/DELETE | `/api/admin/coupons/{id}`   | Read / update / deactivate a coupon  |

All list endpoints support `page` & `pageSize` query params (validated positive integers, capped at 100).

## Error Format

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input.",
    "fieldErrors": { "slug": "A brand with this slug already exists." }
  }
}
```

Errors are typed (`AppError`, `ValidationError`, `NotFoundError`, `UnauthorizedError`) and mapped to responses by `handleApiError`.

## Design System

A premium dark-and-gold visual identity lives in `src/app/globals.css` (CSS variables / design tokens) with Cormorant + Montserrat typography. Full specification and rationale are documented in `design-system/mobile-cases/MASTER.md`.

## Status

Implemented: project architecture, design system, database layer (brands, mobile models, products, product compatibility, inventory, customers, customer sessions, address book, reviews, orders, coupons), seed data, the full storefront (home, brand/model selection — including `/brands/[slug]` and `/models/[slug]` —, product listing with search/filter/sort, product details with customer reviews and ratings, sale pricing with compare-at prices, cart, checkout with coupon redemption and live costs, order creation with a linked customer account, order confirmation with a discount breakdown, order history), customer accounts (sign up, sign in, account area), saved-cases wishlist, an address book with checkout prefill, a public `/coupons` offers page with copy-to-clipboard codes + an FAQ, a storefront Shop FAQ, and the admin app (authentication, dashboard, catalog/product/inventory/order/coupon management).

The admin catalog tables are powered by a shared `DataTable` component: row selection with bulk actions, column visibility toggle, CSV export of the current view, expandable detail rows, a sticky header, footer totals, multi-column sorting, view preferences (sorting + column visibility) persisted to `localStorage`, and a premium responsive pagination with a rows-per-page selector.

Not yet built for production: a real payment gateway (checkout currently uses a dummy/test provider), transactional email, refund/restock automation on cancellations, automated tests, and deployment configuration. See `IMPLEMENTATION_STATUS.md` for the live roadmap.

## Security Notes

* Prices and order totals are only ever determined server-side.
* Coupon eligibility is validated server-side at checkout and again inside the order transaction; usage counters are clamped atomically so a coupon can never redeem past its limit.
* Free-shipping thresholds are computed on the pre-discount subtotal, so a coupon discount can never unlock free shipping fraudulently.
* Stock decrements are atomic and guarded against going negative.
* All writes are validated and run through the service layer.
* Secrets live only in `.env.local`, which is never committed.