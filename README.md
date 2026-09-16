# Mobile Cases

A production-ready e-commerce application for selling mobile phone cases, built with Next.js, TypeScript, and MongoDB.

## Stack

* **Framework** — Next.js 16 (App Router) with React 19
* **Language** — TypeScript (strict, no `any`)
* **Database** — MongoDB via the official `mongodb` driver (no ODM)
* **Styling** — Tailwind CSS v4 with a premium dark + gold design system
* **Lint / Typecheck** — ESLint, `tsc --noEmit`

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

Wipes and reseeds the catalog collections (brands, mobile models, products, inventory) with realistic sample data. Requires explicit confirmation:

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
│   │   ├── brands/              # Public brand catalog
│   │   ├── mobile-models/       # Public mobile model catalog
│   │   ├── products/            # Public product catalog + compatibility
│   │   ├── inventory/           # Public inventory lookups
│   │   └── admin/               # Admin APIs (auth-guarded)
│   └── ...                      # Storefront / admin pages (next)
├── components/
│   └── ui/               # Shared UI components
├── lib/
│   ├── api/              # Response helpers, body parsing, auth guard, pagination
│   ├── database/         # Mongo connection + models + index management
│   ├── services/         # Business logic (brand, model, product, inventory)
│   └── validation/       # Server-side input validators
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
```

* A **product** is compatible with one or more **mobile models** (multiple products per model).
* **Price** is stored in minor units (`priceCents`) and is strictly server-controlled — it is never accepted from client input.
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

Admin endpoints (`/api/admin/**`) are guarded by `requireAdmin()` — currently a placeholder that returns `401` until authentication is implemented. They cover brand/model/product/inventory create, update, soft-delete, and inventory stock operations.

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

Implemented: project architecture, design system, database layer, seed data, server/API foundation, and the full **catalog** (brands, mobile models, products, product compatibility, inventory).

Not yet built: storefront UI, cart, checkout, orders, payment, admin UI, and authentication. See `IMPLEMENTATION_STATUS.md` for the live roadmap.

## Security Notes

* Prices and order totals are only ever determined server-side.
* Stock decrements are atomic and guarded against going negative.
* All writes are validated and run through the service layer.
* Secrets live only in `.env.local`, which is never committed.