import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { quoteCustomerPrice } from "../pricing";
import { inventoryView, reserveStock, applySupplierStock } from "../inventory";
import { mapCategory, mapMaterial, mapOrderStatus } from "../mappings";
import { mappedCsvProducts, parseCsv } from "../csv";
import { encryptCredentials, decryptCredentials, redactCredentials } from "../credentials";
import { ingestWebhook, resetIntegrationEngine, MOCK_SUPPLIER } from "../engine";
import { runSandboxScenario } from "../scenario";
import {
  importProducts,
  getImportedProducts,
  routePaidOrder,
  setProductPermissions,
  approveAndPublish,
  previewImport,
  upsertIntegration,
  getFulfillments,
} from "../engine";
import { mockHub } from "../connectors/mock";

process.env.NODE_ENV = "test";
process.env.INTEGRATIONS_PERSIST = "memory";

beforeEach(() => {
  resetIntegrationEngine(true);
  mockHub.reset();
});

describe("pricing", () => {
  it("applies 20% supplier margin with nearest-9 rounding", () => {
    const quote = quoteCustomerPrice(700, [
      { id: "s", method: "PERCENT_MARGIN", value: 20, rounding: "nearest_9", supplierId: "a", priority: 10 },
    ], { supplierId: "a" });
    assert.equal(quote.supplierCost, 700);
    assert.ok(quote.customerPrice >= 839);
    assert.equal(quote.lossRisk, false);
  });

  it("flags a large supplier cost increase", () => {
    const quote = quoteCustomerPrice(1100, [
      { id: "s", method: "PERCENT_MARGIN", value: 20, rounding: "none", supplierId: "a", priority: 10 },
    ], { supplierId: "a", previousCost: 700 });
    assert.ok(quote.flaggedChange);
    assert.ok((quote.flaggedChange?.changePercent || 0) >= 50);
  });

  it("product override beats supplier rule", () => {
    const quote = quoteCustomerPrice(1000, [
      { id: "sup", method: "PERCENT_MARGIN", value: 10, rounding: "none", supplierId: "a", priority: 10 },
      { id: "prod", method: "FIXED_MARGIN", value: 400, rounding: "none", supplierId: "a", productId: "p1", priority: 50 },
    ], { supplierId: "a", productId: "p1" });
    assert.equal(quote.customerPrice, 1400);
  });
});

describe("inventory", () => {
  it("never lets available go negative", () => {
    const view = inventoryView({ supplierStock: 10, reserved: 3 });
    assert.equal(view.available, 7);
    assert.throws(() => reserveStock(view, 8));
    const next = applySupplierStock(view, 0);
    assert.equal(next.status, "OUT_OF_STOCK");
    assert.equal(next.available, 0);
  });
});

describe("mappings", () => {
  it("maps supplier categories via config then hints", () => {
    const mapped = mapCategory("Topwear", [
      { id: "1", supplierId: "s", supplierCategory: "Topwear", cheshireCategory: "hoodies" },
    ], "s");
    assert.equal(mapped, "hoodies");
    assert.equal(mapCategory("Jeans", [], "s"), "denim");
    assert.equal(mapCategory("Bridal Lehenga", [], "s"), "lehengas");
    assert.equal(mapCategory("Banarasi Saree", [], "s"), "sarees");
    assert.equal(mapCategory("Anarkali Set", [], "s"), "suits");
    assert.equal(mapMaterial("Pure chanderi weave", []), "Chanderi Silk");
    assert.equal(mapMaterial("Organic cotton jersey", []), "Organic Cotton");
    assert.equal(mapOrderStatus("dispatched", [], "s"), "shipped");
  });
});

describe("csv import", () => {
  it("maps columns and reports row errors", () => {
    const text = "name,sku,price,stock\nTemple Bell,SKU1,700,10\n,SKU2,abc,1";
    const parsed = parseCsv(text);
    const { items, errors } = mappedCsvProducts(parsed.rows, {
      name: "name",
      sku: "sku",
      price: "price",
      stock: "stock",
    });
    assert.equal(items.length, 2);
    assert.ok(errors.some((e) => e.includes("invalid price")));
  });
});

