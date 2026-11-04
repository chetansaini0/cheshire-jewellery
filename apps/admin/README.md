# CHESHIRE Admin (apps/admin)

Ops dashboard for the storefront — Next.js 15, port 3001 (`npm run dev:admin`).

## Data sources

| Area | Source | Real or demo |
| --- | --- | --- |
| Products, categories, fabrics, sizes, prices, images | `packages/database/src/catalog.ts` + local edits | **Real** catalogue |
| Stock by size | Catalogue total split across sizes until edited in the admin | Real totals; per-size split is derived until saved |
| Low-stock alerts, catalogue mix, inventory value | Computed from the above | **Real** |
| Hero banners | `.data/hero-banners.json` → falls back to `heroBanners` in `packages/config` | **Real** (shared with the storefront) |
| Collections, coupons, settings | `.data/admin/*.json` seeded from catalogue / defaults | Real config; seeded coupon usage counts are demo |
| Orders, customers, revenue, AOV, conversion, top products, sales trend | Generated deterministically from the real catalogue (`src/lib/orders.ts`) | **Demo** — labelled "Demo data" in the UI |

There is no database yet. Everything the admin writes goes to JSON files under `<repo>/.data/` (gitignored;
override the location with `CHESHIRE_DATA_DIR`). Replace `src/lib/store.ts` with Prisma calls once a DB exists.

## Banners → storefront

- Admin → Banners writes `.data/hero-banners.json` via `@cheshire/config/banner-store` (validated: max 5 active,
  Unsplash `photo-…` / Pexels `px:<id>` images, internal or https links).
- The storefront home (`apps/web/src/app/page.tsx`) reads the same file server-side. In `next dev` it updates on
  every request; a production build snapshots it at build time.
- Vercel never sees `.data/` (gitignored), so production keeps using the committed defaults in
  `packages/config/src/index.ts`. To ship banner changes to Vercel, copy them into that file and commit.
- The API exposes the same store: `GET /api/content/banners` (public), `GET /api/content/banners/all` and
  `PUT /api/content/banners` (admin JWT).

## Not wired to the storefront yet

Product edits/new products, coupons, collections and settings are admin-side only — the storefront still renders the
committed catalogue and checkout doesn't apply admin coupons.

## Sign-in (ADMIN_PASSWORD)

`src/middleware.ts` protects every page with a password:

| Environment | `ADMIN_PASSWORD` set | Behaviour |
| --- | --- | --- |
| `next dev` (local) | no | Open — no login (convenient on your own machine) |
| any | yes | `/login` page; on success a signed, httpOnly cookie (`ch_admin_session`, 7 days, `Secure` in production) |
| production (`next start`, Vercel) | no | **Locked** — every request gets a 503 page explaining that the password isn't set |

- The cookie is `<expiry>.<HMAC-SHA256(expiry)>`, keyed by `ADMIN_SESSION_SECRET` (optional) or the password, so
  changing the password signs everyone out. Wrong passwords are delayed ~0.8 s.
- Local: put `ADMIN_PASSWORD=…` in `apps/admin/.env.local` (gitignored). Vercel: Project **cheshire-admin** →
  Settings → Environment Variables → `ADMIN_PASSWORD` (Production), then redeploy.
- Sign out with the arrow icon in the top bar.

## Read-only hosting (Vercel)

Vercel's filesystem is read-only, so when `VERCEL` is set (or `CHESHIRE_READ_ONLY=1`) every save returns
**"Saving is only available locally until a database is connected."** as an error toast instead of crashing, and a
"View-only online" strip is shown. Pages still render (catalogue + demo data). Automations don't fire there either.

## Automations (events + webhooks)

Admin → **Automations** lets you send store events to Zapier, Make, n8n, Google Apps Script or your own server.

### Events

| Event | Fired when | `data` fields |
| --- | --- | --- |
| `product.created` | New product saved, or a product duplicated | `sku, name, category, status, price` |
| `product.updated` | Any product field saved (incl. stock edits) | `sku, name, changed[], status` |
| `product.status_changed` | Product moved Active ↔ Draft | `sku, name, from, to` |
| `stock.low` | A save leaves an active product at/below the low-stock threshold (Settings) | `sku, name, totalStock, threshold, lowSizes` |
| `banner.updated` | Banners saved/reset in the admin, or `PUT /api/content/banners` | `activeIds[], total, source` |
| `order.status_changed` | Order status updated on an order page | `orderId, from, to, note?, customerCity?, total?` |
| `coupon.saved` | Coupon created/edited/paused/resumed | `code, type, value, active` |
| `settings.updated` | Settings saved with changes | `changed[]` |

The typed catalogue lives in `packages/config/src/automation.ts` (`AutomationEvents`). To emit from new code:

```ts
import { emitEvent } from "@cheshire/config/automation";
await emitEvent("order.status_changed", { orderId, from, to }, "api"); // never throws
```

Admin server actions call it via `after()` so deliveries never slow down or break a save.

### Delivery format

`POST <your URL>` with `content-type: application/json` and body:

```json
{ "id": "evt_…", "event": "stock.low", "createdAt": "2026-11-02T10:00:00.000Z", "source": "admin", "data": { … } }
```

Headers: `x-cheshire-event`, `x-cheshire-delivery`, `x-cheshire-timestamp` (unix seconds) and
`x-cheshire-signature: sha256=<hex>` where the hex is `HMAC_SHA256(secret, "<timestamp>.<raw body>")`. Each
webhook has its own `whsec_…` secret (shown on the Automations page). Verify in Node:

```js
const expected = "sha256=" + crypto.createHmac("sha256", SECRET).update(`${req.headers["x-cheshire-timestamp"]}.${rawBody}`).digest("hex");
const valid = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(req.headers["x-cheshire-signature"]));
```

### Safety

- The only outbound requests are to webhook URLs you registered (or the **Send test** button). No other external calls.
- `https://` only (`http://` allowed for `localhost`/`127.0.0.1` testing); no credentials in URLs; redirects aren't followed.
- 5-second timeout per request; failures are logged, never retried automatically, and never block the action.
- Stored in `.data/automation/{webhooks,deliveries,events}.json` (gitignored); logs keep the latest 100 entries.
