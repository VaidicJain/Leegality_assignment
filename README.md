# Leegality Frontend Assessment: Product Listing and Detail

An Amazon-style product browsing app built on the public [DummyJSON Products API](https://dummyjson.com/docs/products). It has two screens: a filterable, paginated **Product Listing** and a **Product Detail** page.

> **Project status:** Steps 1–6 are implemented (Foundation, RTK Query API layer, React Router, Layout & Header matching mockups, Listing slice reducers with single page-reset, bidirectional URL synchronization, Product Card & Grid, Skeletons, Error/Retry/Empty states, shadcn Pagination, and Filter Sidebar with dynamic categories, min/max price range with Apply button, brand multi-select, and sidebar search). Step 7 (Product Detail page) is next. Sections marked *(planned)* describe the agreed design and will be updated to match the final implementation. Demo and repository links will be added once they exist.

## Table of contents

1. [Overview](#overview)
2. [Tech stack](#tech-stack)
3. [Features (planned)](#features-planned)
4. [Architecture](#architecture)
5. [Decision log](#decision-log)
6. [Project structure](#project-structure)
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
- **Vite** for tooling, **Vitest** and **React Testing Library** for tests, **ESLint** and **Prettier** for code quality

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

RTK Query caches each distinct argument once, so switching back to a category does not refetch it. `limit=0` and `select` are documented DummyJSON features. The API tests assert that the app sends them (see Decision 3 and the API layer below).

### API layer

All requests go through one RTK Query slice. `src/services/api.ts` holds only the shared configuration (base URL, base query, cache lifetime) and has no endpoints. **Each query lives in its own file** under `src/services/queries/` and attaches itself to the slice with `api.injectEndpoints`, so adding an endpoint means adding one file and one barrel line.

| Hook | File | Endpoint | Notes |
|---|---|---|---|
| `useGetCategoriesQuery()` | `getCategories.ts` | `GET /products/categories` | Returns `{ slug, name, url }` objects |
| `useGetProductsQuery(paging)` | `getProducts.ts` | `GET /products` | `{}` means the whole catalog (`limit=0`), with only the listing fields selected |
| `useGetProductsByCategoryQuery({ category, ...paging })` | `getProductsByCategory.ts` | `GET /products/category/{slug}` | Same defaults, cached per category |
| `useGetProductByIdQuery(id)` | `getProductById.ts` | `GET /products/{id}` | Full product including description, images, and reviews |

Components import hooks from `@/services/queries` (the barrel), which guarantees every query is registered. `listParams.ts` holds the `select` field list and the limit/skip defaults shared by the two list queries.

- List responses keep the server `total`, so the listing step can verify the dataset is complete instead of silently filtering a truncated one.
- Conditional requests use `skipToken` in the hooks' callers, for example when a route id is not a number.
- `src/services/errors.ts` maps any RTK Query error to a friendly message and detects 404s.

### State management

- **RTK Query** owns all server state. API data is never copied into Redux slices or component state.
- A **listing slice** owns shared, serializable UI state: `category`, `search`, `minPrice`, `maxPrice`, `brands`, and `page`. The state shape is defined; its reducers arrive with the routing and listing-state step.
- Every filter-changing reducer resets `page` to 1 in one place. Only `setPage` leaves it alone *(planned)*.
- Derived values (filtered products, brand options, total pages) come from selectors and are never stored *(planned)*.
- Local component state is limited to temporary UI: unsubmitted price inputs, the search input text, and the mobile filter drawer *(planned)*.
- The store is created by a `setupStore` factory (with an optional preloaded state) so tests get isolated stores. Components use the pre-typed `useAppDispatch` and `useAppSelector` hooks.

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
| 13 | **TypeScript is pinned to `>=5.9.0 <6.1.0`.** | The Vite template installed TypeScript 7.0.2, which conflicts with the supported peer range of the latest `typescript-eslint` (`<6.1.0`). Pinning avoids `--legacy-peer-deps`, which would hide an unsupported combination. | Clean, supported install. Revisit the pin once `typescript-eslint` supports TypeScript 7. |
| 14 | **Explicit strict compiler flags:** `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `forceConsistentCasingInFileNames`. `exactOptionalPropertyTypes` is deliberately not enabled. | The Vite template did not set `strict` explicitly. `noUncheckedIndexedAccess` forces handling of `undefined` on array and index access. `exactOptionalPropertyTypes` adds friction with React and library typings for little benefit here. | Safer code and more explicit handling of optional data such as missing brands. A little more narrowing code. |
| 15 | **`@/` path alias** configured in both `tsconfig.app.json` and `vite.config.ts` (and therefore Vitest). | Avoids deep relative imports such as `../../../app/store`. | Cleaner imports. The two configs must stay in sync. |
| 16 | **Light theme only and a system font stack.** | No external font requests (faster, no layout shift), and a single well-tested theme for the assessment. | No dark mode. Tokens are semantic, so adding a dark theme later is a contained change. |
| 17 | **Two-tier design tokens:** a raw palette plus semantic tokens (`--color-primary`, `--color-text-muted`, and so on), alongside spacing, type, radius, shadow, layout, motion, and z-index scales. | Consistent UI, and components never reference raw colors. | Restyling or theming is changed in one file. Muted text and primary colors meet WCAG AA contrast on white. |
| 18 | **`setupStore` factory plus pre-typed hooks.** The listing slice is created now as a typed state skeleton with no reducers. | A store needs at least one valid reducer. Defining the typed state now makes `RootState` meaningful. Behavior is deliberately left for the listing-state step. | Tests get isolated stores. No product behavior exists yet. |
| 19 | **Vitest with explicit imports (no globals)** and an explicit Testing Library `cleanup` in the setup file. | Keeps test files type-safe and explicit, with no hidden globals. | Tests import `describe`, `it`, and `expect` from `vitest`. |
| 20 | **Folders are created only when they hold files.** | Git does not track empty folders, and placeholder files add noise. | The structure below fills in as features land. |
| 21 | **Prettier** (no semicolons, single quotes, trailing commas, 100 columns). `README.md` is excluded. | Consistent formatting that matches the scaffold's existing style. | `npm run format:check` can be used in review or CI. Prettier would otherwise reflow the Markdown tables. |
| 22 | **Four RTK Query endpoints that map 1:1 to the API**, sharing one params helper. List endpoints return the full response (including `total`), not just the array. | Matches the brief and the API docs, so reviewers can trace each hook to an endpoint. Keeping `total` lets the listing detect an incomplete dataset. | Callers read `data.products`. A tiny conditional hook is added in the filtering step to choose between the two list endpoints with `skipToken`. |
| 23 | **The `select` field list is declared once** and checked against the `ProductSummary` type with `satisfies`. The detail endpoint returns the full `Product`. | Smaller list payloads (about 7 fields instead of 20+, with no reviews or images), and the compiler rejects a misspelled field. | Faster first load and cache. List items lack `description`, which only the detail page needs. |
| 24 | **`keepUnusedDataFor: 600` and no `setupListeners`** (no refetch on window focus or reconnect). | The catalog is static fake data. The default 60 seconds would refetch the catalog (and show a skeleton) if a user lingers on a detail page and returns. Focus refetching would only add requests. | Instant Back navigation and fewer requests. Data can be up to 10 minutes old, and the Retry button still forces a fresh request. |
| 25 | **List endpoints take an argument object** and callers pass `{}` for the full catalog. | RTK Query builds cache keys from arguments, so `{}` and `{ limit: 0 }` would be separate cache entries. Using one canonical call shape keeps one entry per dataset. | A single convention to follow. The README and endpoint comment document it. |
| 26 | **Central error helpers** (`getApiErrorMessage`, `isNotFoundError`). | One place maps network, timeout, parsing, 404, and 5xx errors to user-facing text, which the listing and detail pages will share. | Consistent messages and no duplicated status checks in components. |
| 27 | **API tests run in the Node environment with a stubbed `fetch`.** | jsdom's `AbortSignal` is rejected by Node's `Request`, which breaks RTK Query tests. The API layer needs no DOM. | Fast, deterministic tests with no network access. They cover URLs, parameters, caching, a 404, and a network failure. |
| 28 | **One file per query under `src/services/queries/`**, attached to a shared base API with `injectEndpoints` and exposed through a barrel (`index.ts`). The shared base (`api.ts`) has no endpoints. | A single endpoints file grows without bound as the API surface grows. Per-query files keep each change small and reviewable, and the store still needs only one reducer and one middleware. | New endpoint = one file, its test, and one barrel line. Tests sit next to each query and share helpers in `src/test/apiTestUtils.ts`. Components must import hooks from the barrel so every query is registered. |

## Project structure

Current:

```
src/
  app/            store.ts, hooks.ts (+ store test)
  features/
    listing/      listingSlice.ts (state shape only for now)
  services/       api.ts (base RTK Query slice), types.ts, errors.ts (+ test)
    queries/      one file (+ test) per query, listParams.ts, index.ts (barrel)
  styles/         tokens.css, global.css
  test/           setup.ts, apiTestUtils.ts
  App.tsx         temporary shell
  main.tsx        entry point with the Redux Provider
```

Planned additions: `components/` (layout, header, rating, image, skeleton, error and empty states), `utils/` (`filterProducts`, `paginate`, `format`), `features/product/`, and the listing UI components.

## Setup instructions

*(Finalized after implementation.)*

Prerequisites: Node.js (current LTS) and npm.

```bash
npm install
npm run dev           # start the dev server
npm run build         # type-check and production build
npm run typecheck     # type-check only
npm run lint          # lint
npm run format:check  # check formatting (npm run format to fix)
npm test              # unit tests
```

## Assumptions

- Brands are derived from the fetched products and some products have none.
- The catalog is small enough to load per category. `total` is read from the API and never hardcoded.
- Categories are single-select, and search is scoped to the current category.

## Improvements with more time

- Server-side filtering for large catalogs
- Multi-category selection and sort options
- Persisting listing state across sessions
- Dark theme
- Reviews section and an image gallery on the detail page
- End-to-end tests (Playwright) and a CI pipeline

## Submission links

- GitHub repository: *to be added*
- Live demo: *to be added*
