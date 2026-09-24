# Getting Started

## Prerequisites

* **Node.js 24+** — the seed script runs `.ts` files directly.
* **MongoDB** — an Atlas cluster or local instance (see env note below).

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment

Copy `.env.example` to `.env.local` and fill in values:

```env
# MongoDB — direct host list (SRV lookup is refused on this machine; re-fetch
# the shard hosts and update if Atlas moves them).
MONGODB_URI="mongodb://<user>:<pass>@host00,...,hostNN/<db>?ssl=true&replicaSet=<rs>&retryWrites=true&w=majority&authSource=admin"
MONGODB_DB="mobile-cases-ecommerce"

# Admin login
ADMIN_USERNAME="admin"
ADMIN_PASSWORD_HASH="scrypt:<n>:<r>:<p>:<salt-hex>:<hash-hex>"

# Payment provider (dummy = always-succeeds test provider; never in production)
PAYMENT_PROVIDER="dummy"
DUMMY_WEBHOOK_SECRET="<random-hex>"
```

`.env.local` is gitignored and never committed.

### Generating the admin password hash

```bash
npm run admin:hash -- "your-password"
```

Paste the printed `scrypt:<...>` value into `ADMIN_PASSWORD_HASH`.

## 3. Seed the database

Wipes and reseeds the catalog (brands, mobile models, products with sale prices, inventory). Requires explicit confirmation:

```powershell
$env:SEED_CONFIRM="1"
npm run db:seed
```

## 4. Run the app

```bash
npm run dev
```

Open http://localhost:3000. Admin app lives at `/admin` (login: `/admin/login`).

## Scripts

| Command | Purpose |
| ------- | ------- |
| `npm run dev` | Development server |
| `npm run build` | Production build (also typechecks) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:seed` | Reset and reseed sample data |
| `npm run admin:hash -- "pw"` | Generate an `ADMIN_PASSWORD_HASH` |
| `npm run test:orders` | End-to-end order creation test |
| `npm run test:payments` | Payment / webhook flow test |
| `npm run test:confirmation` | Order confirmation flow test |
| `npm run test:admin` | Admin auth test against `.env.local` |

## Verification

After a meaningful change, run:

```bash
npm run typecheck
npm run lint
npm run build
```

Known pre-existing lint warnings (not errors): `@tanstack/react-table` incompatibility in `admin/data-table.tsx:86` and an unused `_props` in `storefront/site-header.tsx:125`.

The build runs the production preview server — stop any `next start`/`next dev` instance holding port 3000 before rebuilding if it fails to bind.