# Mobile Cases — Documentation

A production-ready e-commerce app for selling mobile phone cases, built with **Next.js 16 (App Router)**, **TypeScript**, and **MongoDB** (official driver, no ODM).

| Doc | What it covers |
| --- | -------------- |
| [Getting Started](getting-started.md) | Prerequisites, `.env` setup, seeding, running, scripts, verification |
| [Architecture](architecture.md) | Layering, folder structure, coding conventions, money rules |
| [Domain Model](domain.md) | Entities, relationships, invariants (products, inventory, coupons, orders) |
| [API Reference](api.md) | All public + admin endpoints, request/response shapes, errors |
| [Checkout & Coupons](checkout-and-coupons.md) | Pricing math, coupon lifecycle, order flow, payment |
| [Security](security.md) | Auth, server-side integrity, secrets, production checklist |

## Related

* [`README.md`](../README.md) — project overview and quick start
* [`IMPLEMENTATION_STATUS.md`](../IMPLEMENTATION_STATUS.md) — feature/roadmap status
* [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md) — original goals and constraints
* [`design-system/mobile-cases/MASTER.md`](../design-system/mobile-cases/MASTER.md) — full design spec