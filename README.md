# Leegality Frontend Assessment: Product Listing and Detail

An Amazon-style product browsing app built on the public [DummyJSON Products API](https://dummyjson.com/docs/products). It has two screens: a filterable, paginated **Product Listing** and a **Product Detail** page.

## Submission links

- **GitHub repository:** `<ADD GITHUB REPOSITORY URL>`
- **Live demo:** `<ADD VERCEL DEMO URL>`

## Table of contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech stack](#tech-stack)
4. [Setup instructions](#setup-instructions)
5. [Assumptions](#assumptions)
6. [Architectural decisions](#architectural-decisions)
7. [Project structure](#project-structure)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Improvements with more time](#improvements-with-more-time)

## Overview

| Route | Screen | Purpose |
|---|---|---|
| `/` | Product Listing | Filter sidebar (category, price, brand), search, product grid, pagination |
| `/product/:id` | Product Detail | Image, title, price, rating, description, brand, category, Back to Products |

## Features

- **Listing:** product cards with image, title, price, and rating. Clicking a card opens `/product/:id`.
- **Filters:**
  - Categories are loaded dynamically from `GET /products/categories`.
  - Min/max price is applied with an Apply button.
  - Brands are multi-select, derived from the fetched products.
  - Header and sidebar search is also available.
  - All filters combine, update the list immediately, and reset pagination to page 1.
- **Active-filter chips** with a "Clear all" action.
- **Pagination** (20 products per page) with a "Showing X–Y of N products" count that reflects the filtered set.
- **Loading, error, and empty states:** skeleton cards, an error message with Retry, and an empty-result state with a clear-filters action.
- **Detail page:** image gallery, title, price, rating, description, brand, category, and customer reviews. It shows a not-found state for unknown ids and an invalid-id state for non-numeric ids.
- **State preservation:** filters, search, and page survive going to a product and back via "Back to Products".
- **Shareable URLs:** for example `/?category=laptops&minPrice=100&maxPrice=1500&brand=Apple&page=2`. Browser Back/Forward steps through filter changes.
- **Responsive layout:** the filter sidebar is a drawer on mobile, and the layout adapts from mobile to desktop. Buttons and links have visible focus styles, and the search box and sidebar controls are keyboard-operable.

## Tech stack

- **React 19** (functional components and hooks) with **TypeScript** in strict mode
- **Redux Toolkit** for shared UI state and **RTK Query** for all API fetching, caching, and error handling
- **React Router** for routing
- **Tailwind CSS v4** for styling (allowed by the brief), with `lucide-react` icons and a small pagination component. No heavy UI library.
- **Vite** for tooling, **Vitest** and **React Testing Library** for tests, **ESLint** and **Prettier** for code quality

## Setup instructions

**Prerequisites:** Node.js 20.19+ or 22.12+ (required by Vite) and npm.

```bash
npm install
npm run dev           # start the dev server (Vite prints the local URL)
npm run build         # type-check and production build into dist/
npm run preview       # serve the production build locally
npm test              # run unit tests once (npm run test:watch for watch mode)
npm run typecheck     # type-check only
npm run lint          # lint
npm run format:check  # check formatting (npm run format to fix)
```

No environment variables or API keys are needed. The API base URL (`https://dummyjson.com`) is set in `src/services/api.ts`.

## Assumptions

- **Brands** are derived from the fetched products, and some products (for example groceries) have no brand. They are left out of the brand list and are hidden only while a brand is selected.
- **Catalog size:** the whole category-scoped catalog is small enough to load in one request. The app reads `total` from the API and never hardcodes it.
- **Category** is single-select, and search is scoped to the currently selected category.
- **Price range** is inclusive, and an empty min or max means "no limit".
- **Cart, account, and menu icons** in the header come from the mockup and are decorative. Cart, authentication, and checkout were out of scope.
- **Direct links:** `/product/:id` works as a first page load and does not depend on listing history.

## Architectural decisions

### Data and filtering strategy

DummyJSON can filter by category only. It cannot filter by price or brand, and brands can only be discovered from fetched products. Paginating on the server first and filtering afterwards would give wrong totals and sparse pages. So:

1. Fetch the whole category-scoped set once, using `limit=0` and `select=` to keep the payload small.
   - No category: `GET /products?limit=0&select=...`
   - With a category: `GET /products/category/{slug}?limit=0&select=...`
2. Apply search, price, and brand filters in one pure function (`src/utils/filterProducts.ts`).
3. Derive brand options from the current set.
4. Paginate the filtered result client-side (20 per page).

RTK Query caches each distinct argument once, so switching back to a category does not refetch it. The trade-off is that this does not scale to a very large catalog, where server-side filtering would be needed.

### API layer (RTK Query)

All requests go through one RTK Query slice. `src/services/api.ts` holds only shared configuration (base URL, base query, cache lifetime). **Each query lives in its own file** under `src/services/queries/` and attaches itself with `api.injectEndpoints`, so adding an endpoint means adding one file and one barrel line.

| Hook | Endpoint |
|---|---|
| `useGetCategoriesQuery()` | `GET /products/categories` |
| `useGetProductsQuery({})` | `GET /products` |
| `useGetProductsByCategoryQuery({ category })` | `GET /products/category/{slug}` |
| `useGetProductByIdQuery(id)` | `GET /products/{id}` |

- List endpoints request only the fields the cards need (`select`), and the field list is checked against the `ProductSummary` type with `satisfies`. The detail endpoint returns the full product, including reviews and images.
- `skipToken` and the `skip` option avoid invalid or unnecessary requests, for example when the route id is not a number.
- `keepUnusedDataFor: 600` keeps the static catalog cached for 10 minutes, so "Back to Products" is instant. Focus-refetching is not enabled.
- `src/services/errors.ts` maps network, timeout, parsing, 404, and 5xx errors to friendly messages.

### State management

- **RTK Query owns all server state.** API data is never copied into Redux slices or component state.
- A **listing slice** owns shared, serializable UI state: `category`, `search`, `minPrice`, `maxPrice`, `brands`, and `page`.
- **One reducer, one reset:** every filter change goes through `filtersChanged`, which resets `page` to 1 and clears brands when the category changes. Components cannot forget to reset the page.
- Derived values (filtered products, brand options, page count) are computed from the fetched data and filters, and are never stored.
- Local component state is limited to temporary UI: unsubmitted price and search inputs, and the mobile filter drawer.
- The store is created by a `setupStore` factory so tests get isolated stores.

### State preservation and URLs

Redux is the live state, so filters and page survive `/` to `/product/:id` and back. `useListingUrlSync` keeps the URL and Redux in step in both directions:

- **URL changed** (browser Back/Forward, pasted link): the URL is loaded into Redux, and invalid values (such as `?page=0`) are cleaned up.
- **Redux changed** (user picks a filter): a history entry is pushed, so Back steps through filter changes.
- **First load:** a URL with parameters wins (deep link). A bare `/` is filled from Redux (returning from a product page) without adding a history entry.

"Back to Products" links to the listing URL built from the saved filters (`/?category=...&page=2`), so it also works after a direct visit to a product URL.

### Decision log

| # | Decision | Reason |
|---|---|---|
| 1 | Price filter applies on **Apply** (or Enter). Category, brand, and search apply instantly. | Matches the mockup. Live filtering on partial input causes flicker and meaningless intermediate results, and Apply gives a place to validate (min greater than max shows an inline error). |
| 2 | Search is **client-side** over title, brand, and category (all words must match), not `GET /products/search`. | The server search cannot be combined with category, price, and brand, so client-side search composes correctly with every other filter. |
| 3 | Fetch the full category-scoped set and **filter and paginate on the client**, 20 per page. | The API cannot filter by price or brand, so server-side pagination would give wrong counts. |
| 4 | Category is **single-select**. | The category endpoint is per category, and the mockup shows one selected category. |
| 5 | Changing category **clears selected brands**. Price and search are kept. | Brand options depend on the category, so old selections could become invalid or hidden. |
| 6 | **Two-way URL sync** with Redux as the live state. | Gives shareable links, working browser Back/Forward, and preserved filters across routes. |
| 7 | **Vite plus React Router**, not Next.js. | The brief calls for React Router. A single-page app needs an SPA rewrite for deep links, provided in `vercel.json`. |
| 8 | **Tailwind CSS v4** with `lucide-react`, no component library. | Allowed by the brief, fast to build consistently, and light. |
| 9 | **Strict TypeScript** (`strict`, `noUncheckedIndexedAccess`), no `any`, and a `@/` path alias. | Compile-time safety, which matters for optional data such as missing brands. |
| 10 | TypeScript is pinned to `>=5.9.0 <6.1.0`. | The newest TypeScript conflicts with the supported peer range of `typescript-eslint`, and pinning avoids `--legacy-peer-deps`. |
| 11 | One file per query, attached with `injectEndpoints` and exposed through a barrel (`queries/index.ts`). | Keeps each endpoint small and reviewable. The store still needs only one reducer and one middleware. |
| 12 | List endpoints take an argument object, and callers pass `{}` for the full catalog. | RTK Query builds cache keys from arguments, so one canonical call shape gives one cache entry per dataset. |
| 13 | Products without a brand get **no "Unbranded" option**. | Keeps the brand list clean. Unbranded products stay visible until a brand is chosen. |
| 14 | Light theme and a system font stack. | No external font requests and a single well-tested theme. |

## Project structure

```
src/
  app/            store.ts (setupStore), hooks.ts (typed hooks)
  components/
    common/       ErrorState, EmptyState, Rating
    filters/      FilterSidebar
    layout/       Layout, Header, Footer
    product/      ProductCard, ProductGrid, ProductCardSkeleton
    ui/           pagination
  features/
    listing/      listingSlice, listingQuery (URL parse/serialize), selectors,
                  useListingUrlSync, useListingPath
  pages/          ListingPage, ProductDetailPage, NotFoundPage
  services/       api.ts, types.ts, errors.ts
    queries/      one file per endpoint, listParams.ts, index.ts (barrel)
  styles/         tokens.css, global.css
  tests/          all tests, mirroring the source folders
    helpers/      shared fetch mocking and fixtures
  utils/          filterProducts.ts, cn.ts
  App.tsx         routes
  main.tsx        entry point with the Redux Provider
```

## Testing

Run `npm test`. All tests live under `src/tests/`, mirroring the source folders:

- the RTK Query layer (request URLs and parameters, caching per argument, 404 and network errors) with a stubbed `fetch` and no network access
- the error helpers
- the store setup
- the listing slice (page reset, brand reset on category change) and the listing URL parse/serialize helpers
- an app smoke test

The filtering function, URL-sync hook, and page components are covered by manual testing only. Adding automated tests for them is listed below.

## Deployment

The app is a static Vite build (`npm run build`, output `dist/`). `vercel.json` rewrites every path to `index.html`, so direct visits and refreshes on `/product/:id` and filtered listing URLs work on Vercel. On Vercel, import the repository and use the Vite preset (build command `npm run build`, output directory `dist`).

## Improvements with more time

- Automated tests for `filterProducts`, the URL-sync hook, the filter sidebar, and the listing and detail pages, plus end-to-end tests (Playwright) and a CI pipeline
- Server-side filtering and pagination for a large catalog
- Multi-category selection and sort options
- Scroll-position restoration when returning to the listing
- Dark theme
- A working cart and navigation menu (the header icons are placeholders)
- Accessibility audit with automated checks, and a focus trap and Escape-to-close for the mobile filter drawer
