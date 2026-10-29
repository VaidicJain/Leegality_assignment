# Leegality Frontend Assessment: Product Listing and Detail

An Amazon-style product browsing app built on the public [DummyJSON Products API](https://dummyjson.com/docs/products). It has two screens: a filterable, paginated **Product Listing** and a **Product Detail** page.

> **Project status:** Planning complete (Step 1). Implementation is in progress. Sections marked *(planned)* describe the agreed design and will be updated to match the final implementation. Demo and repository links will be added once they exist.

## Table of contents

1. [Overview](#overview)
2. [Tech stack](#tech-stack)
3. [Features (planned)](#features-planned)
4. [Architecture](#architecture)
5. [Decision log](#decision-log)
6. [Project structure (planned)](#project-structure-planned)
7. [Setup instructions](#setup-instructions)
8. [Assumptions](#assumptions)
9. [Improvements with more time](#improvements-with-more-time)
10. [Submission links](#submission-links)

## Overview

| Route | Screen | Purpose |
|---|---|---|
| `/` | Product Listing | Filter sidebar (category, price, brand), header search, product grid, pagination |
| `/product/:id` | Product Detail | Image, title, price, rating, description, brand, category, Back to Products |

Goals: correct combined filtering, predictable state, clean typed code, and a polished, accessible, responsive UI.

## Tech stack

- **React** (functional components and hooks) with **TypeScript** in strict mode
- **Redux Toolkit** for shared UI state, and **RTK Query** for all API fetching, caching, and error handling
- **React Router** for routing
- **CSS Modules** with global design tokens (no UI library)
- **Vite** for tooling, **Vitest** and **React Testing Library** for tests

## Features (planned)

- Dynamic categories from `GET /products/categories`
- Category filter (single select), min/max price range, multi-select brands, and header search
- All filters work together, and the result count and pagination always reflect the real filtered set
- Active-filter chips with a clear-all action
- Loading skeletons, error with retry, and empty-result states
- Product detail page with a not-found state for invalid IDs
- Filters, search, and page preserved when navigating to a product and back
- Shareable listing URLs (for example `/?category=laptops&min=100&page=2`)
- Responsive layout (filter sidebar on desktop, drawer on mobile) and keyboard-accessible controls

## Architecture

### Data and filtering strategy (planned)

DummyJSON filters server-side by category only. It cannot filter by price or brand, and brands can only be discovered from fetched products. Paginating on the server first and filtering afterwards would give wrong totals and sparse pages. The strategy is:

1. Fetch the whole category-scoped product set once using `limit=0` and `select=` to keep the payload small.
   - No category: `GET /products?limit=0&select=...`
   - With a category: `GET /products/category/{slug}?limit=0&select=...`
2. Apply search, price, and brand filters in one pure, unit-tested function (`filterProducts`).
3. Derive brand options from the current base set.
4. Paginate the filtered result client-side (12 per page).

RTK Query caches each distinct argument once, so switching back to a category does not refetch it. `limit=0` and `select` support will be verified against the live API before the API layer is built (see Decision 3).

### State management (planned)

- **RTK Query** owns all server state. API data is never copied into Redux slices or component state.
- A **listing slice** owns shared, serializable UI state: `category`, `search`, `minPrice`, `maxPrice`, `brands`, and `page`.
- Every filter-changing reducer resets `page` to 1 in one place. Only `setPage` leaves it alone.
- Derived values (filtered products, brand options, total pages) come from selectors and are never stored.
- Local component state is limited to temporary UI: unsubmitted price inputs, the search input text, and the mobile filter drawer.

### State preservation and URLs (planned)

Redux is the source of truth, so filters and page survive `/` to `/product/:id` and back. A thin URL-sync hook hydrates Redux from the URL on first load only (for shareable links), then mirrors Redux to the URL using `replace`. Direct `/product/:id` access does not depend on listing state.

## Decision log

Every significant decision, the reason behind it, and its impact.

| # | Decision | Reason | Impact |
|---|---|---|---|
| 1 | **Price filter applies on Apply button click or Enter**, not on every keystroke. Category, brand, and search apply instantly. | Matches the provided mockup. Live filtering on partial input (typing "1", then "10", then "100") causes flicker and pointless intermediate results. It also gives a clear place to validate. | One extra click for price only. Fewer re-renders and no flicker. Min greater than max shows an inline error and does not apply. |
| 2 | **Header search is shown and implemented client-side** with a custom `filterProducts` function, not `GET /products/search`. | The assignment allows client-side filtering "where required". The server search endpoint cannot be combined with category, price, and brand filters, and it is not in the required endpoint list. | Search composes correctly with every other filter. It scans the loaded set only (title, brand, category), so it is scoped to the selected category. Multi-word queries match case-insensitively with AND semantics. |
| 3 | **Fetch the full category-scoped set once (`limit=0` plus `select`) and filter and paginate client-side.** Page size is 12. | The API cannot filter by price or brand, so server-side pagination would produce incorrect counts. At roughly 194 slim records the payload is small. 12 divides evenly into 2, 3, and 4 columns. | Totals and pages are always accurate and there is a single data path. It would not scale to a very large catalog. In that case server-side filtering would be needed. If `limit=0` proves unsupported, the fallback is chunked `limit`/`skip` fetching until `total` is reached. |
| 4 | **Category is single-select** with an "All" option. | The category endpoint is per category, and the mockup shows one selected category. | Simple and accurate server mapping. Multi-category selection is a possible future improvement. |
| 5 | **Changing category clears selected brands and resets the page.** Price and search are kept. | Brand options depend on the category, so old selections could become invalid or hidden. | No stale brand filters. The user re-selects brands after switching category. |
| 6 | **Redux is the source of truth for listing state, with one-way URL sync using `replace`.** | The brief requires Redux to preserve filters. URL sync adds shareable links without a competing source of truth. Hydrating once avoids loops. | Bookmarkable listing links. Browser Back does not step through individual filter changes. Reloading restores state from the URL. |
| 7 | **Back to Products is a plain link to `/`.** | Redux already holds the filters, and a link works even on direct visits to a detail URL. | Deterministic behavior regardless of history. Scroll position restoration is handled separately. |
| 8 | **Products without a brand are skipped in the brand list** and excluded only while a brand is selected. No "Unbranded" option. | The API omits `brand` on some products (for example groceries). | Brand filter stays clean. Unbranded products remain visible until a brand is chosen. |
| 9 | **Single reducer-level page reset** instead of per-component reset dispatches. | DRY. A component cannot forget to reset the page. | Consistent pagination behavior across all filters. |
| 10 | **Vite plus React Router instead of Next.js.** | The brief mandates React Router, and Next.js has its own router. | Lightweight setup. Deployment needs an SPA rewrite so direct `/product/:id` URLs work (Vercel or Netlify). |
| 11 | **Strict TypeScript.** No `any`, no error suppression, explicit domain types and interfaces, and `import type` for type-only imports. | Code quality and reviewer confidence. | Compile-time safety across the API layer, store, and components. |
| 12 | **Reviews on the detail page are optional** and only added if time allows. | They appear in the mockup but not in the required field list. | Required scope is prioritized. The API already returns reviews, so this is low effort later. |

## Project structure (planned)

```
src/
  app/            store, typed hooks, router
  services/       RTK Query API slice and API types
  features/
    listing/      listing slice, selectors, hooks, listing page, filter components
    product/      product detail page
  components/     layout, header, rating, image with fallback, skeleton, error/empty states
  utils/          filterProducts, paginate, format (pure and unit-tested)
  styles/         design tokens and global styles
```

## Setup instructions

*(To be verified and finalized after implementation.)*

Prerequisites: Node.js (current LTS) and npm.

```bash
npm install
npm run dev       # start the dev server
npm run build     # production build
npm run lint      # lint
npm test          # unit tests
```

## Assumptions

- Brands are derived from the fetched products and some products have none.
- The catalog is small enough to load per category. `total` is read from the API and never hardcoded.
- Categories are single-select, and search is scoped to the current category.

## Improvements with more time

- Server-side filtering for large catalogs
- Multi-category selection and sort options
- Persisting listing state across sessions
- Reviews section and an image gallery on the detail page
- End-to-end tests (Playwright) and a CI pipeline

## Submission links

- GitHub repository: *to be added*
- Live demo: *to be added*
