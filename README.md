# CHESHIRE

Contemporary aesthetic jewellery commerce ecosystem.

**Brand line:** Luxury without trying too hard.

## Monorepo

```
apps/
  web/      Next.js storefront (Vercel)
  admin/   CMS / operations dashboard (Vercel)
  api/     Node.js REST API
  mobile/  Expo React Native (Android + iOS)
packages/
  types/       Shared TypeScript contracts
  config/      Brand, nav, SEO defaults
  utils/       Money, shipping, helpers
  database/    Prisma schema + seed catalogue
  api-client/  Typed HTTP client
  ui/          Shared UI primitives
  commerce/    Commission, cart orchestration, affiliate
  integrations/ Supplier connectors, import, routing, mock hub
```

## Quick start (web)

```bash
cd cheshire
cp .env.example .env
npm install
npm run dev:web
```

Open [http://localhost:3000](http://localhost:3000).

The storefront ships with a **32-product local catalogue** so you can design and shop without Postgres on day one.

## API

```bash
npm run dev:api
```

Health: `GET http://localhost:4000/health`

## Admin

```bash
npm run dev:admin
```

Open [http://localhost:3001](http://localhost:3001).

## Database

Requires PostgreSQL.

```bash
# set DATABASE_URL in .env
npm run db:generate
npm run db:push
npm run db:seed
```

## Mobile

Mobile is intentionally **outside** the root npm workspace (React 18 / Expo vs React 19 on web).

```bash
cd apps/mobile
npm install
npx expo start
```

Bundle ID: `com.cheshire.jewellery`

Deep links / App Links are configured in `app.json` for `/products/*`.

## Payments

Razorpay is wired to **your personal account keys** (copied from `reviewflow-ai/.env.local` into):

- `cheshire/.env`
- `cheshire/apps/web/.env.local`
- `cheshire/apps/api/.env`

Checkout flow:

1. Create order → `POST /api/payments/razorpay/create`
2. Open Razorpay Checkout modal
3. Verify signature → `POST /api/payments/razorpay/verify`

Required env:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` (same as key id)

Card data never touches CHESHIRE servers.

To refresh keys from ReviewFlow:

```bash
node scripts/copy-razorpay-keys.js
```

Switch to live keys in Razorpay Dashboard when ready (`rzp_live_...`).

## Design system

| Token | Value |
| --- | --- |
| Ivory | `#F7F5F0` |
| Soft black | `#111111` |
| Charcoal | `#242424` |
| Metallic | `#B8B8B8` |
| Serif | Cormorant Garamond |
| Sans | Manrope |

## Phase map

| Phase | Status in this repo |
| --- | --- |
| 1 Brand + design system | Done |
| 2–6 Web commerce UX | Done (homepage → PDP → cart/wishlist) |
| 7–10 Auth / API / checkout / orders | Working local flows + mixed-cart orchestration |
| 11–13 Admin / rewards / stylist | Admin commerce dashboards + supplier portal |
| 14–15 Mobile + deep links | Expo app scaffold (same API contracts) |
| 16–22 Analytics / SEO / perf / stores | SEO + policies + affiliate disclosure |
| Commerce models | Affiliate + dropship + marketplace architecture in `@cheshire/commerce` + Prisma |

Existing Cheshire catalogue, visual identity, Razorpay checkout, and local 32+ product shop still work without Postgres.

## Three fulfilment models

Customers see one premium store. Behind the scenes:

- **Affiliate** — Buy from Partner tracks the click and redirects. Cheshire does not take payment.
- **Dropshipping** — Cheshire checkout, supplier fulfilment, Cheshire keeps the margin.
- **Marketplace** — Cheshire checkout, supplier fulfilment, Cheshire keeps commission.

Mixed bags are split automatically at checkout.

## Supplier integrations

Reusable connectors live in `packages/integrations`. Cheshire does **not** hardcode jewellery houses.

- Mock hub: sandbox catalog, stock, orders, tracking
- Manual / CSV: houses with no API
- Generic API / Shopify / WooCommerce / XML: pending adapters (never reported as live)

Admin: [http://localhost:3001/integrations](http://localhost:3001/integrations)

```bash
npm test --workspace=@cheshire/integrations
```

See `packages/integrations/README.md`.

## Supplier portal

Open [http://localhost:3000/supplier](http://localhost:3000/supplier) (demo house: `atelier@lumen.example`).

Apply at `/supplier/apply`.
| Commerce models (affiliate / dropship / marketplace) | Architecture live — customer site stays a luxury store |

Three fulfilment modes sit behind the same CHESHIRE storefront. Customers never see supplier cost. Affiliate clicks go through `/api/affiliate/go/[slug]`. Dropship and marketplace share Cheshire checkout and split into supplier orders. Admin (`:3001`) and supplier desk (`/supplier`) operate the back office.

Partner applications: `/partners`. Affiliate disclosure: `/policies/affiliate-disclosure`.

## Replace product photography

All catalogue images use Unsplash placeholders via `packages/database/src/catalog.ts`.

Swap `imageIds` / `productImage()` for Cloudinary public IDs when assets are ready.

## Store readiness

- Privacy / Terms / Refund / Shipping / Returns pages under `/policies/*`
- Account deletion entry in account area
- App Store / Play package IDs configured
- Notification preference model in Prisma + account UI
