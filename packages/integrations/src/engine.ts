import crypto from "node:crypto";
import path from "node:path";
import type { ProductType, SupplierOrderStatus } from "@cheshire/types";
import { getSuppliers } from "@cheshire/commerce";
import { encryptCredentials, decryptCredentials, credentialsPresent } from "./credentials";
import { getFeatureFlags } from "./flags";
import { integrationLog } from "./logging";
import { defaultRateLimiter } from "./rate-limit";
import { quoteCustomerPrice, assertSellableQuote } from "./pricing";
import { applySupplierStock, commitSale, inventoryView, reserveStock } from "./inventory";
import { normalizeSupplierProduct } from "./normalizer";
import { DEFAULT_MATERIAL_MAPPINGS, mapOrderStatus } from "./mappings";
import { canActivateForSales, emptyCompliance, complianceScore } from "./compliance";
import { getConnector, listConnectors, mockHub } from "./connectors/registry";
import { mappedCsvProducts, parseCsv, type CsvColumnMap } from "./csv";
import { persistEnabled, readJsonFile, resolveDataDir, writeJsonFile } from "./persist";
import type {
  BrandingConfig,
  CategoryMapping,
  ComplianceChecklist,
  ConnectorContext,
  ConnectorCredentials,
  ImportedProduct,
  IntegrationAlert,
  IntegrationType,
  InventoryHistoryRow,
  PermissionStatus,
  PriceHistoryRow,
  PricingRule,
  PublicImportedProduct,
  RoutedFulfillment,
  StatusMapping,
  SupplierIntegration,
  SyncKind,
  SyncLog,
  SyncSchedule,
  WebhookRecord,
} from "./types";

const MOCK_SUPPLIER_ID = "sup-mock-hub";
const MOCK_INTEGRATION_ID = "int-mock-hub";

type PersistShape = {
  integrations: SupplierIntegration[];
  products: ImportedProduct[];
  mappings: CategoryMapping[];
  materials: typeof DEFAULT_MATERIAL_MAPPINGS;
  statusMaps: StatusMapping[];
  logs: SyncLog[];
  alerts: IntegrationAlert[];
  webhooks: WebhookRecord[];
  fulfillments: RoutedFulfillment[];
  priceHistory: PriceHistoryRow[];
  inventoryHistory: InventoryHistoryRow[];
  payouts: Array<{
    id: string;
    supplierId: string;
    grossSale: number;
    commission: number;
    refunds: number;
    netAmount: number;
    status: "pending" | "completed";
    createdAt: string;
  }>;
};

function filePath() {
  return process.env.CHESHIRE_INTEGRATIONS_STORE || path.join(resolveDataDir(), "integrations.json");
}