describe("credentials", () => {
  it("round-trips encryption and redacts secrets", () => {
    const enc = encryptCredentials({ apiKey: "super-secret-key", baseUrl: "https://example.test" });
    assert.equal(enc.includes("super-secret-key"), false);
    const dec = decryptCredentials(enc);
    assert.equal(dec.apiKey, "super-secret-key");
    const redacted = redactCredentials(dec);
    assert.equal(String(redacted.apiKey).includes("super"), false);
    assert.equal(redacted.baseUrl, "https://example.test");
  });
});

describe("webhooks", () => {
  it("is idempotent on duplicate eventId", () => {
    const first = ingestWebhook({
      eventId: "evt-1",
      supplierId: MOCK_SUPPLIER.id,
      type: "ORDER_SHIPPED",
      payload: { remoteOrderId: "x" },
    });
    const second = ingestWebhook({
      eventId: "evt-1",
      supplierId: MOCK_SUPPLIER.id,
      type: "ORDER_SHIPPED",
      payload: { remoteOrderId: "x" },
    });
    assert.equal(first.status, "processed");
    assert.equal(second.status, "duplicate");
  });
});

describe("duplicate products", () => {
  it("updates existing supplierProductId instead of duplicating", async () => {
    await importProducts(MOCK_SUPPLIER.integrationId, { selectedIds: ["mjh-01"] });
    await importProducts(MOCK_SUPPLIER.integrationId, { selectedIds: ["mjh-01"] });
    const rows = getImportedProducts(MOCK_SUPPLIER.id).filter((p) => p.supplierProductId === "mjh-01");
    assert.equal(rows.length, 1);
  });
});

describe("sandbox e2e", () => {
  it("runs the mock supplier journey including fail-safe retry", async () => {
    const result = await runSandboxScenario();
    const failed = result.steps.filter((s) => !s.ok);
    assert.equal(failed.length, 0, failed.map((f) => f.step).join("; "));
  });
});

describe("multi-supplier order", () => {
  it("splits one customer order into two fulfillments", async () => {
    upsertIntegration({
      supplierId: "sup-b",
      supplierName: "House B",
      providerId: "mock-jewellery-hub",
    });
    await importProducts(MOCK_SUPPLIER.integrationId, { selectedIds: ["mjh-01"] });
    const a = getImportedProducts(MOCK_SUPPLIER.id)[0];
    setProductPermissions(a.id, { imageUsagePermission: "APPROVED", contentPermissionStatus: "APPROVED" });
    approveAndPublish(a.id);

    const preview = await previewImport(MOCK_SUPPLIER.integrationId, 2);
    assert.ok(preview.items.length >= 1);

    const routed = await routePaidOrder({
      cheshireOrderNumber: "CHS-MULTI",
      paymentStatus: "PAID",
      shipping: {
        fullName: "A Buyer",
        phone: "9000000000",
        line1: "Street",
        city: "Pune",
        state: "MH",
        pincode: "411001",
      },
      items: [
        {
          productId: a.id,
          sku: a.sku,
          name: a.title,
          quantity: 1,
          productType: "dropship",
          supplierId: MOCK_SUPPLIER.id,
        },
        {
          productId: "manual-b",
          sku: "HOUSE-B-1",
          name: "House B Tee",
          quantity: 1,
          productType: "marketplace",
          supplierId: "sup-b",
        },
      ],
    });
    assert.equal(routed.fulfillments.length, 2);
    assert.equal(new Set(routed.fulfillments.map((f) => f.supplierId)).size, 2);
    assert.equal(getFulfillments().filter((f) => f.cheshireOrderNumber === "CHS-MULTI").length, 2);
  });
});
