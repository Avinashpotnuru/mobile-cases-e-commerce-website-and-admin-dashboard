# Architecture

## Layering

Strict separation of concerns following one direction of dependency:

```
UI → Server/API → Service → Database
```

* Routes/`Server Components` never talk to Mongo — they call **services**.
* Services own all database access and business logic and never render UI.
* All server inputs pass through **validators** before being consumed.
* Shared **types** sit between layers so UI and services don't leak shapes.

## Directory layout

```
src/
├── app/                    # Next.js App Router (pages + API routes)
│   ├── api/
│   │   ├── coupons/        # Public coupon validation
│   │   ├── brands/         # Public brand catalog
│   │   ├── mobile-models/  # Public mobile model catalog
│   │   ├── products/       # Public product catalog + compatibility
│   │   ├── inventory/      # Public inventory lookups
│   │   ├── cart/           # Guest cart cookie API
│   │   ├── checkout/       # Server-side checkout verification
│   │   ├── orders/         # Public order creation
│   │   ├── customer/       # Customer signup/login/logout/session
│   │   ├── account/        # Address book
│   │   └── admin/          # Admin APIs (auth-guarded)
│   ├── (storefront)/                      # Storefront pages
│   │   ├── brands/[slug]/…  # Brand / model / product listing & details
│   │   ├── coupons/         # Public offers page (ISR, revalidate 300)
│   │   ├── cart/ checkout/ orders/ account/…
│   └── (admin)/admin/                     # Admin pages (protected)
├── components/
│   ├── ui/                 # Shared UI primitives
│   ├── admin/              # Admin dashboard components
│   └── storefront/         # Storefront components (incl. home sections)
├── lib/
│   ├── api/                # ok/created/handleApiError, parsing, pagination
│   ├── auth/               # Admin + customer sessions
│   ├── database/           # Mongo connection, models (collections), index mgmt
│   ├── services/           # Business logic (brand, model, product, inventory,
│   │                       # coupon, order, …)
│   ├── storefront/         # Cart cookie + checkout cost math
│   └── validation/         # Server-side validators
└── types/                  # Shared TypeScript types
```

## Conventions

* **React** — prefer Server Components; only use Client Components where interactivity requires them (cart coupon apply, copy-code button, tables, etc.).
* **Money** — prices are integers in **minor units** (`priceCents`). Floats are never used for money. User-facing formatting (`formatPrice`) divides by 100 and uses `en-IN`/INR grouping for Indian prices.
* **Inventory** — quantities are non-negative; stock changes are atomic Mongo `findOneAndUpdate` ops with guards; mutations require an active inventory document.
* **Coupons / orders** — counters and stock are mutated atomically inside the order transaction.
* **Pagination** — list endpoints accept `page` & `pageSize` (positive integers, capped at 100).
* **Errors** — services throw typed errors (`AppError`, `ValidationError`, `NotFoundError`, `UnauthorizedError`); routes map them via the shared `handleApiError` helper. Response envelope is `{ ok: true, data }` / `{ ok: false, error }`.

## Server Components & ISR

The storefront is server-rendered. Lightly-changing pages (e.g. the `/coupons` offers page) use static generation with `revalidate = 300` (5-minute ISR) so edits are picked up without a rebuild while staying fast.