function uid(prefix: string) {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

function now() {
  return new Date().toISOString();
}

function seed(): PersistShape {
  const created = now();
  const mock: SupplierIntegration = {
    id: MOCK_INTEGRATION_ID,
    supplierId: MOCK_SUPPLIER_ID,
    supplierName: "Cheshire Mock Hub",
    providerId: "mock-jewellery-hub",
    integrationType: "MOCK",
    integrationStatus: "CONFIGURED",
    operationalStatus: "INTEGRATION_TESTING",
    capabilities: mockHub.capabilities().slice(),
    schedule: "manual",
    hasCredentials: false,
    productsSynced: 0,
    inventorySynced: 0,
    ordersSynced: 0,
    branding: {
      blindShipping: true,
      whiteLabelPackaging: true,
      customInvoice: true,
      cheshireBranding: "supported",
    },
    compliance: {
      ...emptyCompliance(),
      dropshipping_permitted: true,
      integration_tested: false,
    },
    pricing: {
      id: "price-mock",
      method: "PERCENT_MARGIN",
      value: 20,
      minMargin: 50,
      rounding: "nearest_9",
      supplierId: MOCK_SUPPLIER_ID,
      priority: 20,
    },
    emailFulfillment: { enabled: false },
    autoSubmitOrders: true,
    pauseNewOrders: false,
    createdAt: created,
    updatedAt: created,
  };
  const atelier = getSuppliers().find((s) => s.id === "sup-atelier-noir");
  const manual: SupplierIntegration | null = atelier
    ? {
        id: "int-atelier-manual",
        supplierId: atelier.id,
        supplierName: atelier.brandName,
        providerId: "manual",
        integrationType: "MANUAL",
        integrationStatus: "CONFIGURED",
        operationalStatus: "APPROVED",
        capabilities: [],
        schedule: "manual",
        hasCredentials: false,
        productsSynced: 0,
        inventorySynced: 0,
        ordersSynced: 0,
        branding: {
          blindShipping: false,
          whiteLabelPackaging: false,
          customInvoice: false,
          cheshireBranding: "unknown",
        },
        compliance: emptyCompliance(),
        pricing: {
          id: "price-atelier",
          method: "PERCENT_MARGIN",
          value: 12,
          rounding: "nearest_9",
          supplierId: atelier.id,
          priority: 10,
        },
        emailFulfillment: { enabled: true, recipient: atelier.email },
        autoSubmitOrders: false,
        pauseNewOrders: false,
        createdAt: created,
        updatedAt: created,
      }
    : null;
  return {
    integrations: manual ? [mock, manual] : [mock],
    products: [],
    mappings: [
      { id: "map-top", supplierId: MOCK_SUPPLIER_ID, supplierCategory: "Topwear", cheshireCategory: "hoodies" },
      { id: "map-jeans", supplierId: MOCK_SUPPLIER_ID, supplierCategory: "Jeans", cheshireCategory: "denim" },
      { id: "map-frock", supplierId: MOCK_SUPPLIER_ID, supplierCategory: "Frocks", cheshireCategory: "dresses" },
    ],
    materials: DEFAULT_MATERIAL_MAPPINGS,
    statusMaps: [
      { id: "st-1", supplierId: MOCK_SUPPLIER_ID, supplierStatus: "dispatched", cheshireStatus: "shipped" },
      { id: "st-2", supplierId: MOCK_SUPPLIER_ID, supplierStatus: "complete", cheshireStatus: "delivered" },
    ],
    logs: [],
    alerts: [],
    webhooks: [],
    fulfillments: [],
    priceHistory: [],
    inventoryHistory: [],
    payouts: [],
  };
}

let cache: PersistShape | null = null;

function load(): PersistShape {
  if (cache) return cache;
  if (persistEnabled()) {
    cache = readJsonFile(filePath(), seed());
    if (!cache.integrations?.length) cache = seed();
    return cache;
  }
  cache = seed();
  return cache;
}

function save() {
  if (!cache) return;
  if (persistEnabled()) writeJsonFile(filePath(), cache);
}

export function resetIntegrationEngine(seedMock = true) {
  mockHub.reset();
  cache = seedMock ? seed() : {
    integrations: [],
    products: [],
    mappings: [],
    materials: DEFAULT_MATERIAL_MAPPINGS,
    statusMaps: [],
    logs: [],
    alerts: [],
    webhooks: [],
    fulfillments: [],
    priceHistory: [],
    inventoryHistory: [],
    payouts: [],
  };
  save();
}

function ctxFor(row: SupplierIntegration, simulate?: ConnectorContext["simulateFailure"]): ConnectorContext {
  return {
    supplierId: row.supplierId,
    integrationId: row.id,
    credentials: decryptCredentials(row.encryptedCredentials),
    simulateFailure: simulate,
  };
}

function alert(input: Omit<IntegrationAlert, "id" | "createdAt" | "updatedAt" | "retryCount" | "resolution"> & { retryCount?: number }) {
  const db = load();
  const row: IntegrationAlert = {
    id: uid("al"),
    retryCount: input.retryCount ?? 0,
    resolution: "open",
    createdAt: now(),
    updatedAt: now(),
    ...input,
  };
  db.alerts.unshift(row);
  save();
  integrationLog("error", "alert", { supplierId: row.supplierId, data: { code: row.code, message: row.message } });
  return row;
}

function beginLog(row: SupplierIntegration, kind: SyncKind): SyncLog {
  const db = load();
  const log: SyncLog = {
    id: uid("sync"),
    supplierId: row.supplierId,
    supplierName: row.supplierName,
    kind,
    status: "RUNNING",
    startedAt: now(),
    processed: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    attempt: 1,
  };
  db.logs.unshift(log);
  save();
  return log;
}

function finishLog(id: string, patch: Partial<SyncLog>) {
  const db = load();
  const log = db.logs.find((l) => l.id === id);
  if (!log) return;
  Object.assign(log, patch);
  log.endedAt = now();
  log.durationMs = Date.parse(log.endedAt) - Date.parse(log.startedAt);
  save();
  return log;
}

export function listProviders() {
  return listConnectors();
}

export function getIntegrations() {
  return load().integrations;
}

export function getIntegration(id: string) {
  return load().integrations.find((i) => i.id === id || i.supplierId === id);
}

export function integrationDashboard() {
  const db = load();
  const openAlerts = db.alerts.filter((a) => a.resolution === "open");
  return {
    integrations: db.integrations,
    products: db.products.length,
    liveProducts: db.products.filter((p) => p.lifecycle === "LIVE").length,
    openAlerts: openAlerts.length,
    runningJobs: db.logs.filter((l) => l.status === "RUNNING").length,
    lastSync: db.logs.find((l) => l.status === "SUCCESS" || l.status === "PARTIAL_SUCCESS"),
    flags: getFeatureFlags(),
    providers: listConnectors(),
  };
}

export function upsertIntegration(input: {
  supplierId: string;
  supplierName: string;
  providerId: string;
  integrationType?: IntegrationType;
  schedule?: SyncSchedule;
  credentials?: ConnectorCredentials;
  pricing?: Partial<PricingRule>;
  branding?: Partial<BrandingConfig>;
  emailRecipient?: string;
}) {
  const db = load();
  const connector = getConnector(input.providerId);
  const existing = db.integrations.find((i) => i.supplierId === input.supplierId);
  const created = now();
  const next: SupplierIntegration = {
    id: existing?.id || uid("int"),
    supplierId: input.supplierId,
    supplierName: input.supplierName,
    providerId: input.providerId,
    integrationType: input.integrationType || connector.integrationType,
    integrationStatus: input.credentials && credentialsPresent(input.credentials) ? "CONFIGURED" : existing?.integrationStatus || "NOT_CONFIGURED",
    operationalStatus: existing?.operationalStatus || "INTEGRATION_PENDING",
    capabilities: connector.capabilities().slice(),
    schedule: input.schedule || existing?.schedule || "manual",
    encryptedCredentials: input.credentials ? encryptCredentials(input.credentials) : existing?.encryptedCredentials,
    hasCredentials: Boolean(input.credentials ? credentialsPresent(input.credentials) : existing?.hasCredentials),
    productsSynced: existing?.productsSynced ?? 0,
    inventorySynced: existing?.inventorySynced ?? 0,
    ordersSynced: existing?.ordersSynced ?? 0,
    branding: { ...(existing?.branding ?? { blindShipping: false, whiteLabelPackaging: false, customInvoice: false, cheshireBranding: "unknown" }), ...input.branding },
    compliance: existing?.compliance ?? emptyCompliance(),
    pricing: {
      id: existing?.pricing.id || uid("pr"),
      method: input.pricing?.method || existing?.pricing.method || "PERCENT_MARGIN",
      value: input.pricing?.value ?? existing?.pricing.value ?? 20,
      minMargin: input.pricing?.minMargin ?? existing?.pricing.minMargin ?? 50,
      rounding: input.pricing?.rounding || existing?.pricing.rounding || "nearest_9",
      supplierId: input.supplierId,
      priority: 20,
    },
    emailFulfillment: {
      enabled: Boolean(input.emailRecipient) || existing?.emailFulfillment?.enabled || false,
      recipient: input.emailRecipient || existing?.emailFulfillment?.recipient,
    },
    autoSubmitOrders: existing?.autoSubmitOrders ?? (input.providerId === "mock-jewellery-hub"),
    pauseNewOrders: existing?.pauseNewOrders ?? false,
    createdAt: existing?.createdAt || created,
    updatedAt: created,
  };
  if (input.providerId === "manual" || input.providerId === "csv") {
    next.integrationStatus = "CONFIGURED";
  }
  if (existing) Object.assign(existing, next);
  else db.integrations.unshift(next);
  save();
  return next;
}

export async function testConnection(integrationId: string, simulate?: ConnectorContext["simulateFailure"]) {
  const row = getIntegration(integrationId);
  if (!row) throw Object.assign(new Error("Integration not found"), { code: "NOT_FOUND" });
  const connector = getConnector(row.providerId);
  const started = Date.now();
  const result = await connector.healthCheck(ctxFor(row, simulate));
  const db = load();
  const live = db.integrations.find((i) => i.id === row.id)!;
  live.lastHealthAt = now();
  live.updatedAt = now();
  if (result.ok) {
    live.integrationStatus = row.providerId === "mock-jewellery-hub" || row.providerId === "manual" || row.providerId === "csv" ? "CONNECTED" : "CONFIGURED";
    live.lastHealthOk = true;
    live.lastHealthMessage = result.data.message;
    live.compliance = { ...live.compliance, integration_tested: true };
    integrationLog("info", "health.ok", { supplierId: row.supplierId, durationMs: Date.now() - started });
    save();
    return { status: "CONNECTED" as const, message: result.data.message, latencyMs: result.data.latencyMs };
  }
  live.integrationStatus = result.supported ? "ERROR" : "PENDING";
  live.lastHealthOk = false;
  live.lastHealthMessage = result.supported ? result.error.message : result.reason;
  live.lastFailedSync = now();
  save();
  alert({
    supplierId: row.supplierId,
    supplierName: row.supplierName,
    severity: "warning",
    code: result.supported ? result.error.code : "UNSUPPORTED",
    message: live.lastHealthMessage || "Connection failed",
  });
  return {
    status: "CONNECTION_FAILED" as const,
    message: live.lastHealthMessage,
  };
}

export function setCompliance(integrationId: string, patch: Partial<ComplianceChecklist>) {
  const db = load();
  const row = db.integrations.find((i) => i.id === integrationId || i.supplierId === integrationId);
  if (!row) return null;
  row.compliance = { ...row.compliance, ...patch };
  row.updatedAt = now();
  save();
  return { ...complianceScore(row.compliance), checklist: row.compliance };
}

export function setCategoryMapping(supplierId: string, supplierCategory: string, cheshireCategory: string) {
  const db = load();
  const existing = db.mappings.find(
    (m) => m.supplierId === supplierId && m.supplierCategory.toLowerCase() === supplierCategory.toLowerCase()
  );
  if (existing) existing.cheshireCategory = cheshireCategory;
  else db.mappings.push({ id: uid("map"), supplierId, supplierCategory, cheshireCategory });
  save();
  return db.mappings.filter((m) => m.supplierId === supplierId);
}

export async function previewImport(integrationId: string, limit = 25) {
  const row = getIntegration(integrationId);
  if (!row) throw Object.assign(new Error("Integration not found"), { code: "NOT_FOUND" });
  const flags = getFeatureFlags();
  if (!flags.SUPPLIER_SYNC_ENABLED) throw Object.assign(new Error("Product sync is disabled"), { code: "FLAG_OFF" });
  const connector = getConnector(row.providerId);
  const rate = defaultRateLimiter.tryAcquire(row.supplierId);
  if (!rate.allowed) throw Object.assign(new Error("Supplier rate limit"), { code: "RATE_LIMIT" });
  const result = await connector.getProducts(ctxFor(row), { limit });
  if (!result.ok) {
    return { items: [], error: result.supported ? result.error.message : result.reason };
  }
  const db = load();
  const items = result.data.items.map((raw) => {
    const existing = db.products.find((p) => p.supplierId === row.supplierId && p.supplierProductId === raw.supplierProductId);
    const normalized = normalizeSupplierProduct(raw, {
      supplierId: row.supplierId,
      mappings: db.mappings,
      materials: db.materials,
      pricingRules: [row.pricing],
      existing,
    });
    return {
      supplierProductId: normalized.supplierProductId,
      sku: normalized.sku,
      title: normalized.title,
      image: normalized.images[0]?.sourceUrl,
      supplierCost: normalized.supplierCost,
      stock: normalized.inventory.supplierStock,
      category: normalized.category,
      customerPrice: normalized.customerPrice,
      commission: normalized.customerPrice - normalized.supplierCost,
      duplicate: Boolean(existing),
      imageWarning: normalized.imageUsagePermission !== "APPROVED",
    };
  });
  return { items, error: null as string | null };
}

export async function importProducts(
  integrationId: string,
  opts: { limit?: number; selectedIds?: string[]; testOne?: boolean } = {}
) {
  const row = getIntegration(integrationId);
  if (!row) throw Object.assign(new Error("Integration not found"), { code: "NOT_FOUND" });
  const log = beginLog(row, "PRODUCT");
  const connector = getConnector(row.providerId);
  const result = await connector.getProducts(ctxFor(row), { limit: opts.testOne ? 1 : opts.limit ?? 50 });
  if (!result.ok) {
    finishLog(log.id, {
      status: "FAILED",
      errors: [result.supported ? result.error.message : result.reason],
    });
    const live = getIntegration(row.id)!;
    live.lastFailedSync = now();
    live.integrationStatus = "ERROR";
    save();
    alert({
      supplierId: row.supplierId,
      supplierName: row.supplierName,
      severity: "critical",
      code: "PRODUCT_SYNC_FAILED",
      message: result.supported ? result.error.message : result.reason,
    });
    return { ok: false, log: getSyncLog(log.id) };
  }
  const db = load();
  let created = 0;
  let updated = 0;
  let skipped = 0;
  const selected = opts.selectedIds ? new Set(opts.selectedIds) : null;
  const source = opts.testOne ? result.data.items.slice(0, 1) : result.data.items;
  for (const raw of source) {
    if (selected && !selected.has(raw.supplierProductId) && !selected.has(raw.sku)) {
      skipped += 1;
      continue;
    }
    const existing = db.products.find((p) => p.supplierId === row.supplierId && p.supplierProductId === raw.supplierProductId);
    const normalized = normalizeSupplierProduct(raw, {
      supplierId: row.supplierId,
      mappings: db.mappings,
      materials: db.materials,
      pricingRules: [row.pricing],
      existing,
    });
    if (existing) {
      if (existing.supplierCost !== normalized.supplierCost) {
        db.priceHistory.unshift({
          id: uid("ph"),
          productId: existing.id,
          supplierId: row.supplierId,
          oldPrice: existing.supplierCost,
          newPrice: normalized.supplierCost,
          source: "import",
          createdAt: now(),
        });
      }
      Object.assign(existing, normalized, { lifecycle: existing.lifecycle === "LIVE" ? "LIVE" : "IMPORTED" });
      updated += 1;
    } else {
      db.products.push({ ...normalized, lifecycle: "IMPORTED" });
      created += 1;
    }
  }
  const live = db.integrations.find((i) => i.id === row.id)!;
  live.productsSynced += created + updated;
  live.lastSuccessfulSync = now();
  live.updatedAt = now();
  finishLog(log.id, { status: "SUCCESS", processed: source.length, created, updated, skipped });
  integrationLog("info", "import.products", { supplierId: row.supplierId, data: { created, updated, skipped } });
  save();
  return { ok: true, created, updated, skipped, log: getSyncLog(log.id) };
}

export function importCsv(integrationId: string, csvText: string, map: CsvColumnMap) {
  const row = getIntegration(integrationId);
  if (!row) throw Object.assign(new Error("Integration not found"), { code: "NOT_FOUND" });
  const parsed = parseCsv(csvText);
  const { items, errors } = mappedCsvProducts(parsed.rows, map);
  if (errors.length && !items.length) return { ok: false, errors, created: 0 };
  const db = load();
  let created = 0;
  for (const raw of items) {
    if (!raw.name || raw.price <= 0) continue;
    const existing = db.products.find((p) => p.supplierId === row.supplierId && p.supplierProductId === raw.supplierProductId);
    const normalized = normalizeSupplierProduct(raw, {
      supplierId: row.supplierId,
      mappings: db.mappings,
      materials: db.materials,
      pricingRules: [row.pricing],
      existing,
    });
    if (existing) Object.assign(existing, normalized, { lifecycle: "IMPORTED" });
    else {
      db.products.push({ ...normalized, lifecycle: "IMPORTED" });
      created += 1;
    }
  }
  save();
  return { ok: true, errors, created, headers: parsed.headers };
}

export async function syncInventory(integrationId: string) {
  const row = getIntegration(integrationId);
  if (!row) throw Object.assign(new Error("Integration not found"), { code: "NOT_FOUND" });
  const log = beginLog(row, "INVENTORY");
  const connector = getConnector(row.providerId);
  const result = await connector.getInventory(ctxFor(row));
  if (!result.ok) {
    finishLog(log.id, { status: "FAILED", errors: [result.supported ? result.error.message : result.reason] });
    alert({
      supplierId: row.supplierId,
      supplierName: row.supplierName,
      severity: "critical",
      code: "INVENTORY_SYNC_FAILED",
      message: result.supported ? result.error.message : result.reason,
    });
    return { ok: false };
  }
  const db = load();
  let updated = 0;
  for (const snap of result.data) {
    const product = db.products.find((p) => p.supplierId === row.supplierId && p.supplierProductId === snap.supplierProductId);
    if (!product) continue;
    const old = product.inventory.supplierStock;
    product.inventory = applySupplierStock(product.inventory, snap.stock);
    product.lastInventorySync = now();
    if (old !== snap.stock) {
      db.inventoryHistory.unshift({
        id: uid("ih"),
        productId: product.id,
        supplierId: row.supplierId,
        oldStock: old,
        newStock: snap.stock,
        source: "sync",
        createdAt: now(),
      });
      updated += 1;
    }
  }
  const live = db.integrations.find((i) => i.id === row.id)!;
  live.inventorySynced += updated;
  live.lastSuccessfulSync = now();
  finishLog(log.id, { status: "SUCCESS", processed: result.data.length, updated });
  save();
  return { ok: true, updated };
}

export async function syncPrices(integrationId: string) {
  const row = getIntegration(integrationId);
  if (!row) throw Object.assign(new Error("Integration not found"), { code: "NOT_FOUND" });
  const log = beginLog(row, "PRICE");
  const connector = getConnector(row.providerId);
  const result = await connector.getPrices(ctxFor(row));
  if (!result.ok) {
    finishLog(log.id, { status: "FAILED", errors: [result.supported ? result.error.message : result.reason] });
    return { ok: false };
  }
  const db = load();
  let updated = 0;
  let flagged = 0;
  for (const snap of result.data) {
    const product = db.products.find((p) => p.supplierId === row.supplierId && p.supplierProductId === snap.supplierProductId);
    if (!product) continue;
    const quote = quoteCustomerPrice(snap.price, [row.pricing], {
      supplierId: row.supplierId,
      category: product.category,
      previousCost: product.supplierCost,
    });
    if (product.supplierCost !== snap.price) {
      db.priceHistory.unshift({
        id: uid("ph"),
        productId: product.id,
        supplierId: row.supplierId,
        oldPrice: product.supplierCost,
        newPrice: snap.price,
        source: "sync",
        createdAt: now(),
      });
      product.previousSupplierCost = product.supplierCost;
      product.supplierCost = snap.price;
      product.customerPrice = quote.customerPrice;
      product.priceFlag = quote.flaggedChange
        ? `Supplier price increased by ${Math.abs(quote.flaggedChange.changePercent)}%. ${quote.flaggedChange.previousCost} → ${quote.flaggedChange.newCost}.`
        : quote.lossRisk
          ? "Loss risk after supplier price change."
          : undefined;
      if (product.priceFlag) {
        flagged += 1;
        alert({
          supplierId: row.supplierId,
          supplierName: row.supplierName,
          severity: "warning",
          code: "PRICE_CHANGE",
          message: product.priceFlag,
          productId: product.id,
        });
      }
      product.lastPriceSync = now();
      updated += 1;
    }
  }
  finishLog(log.id, { status: flagged ? "PARTIAL_SUCCESS" : "SUCCESS", processed: result.data.length, updated });
  save();
  return { ok: true, updated, flagged };
}

export function getImportedProducts(supplierId?: string) {
  const rows = load().products;
  return supplierId ? rows.filter((p) => p.supplierId === supplierId) : rows;
}

export function getImportedProduct(id: string) {
  return load().products.find((p) => p.id === id || p.sku === id || p.slug === id);
}

export function setProductPermissions(
  productId: string,
  patch: { imageUsagePermission?: PermissionStatus; contentPermissionStatus?: PermissionStatus; lifecycle?: ImportedProduct["lifecycle"] }
) {
  const db = load();
  const product = db.products.find((p) => p.id === productId);
  if (!product) return null;
  if (patch.imageUsagePermission) {
    product.imageUsagePermission = patch.imageUsagePermission;
    product.images = product.images.map((img) => ({
      ...img,
      status: patch.imageUsagePermission!,
      storedUrl: patch.imageUsagePermission === "APPROVED" ? img.sourceUrl : undefined,
    }));
  }
  if (patch.contentPermissionStatus) product.contentPermissionStatus = patch.contentPermissionStatus;
  if (patch.lifecycle) product.lifecycle = patch.lifecycle;
  product.updatedAt = now();
  save();
  return product;
}

export function approveAndPublish(productId: string) {
  const product = getImportedProduct(productId);
  if (!product) return null;
  if (product.imageUsagePermission !== "APPROVED") {
    throw Object.assign(new Error("Image usage permission has not been verified."), { code: "IMAGE_RIGHTS" });
  }
  if (product.contentPermissionStatus !== "APPROVED") {
    throw Object.assign(new Error("Content permission has not been verified."), { code: "CONTENT_RIGHTS" });
  }
  return setProductPermissions(productId, { lifecycle: "LIVE" });
}

export function markSourceUnavailable(supplierId: string, missingIds: string[]) {
  const db = load();
  for (const product of db.products.filter((p) => p.supplierId === supplierId)) {
    if (missingIds.includes(product.supplierProductId)) {
      product.sourceUnavailable = true;
      if (product.lifecycle === "LIVE") product.lifecycle = "SOURCE_UNAVAILABLE";
    }
  }
  save();
}

export function toPublicProduct(product: ImportedProduct, brand: { slug: string; name: string }): PublicImportedProduct | null {
  if (product.lifecycle !== "LIVE") return null;
  const images =
    product.imageUsagePermission === "APPROVED"
      ? product.images
          .filter((i) => i.storedUrl || i.sourceUrl)
          .map((i, idx) => ({
            id: `${product.id}-img-${idx}`,
            url: i.storedUrl || i.sourceUrl,
            alt: product.title,
            sortOrder: idx,
            isPrimary: idx === 0,
          }))
      : [
          {
            id: `${product.id}-ph`,
            url: "/images/products/placeholder.jpg",
            alt: product.title,
            sortOrder: 0,
            isPrimary: true,
          },
        ];
  return {
    id: product.id,
    sku: product.sku,
    name: product.title,
    slug: product.slug,
    description: product.contentPermissionStatus === "APPROVED" ? product.description : "Details available after purchase confirmation.",
    price: product.customerPrice,
    mrp: product.compareAtPrice || Math.round(product.customerPrice * 1.15),
    category: product.category,
    material: product.material,
    color: product.color || "Black",
    stock: product.inventory.available,
    images,
    sizes: product.sizes,
    productType: product.productType,
    brandSlug: brand.slug,
    brandName: brand.name,
    availability: product.inventory.available > 0 ? "in_stock" : "out_of_stock",
    weight: product.weight,
    stoneType: product.stoneType,
  };
}

export function livePublicCatalog(): PublicImportedProduct[] {
  const db = load();
  const out: PublicImportedProduct[] = [];
  for (const product of db.products) {
    const integration = db.integrations.find((i) => i.supplierId === product.supplierId);
    if (!integration || integration.pauseNewOrders && product.lifecycle !== "LIVE") continue;
    if (integration.operationalStatus === "PAUSED" || integration.operationalStatus === "SUSPENDED") continue;
    const pub = toPublicProduct(product, {
      slug: integration.supplierId,
      name: integration.supplierName,
    });
    if (pub) out.push(pub);
  }
  return out;
}

function fulfillmentAddress(input: RoutedFulfillment["shipping"]): RoutedFulfillment["shipping"] {
  return {
    fullName: input.fullName,
    phone: input.phone,
    line1: input.line1,
    city: input.city,
    state: input.state,
    pincode: input.pincode,
    country: input.country || "IN",
  };
}

export type RouteOrderInput = {
  cheshireOrderNumber: string;
  paymentStatus: "PAID" | "PENDING" | "COD";
  shipping: RoutedFulfillment["shipping"];
  items: Array<{
    productId: string;
    sku: string;
    name: string;
    quantity: number;
    size?: string | null;
    productType: ProductType;
    supplierId?: string;
  }>;
  simulateFailure?: ConnectorContext["simulateFailure"];
};

export async function routePaidOrder(input: RouteOrderInput) {
  const db = load();
  const fulfillable = input.items.filter((i) => i.productType !== "affiliate");
  const groups = new Map<string, typeof fulfillable>();
  for (const item of fulfillable) {
    const product = db.products.find((p) => p.sku === item.sku || p.id === item.productId);
    const supplierId = item.supplierId || product?.supplierId || "unknown";
    const list = groups.get(supplierId) ?? [];
    list.push(item);
    groups.set(supplierId, list);
  }
  const created: RoutedFulfillment[] = [];
  for (const [supplierId, items] of groups) {
    if (supplierId === "unknown") continue;
    const integration = db.integrations.find((i) => i.supplierId === supplierId);
    const flags = getFeatureFlags();
    let supplierAmount = 0;
    let commissionAmount = 0;
    for (const item of items) {
      const product = db.products.find((p) => p.sku === item.sku || p.id === item.productId);
      const cost = product?.supplierCost ?? 0;
      const sell = product?.customerPrice ?? 0;
      if (product) {
        assertSellableQuote(
          quoteCustomerPrice(cost, integration ? [integration.pricing] : [], {
            supplierId,
            category: product.category,
            previousCost: product.supplierCost,
          })
        );
        if (sell < cost) throw Object.assign(new Error("Server refused a loss-making line."), { code: "LOSS_RISK" });
        product.inventory = reserveStock(product.inventory, item.quantity);
        product.inventory = commitSale(product.inventory, item.quantity);
      }
      supplierAmount += cost * item.quantity;
      commissionAmount += Math.max(0, sell - cost) * item.quantity;
    }
    const fulfillment: RoutedFulfillment = {
      id: uid("ff"),
      cheshireOrderNumber: input.cheshireOrderNumber,
      supplierId,
      supplierName: integration?.supplierName || "Unknown house",
      status: "pending",
      items: items.map((i) => ({
        supplierProductId: db.products.find((p) => p.sku === i.sku)?.supplierProductId || i.sku,
        sku: i.sku,
        name: i.name,
        quantity: i.quantity,
        size: i.size,
      })),
      shipping: fulfillmentAddress(input.shipping),
      supplierAmount,
      commissionAmount,
      submission: "pending",
      createdAt: now(),
      updatedAt: now(),
    };

    const shouldSubmit =
      flags.AUTO_ORDER_SUBMISSION_ENABLED &&
      integration?.autoSubmitOrders &&
      integration.capabilities.includes("ORDER_SUBMISSION") &&
      !integration.pauseNewOrders &&
      input.paymentStatus === "PAID";

    if (shouldSubmit && integration) {
      const connector = getConnector(integration.providerId);
      const result = await connector.createOrder(ctxFor(integration, input.simulateFailure), {
        cheshireOrderId: input.cheshireOrderNumber,
        cheshireOrderNumber: input.cheshireOrderNumber,
        items: fulfillment.items,
        shipping: fulfillment.shipping,
        paymentStatus: input.paymentStatus,
      });
      if (result.ok) {
        fulfillment.remoteOrderId = result.data.remoteOrderId;
        fulfillment.status = "confirmed";
        fulfillment.submission = "api";
        integration.ordersSynced += 1;
      } else {
        fulfillment.status = "SUPPLIER_SUBMISSION_FAILED";
        fulfillment.submission = "pending";
        alert({
          supplierId,
          supplierName: integration.supplierName,
          severity: "critical",
          code: "SUPPLIER_ACTION_REQUIRED",
          message: "Paid customer order saved. Supplier submission failed — retry from the error centre. Do not refund automatically.",
          orderId: input.cheshireOrderNumber,
        });
      }
    } else if (integration?.emailFulfillment?.enabled) {
      fulfillment.submission = "email";
      fulfillment.status = "pending";
      db.logs.unshift({
        id: uid("sync"),
        supplierId,
        supplierName: integration.supplierName,
        kind: "ORDER",
        status: "SUCCESS",
        startedAt: now(),
        endedAt: now(),
        processed: 1,
        created: 1,
        updated: 0,
        skipped: 0,
        errors: [],
        attempt: 1,
      });
    } else {
      fulfillment.submission = "manual";
      fulfillment.status = "pending";
    }

    db.fulfillments.unshift(fulfillment);
    created.push(fulfillment);
  }
  save();
  return { orderNumber: input.cheshireOrderNumber, fulfillments: created };
}

export async function retryFulfillment(fulfillmentId: string) {
  const db = load();
  const row = db.fulfillments.find((f) => f.id === fulfillmentId);
  if (!row) return null;
  const integration = db.integrations.find((i) => i.supplierId === row.supplierId);
  if (!integration) return row;
  const connector = getConnector(integration.providerId);
  const result = await connector.createOrder(ctxFor(integration), {
    cheshireOrderId: row.cheshireOrderNumber,
    cheshireOrderNumber: row.cheshireOrderNumber,
    items: row.items,
    shipping: row.shipping,
    paymentStatus: "PAID",
  });
  const alertRow = db.alerts.find((a) => a.orderId === row.cheshireOrderNumber && a.resolution === "open");
  if (result.ok) {
    row.remoteOrderId = result.data.remoteOrderId;
    row.status = "confirmed";
    row.submission = "api";
    row.updatedAt = now();
    if (alertRow) alertRow.resolution = "resolved";
  } else {
    row.status = "SUPPLIER_ACTION_REQUIRED";
    if (alertRow) alertRow.retryCount += 1;
  }
  save();
  return row;
}

export function markSubmittedManually(fulfillmentId: string) {
  const db = load();
  const row = db.fulfillments.find((f) => f.id === fulfillmentId);
  if (!row) return null;
  row.status = "SUBMITTED_MANUALLY";
  row.submission = "manual";
  row.updatedAt = now();
  save();
  return row;
}

export async function syncTracking(fulfillmentId: string) {
  const db = load();
  const row = db.fulfillments.find((f) => f.id === fulfillmentId);
  if (!row?.remoteOrderId) return row;
  const integration = db.integrations.find((i) => i.supplierId === row.supplierId);
  if (!integration) return row;
  const connector = getConnector(integration.providerId);
  const result = await connector.getShipmentTracking(ctxFor(integration), row.remoteOrderId);
  if (result.ok) {
    row.tracking = result.data;
    row.status = mapOrderStatus(result.data.status, db.statusMaps, row.supplierId);
    row.updatedAt = now();
    save();
  }
  return row;
}

export function ingestWebhook(input: {
  eventId: string;
  supplierId: string;
  type: string;
  signature?: string;
  payload: Record<string, unknown>;
}) {
  const flags = getFeatureFlags();
  if (!flags.WEBHOOKS_ENABLED) return { status: "rejected" as const, reason: "webhooks disabled" };
  const db = load();
  const integration = db.integrations.find((i) => i.supplierId === input.supplierId);
  if (!integration) return { status: "rejected" as const, reason: "unknown supplier" };
  const secret = decryptCredentials(integration.encryptedCredentials).webhookSecret;
  if (secret) {
    if (!input.signature) return { status: "rejected" as const, reason: "missing signature" };
    const expected = crypto.createHmac("sha256", secret).update(JSON.stringify(input.payload)).digest("hex");
    if (expected !== input.signature) return { status: "rejected" as const, reason: "invalid signature" };
  }
  const payloadHash = crypto.createHash("sha256").update(JSON.stringify({ eventId: input.eventId, ...input.payload })).digest("hex");
  const duplicate = db.webhooks.find((w) => w.eventId === input.eventId || w.payloadHash === payloadHash);
  if (duplicate) {
    return { status: "duplicate" as const, id: duplicate.id };
  }
  const rec: WebhookRecord = {
    id: uid("wh"),
    eventId: input.eventId,
    supplierId: input.supplierId,
    type: input.type,
    receivedAt: now(),
    processedAt: now(),
    status: "processed",
    payloadHash,
  };
  db.webhooks.unshift(rec);
  if (input.type === "ORDER_SHIPPED" && typeof input.payload.remoteOrderId === "string") {
    const ff = db.fulfillments.find((f) => f.remoteOrderId === input.payload.remoteOrderId);
    if (ff) {
      ff.status = "shipped";
      ff.tracking = {
        courier: String(input.payload.courier || "Courier"),
        trackingNumber: String(input.payload.trackingNumber || ""),
        status: "shipped",
      };
    }
  }
  if (input.type === "INVENTORY_UPDATED" && typeof input.payload.supplierProductId === "string") {
    const product = db.products.find((p) => p.supplierProductId === input.payload.supplierProductId);
    if (product && typeof input.payload.stock === "number") {
      product.inventory = applySupplierStock(product.inventory, input.payload.stock);
    }
  }
  save();
  return { status: "processed" as const, id: rec.id };
}

export function getFulfillments(supplierId?: string) {
  const rows = load().fulfillments;
  return supplierId ? rows.filter((f) => f.supplierId === supplierId) : rows;
}

export function getFulfillmentSheet(id: string) {
  const row = load().fulfillments.find((f) => f.id === id);
  if (!row) return null;
  return {
    ...row,
    note: "Send only these fulfillment fields to the supplier. Do not include commission, analytics, or payment credentials.",
  };
}

export function getSyncLogs(supplierId?: string) {
  const rows = load().logs;
  return supplierId ? rows.filter((l) => l.supplierId === supplierId) : rows;
}

export function getSyncLog(id: string) {
  return load().logs.find((l) => l.id === id);
}

export function getAlerts(openOnly = false) {
  const rows = load().alerts;
  return openOnly ? rows.filter((a) => a.resolution === "open") : rows;
}

export function resolveAlert(id: string, resolution: IntegrationAlert["resolution"]) {
  const db = load();
  const row = db.alerts.find((a) => a.id === id);
  if (!row) return null;
  row.resolution = resolution;
  row.updatedAt = now();
  save();
  return row;
}

export function recordPayout(supplierId: string, orderNumber: string) {
  const db = load();
  const lines = db.fulfillments.filter((f) => f.supplierId === supplierId && f.cheshireOrderNumber === orderNumber);
  const gross = lines.reduce((s, l) => s + l.supplierAmount + l.commissionAmount, 0);
  const commission = lines.reduce((s, l) => s + l.commissionAmount, 0);
  const net = lines.reduce((s, l) => s + l.supplierAmount, 0);
  const row = {
    id: uid("po"),
    supplierId,
    grossSale: gross,
    commission,
    refunds: 0,
    netAmount: net,
    status: "pending" as const,
    createdAt: now(),
  };
  db.payouts.unshift(row);
  save();
  return row;
}

export function supplierPerformance(supplierId: string) {
  const db = load();
  const orders = db.fulfillments.filter((f) => f.supplierId === supplierId);
  const accepted = orders.filter((o) => o.status !== "cancelled" && o.status !== "SUPPLIER_SUBMISSION_FAILED").length;
  const shipped = orders.filter((o) => o.status === "shipped" || o.status === "delivered").length;
  const cancelled = orders.filter((o) => o.status === "cancelled").length;
  const health = db.integrations.find((i) => i.supplierId === supplierId);
  const reliability = health?.lastHealthOk === false ? 40 : 90;
  const acceptance = orders.length ? Math.round((accepted / orders.length) * 100) : 100;
  const shipRate = orders.length ? Math.round((shipped / orders.length) * 100) : 0;
  const cancelRate = orders.length ? Math.round((cancelled / orders.length) * 100) : 0;
  const score = Math.round(acceptance * 0.3 + (100 - cancelRate) * 0.2 + shipRate * 0.2 + reliability * 0.3);
  return { score, acceptance, shipRate, cancelRate, reliability, orders: orders.length };
}

export function pauseSupplier(supplierId: string, paused: boolean) {
  const db = load();
  const row = db.integrations.find((i) => i.supplierId === supplierId);
  if (!row) return null;
  row.pauseNewOrders = paused;
  row.operationalStatus = paused ? "PAUSED" : "ACTIVE";
  if (paused) {
    for (const p of db.products.filter((x) => x.supplierId === supplierId && x.lifecycle === "LIVE")) {
      p.lifecycle = "PAUSED";
    }
  }
  save();
  return row;
}

export function tryActivate(integrationId: string) {
  const db = load();
  const row = db.integrations.find((i) => i.id === integrationId);
  if (!row) return { ok: false, reason: "Not found" };
  const liveProducts = db.products.filter((p) => p.supplierId === row.supplierId && p.lifecycle === "LIVE");
  const ok = canActivateForSales({
    operationalApproved: ["APPROVED", "READY", "ACTIVE", "INTEGRATION_TESTING"].includes(row.operationalStatus),
    integrationConnected: row.integrationStatus === "CONNECTED",
    compliance: row.compliance,
    imagePermission: liveProducts.some((p) => p.imageUsagePermission === "APPROVED") || row.compliance.image_rights,
    fulfillmentVerified: row.compliance.integration_tested,
  });
  if (!ok) {
    return { ok: false, reason: "Readiness checks incomplete", score: complianceScore(row.compliance) };
  }
  row.operationalStatus = "ACTIVE";
  row.updatedAt = now();
  save();
  return { ok: true, status: row.operationalStatus };
}

export function businessSnapshot() {
  const db = load();
  const gmv = db.fulfillments.reduce((s, f) => s + f.supplierAmount + f.commissionAmount, 0);
  const cheshire = db.fulfillments.reduce((s, f) => s + f.commissionAmount, 0);
  const supplier = db.fulfillments.reduce((s, f) => s + f.supplierAmount, 0);
  const failed = db.fulfillments.filter((f) => f.status === "SUPPLIER_SUBMISSION_FAILED" || f.status === "SUPPLIER_ACTION_REQUIRED").length;
  const bySupplier = db.integrations.map((i) => ({
    id: i.supplierId,
    name: i.supplierName,
    gmv: db.fulfillments.filter((f) => f.supplierId === i.supplierId).reduce((s, f) => s + f.supplierAmount + f.commissionAmount, 0),
    performance: supplierPerformance(i.supplierId).score,
    status: i.operationalStatus,
    connection: i.integrationStatus,
  }));
  return {
    gmv,
    cheshireRevenue: cheshire,
    supplierPayouts: supplier,
    averageMargin: gmv ? Math.round((cheshire / gmv) * 1000) / 10 : 0,
    failedFulfillment: failed,
    topSupplier: [...bySupplier].sort((a, b) => b.gmv - a.gmv)[0] || null,
    suppliers: bySupplier,
    openAlerts: db.alerts.filter((a) => a.resolution === "open").length,
  };
}

export function mockControls() {
  return {
    setStock: (id: string, stock: number) => mockHub.setStock(id, stock),
    setPrice: (id: string, price: number) => mockHub.setPrice(id, price),
    ship: (remoteId: string) => mockHub.ship(remoteId),
    deliver: (remoteId: string) => mockHub.deliver(remoteId),
    accept: (remoteId: string) => mockHub.accept(remoteId),
    reset: () => mockHub.reset(),
  };
}

export const MOCK_SUPPLIER = { id: MOCK_SUPPLIER_ID, integrationId: MOCK_INTEGRATION_ID };
