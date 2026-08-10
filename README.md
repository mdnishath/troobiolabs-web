# TROO Bio-Labs — Headless E-Commerce Storefront

Pixel-perfect Next.js storefront for TROO Bio-Labs research peptides, built from
the Claude Design handoff bundle (`troobiolabs-website-design`) and the client's
Shopify product exports.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** — design tokens extracted from the design bundle
- **Framer Motion** — hero carousel, scroll reveals, cart drawer, accordions
- **Zustand** — persistent cart (`troobio_cart`) + UI state
- **TanStack Query** — catalog fetching with server-seeded `initialData`
- **WordPress / WooCommerce** — optional live backend via REST (see below)

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (all 30 PDPs prerendered)
npm run lint
```

## Data pipeline

The catalog is generated from the client's Excel exports in the parent folder:

```bash
npx tsx scripts/build-catalog.ts
```

- Parses `Troo Bio-Labs Products & Descriptions.xlsx` (primary; rich text
  descriptions, mechanism of action, references) and `products_export(1).xlsx`
- Converts Shopify rich-text JSON metafields to HTML
- Maps the 41 product photos in `Product Images/<Category>/` and 13 purity COA
  PDFs in `pdf/` into `public/`
- Emits `src/data/catalog.json` — 30 products, 6 categories (5 peptide
  disciplines + lab supplies)

## WooCommerce integration

The app runs standalone on the local catalog by default. To connect a live
WordPress/WooCommerce backend:

1. Copy `.env.example` → `.env.local` and fill in `WC_API_URL`,
   `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`.
2. Seed the store from the catalog (categories, variable products, size
   variations, all scientific metadata):
   ```bash
   npx tsx scripts/seed-woocommerce.ts          # or --dry-run to preview
   ```
3. Set `NEXT_PUBLIC_DATA_SOURCE=woo` — the data provider
   (`src/lib/api/provider.ts`) switches to the WooCommerce REST API, and
   `/api/checkout` creates real orders (status: pending payment).

## Structure

```
scripts/            build-catalog.ts, seed-woocommerce.ts
src/app/            routes: /, /shop, /product/[id], /cart, /checkout,
                    /lab-reports, /faq, /contact, /about, /science, /quality,
                    /policies, /blog, /account + /api/products, /api/checkout
src/components/     home/, shop/, product/, cart/, layout/, motion/, ui/
src/store/          cart.ts (persisted), ui.ts
src/lib/            types, provider abstraction, home content, utils
src/data/           catalog.json (generated)
public/images/      product photos, category section renders, photography
public/docs/coa/    real third-party purity certificates (PDF)
```

## Notes

- Ratings/review counts are deterministic placeholders (no review data in the
  source exports); lot numbers shown on the homepage carousels are the design
  prototype's placeholder values until per-batch data comes from WooCommerce.
- The account area uses the design's demo persona pending WooCommerce customer
  auth.
- All products are research compounds — RUO messaging and the checkout
  research-use acknowledgment are implemented as designed.
