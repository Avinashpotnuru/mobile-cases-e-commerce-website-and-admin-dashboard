# Mobile Cases E-commerce

## Goal

Build a production-ready e-commerce application for selling mobile phone cases.

The client requirements are not finalized yet.

Use realistic sample/seed data initially. The same codebase will become the final client application after requirements are confirmed.

Do not create throwaway demo architecture.

## Customer

* Home
* Brand selection
* Mobile model selection
* Product listing
* Search
* Filtering
* Sorting
* Product details
* Cart
* Checkout
* Payment
* Order confirmation

## Admin

* Authentication
* Dashboard
* Brands
* Mobile models
* Products
* Inventory
* Orders

## Core Business

Brand
→ Mobile Model
→ Compatible Product

Example:

Apple
→ iPhone 15
→ Compatible Cases

## Architecture

Keep these areas separated:

* Customer storefront
* Admin dashboard
* Server/API
* Services
* Validation
* Database
* Shared components
* Types

Prefer:

UI
→ Server/API
→ Service
→ Database

## Important Rules

* Sample data must follow the same structure as real data.
* Server is the source of truth for prices and order totals.
* Validate important input server-side.
* Admin authorization is enforced server-side.
* Payment is verified server-side.
* Use pagination for large datasets.
* Keep business logic independent from UI.
* Reuse existing code.
* Keep the architecture extensible.

## Development

Build one step at a time.

Complete and validate the current step before starting another.

See `IMPLEMENTATION_STATUS.md` for progress.
