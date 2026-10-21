# Cheshire supplier integration kit

Cheshire talks to suppliers through **connectors**, not through storefront code.

```
Admin / API  →  Integration engine  →  SupplierConnector  →  mock | csv | manual | pending HTTP
```

A new jewellery house is added by implementing `SupplierConnector` and registering it in `src/connectors/registry.ts`. Core order, product, and commission logic does not change.

## What is live vs pending

| Provider | Status |
|---|---|
| `mock-jewellery-hub` | Sandbox only. Simulates catalog, stock, orders, tracking. |
| `manual` | Operator prints a fulfillment sheet / sends email. |
| `csv` | Column-mapped spreadsheet import. |
| `affiliate` | Redirect + tracking. No Cheshire fulfillment. |
| `generic-api`, `shopify`, `woocommerce`, `xml-feed` | **Integration pending.** Health check never reports a live connection unless a real adapter is written. |

Do not add named factories for OhMyJewellers, Lahiya Drop, etc. until those houses issue credentials and a documented API.

## Environment

```
INTEGRATION_SECRETS_KEY=   # 16+ chars. Encrypts connector credentials at rest.
CHESHIRE_DATA_DIR=         # optional. Defaults to <monorepo>/.data
CHESHIRE_INTEGRATIONS_STORE=
INTEGRATIONS_PERSIST=memory  # tests only

SUPPLIER_SYNC_ENABLED=true
AUTO_ORDER_SUBMISSION_ENABLED=true
AUTO_PRICE_SYNC_ENABLED=false
AUTO_INVENTORY_SYNC_ENABLED=false
WEBHOOKS_ENABLED=true
```

Never commit supplier API keys. Never log decrypted credentials.

## Pricing priority

1. Product override  
2. Category + supplier  
3. Supplier default  
4. Global 20% margin  

Server-side `assertSellableQuote` rejects loss-making lines. Browser prices are never trusted.

## Inventory

`available = max(0, supplierStock - reserved)`

A supplier stock of 0 becomes `OUT_OF_STOCK`. Reserved units are not overwritten by a sync.

## Orders

Paid Cheshire orders are always persisted first.

If the connector `createOrder` fails:

- customer order remains
- fulfillment status = `SUPPLIER_SUBMISSION_FAILED`
- admin alert = `SUPPLIER_ACTION_REQUIRED`
- retry from `/admin/integrations/errors`

Customers never see supplier API errors.

## Webhooks

`POST /api/integrations/webhooks/:supplierId`

Idempotent on `eventId`. If a webhook secret is stored, HMAC-SHA256 `x-cheshire-signature` is required.

## Adding a connector

1. Create `src/connectors/your-house.ts` extending `BaseConnector`.
2. Implement only the methods the house actually supports. Leave the rest as `unsupported()`.
3. Register in `registry.ts`.
4. Cover health, import, and order failure in tests.
5. Keep the storefront luxury UI unchanged.

## Tests

```bash
npm test --workspace=@cheshire/integrations
```

`runSandboxScenario()` is the numbered mock journey (import one SKU, publish, stock 10→5, paid order, tracking, payout, then a failed supplier API with retry).
