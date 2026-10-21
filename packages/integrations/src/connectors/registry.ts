import { mockHub } from "./mock";
import { AffiliateNetworkConnector, CsvConnector, ManualConnector, PendingHttpConnector } from "./pending";
import type { SupplierConnector } from "./base";

const pendingApi = new PendingHttpConnector("generic-api", "Generic REST API (pending implementation)", "API");
const shopify = new PendingHttpConnector("shopify", "Shopify store (pending implementation)", "SHOPIFY");
const woo = new PendingHttpConnector("woocommerce", "WooCommerce store (pending implementation)", "WOOCOMMERCE");
const xml = new PendingHttpConnector("xml-feed", "XML / RSS feed (pending implementation)", "XML");

const connectors: SupplierConnector[] = [
  mockHub,
  new ManualConnector(),
  new CsvConnector(),
  new AffiliateNetworkConnector(),
  pendingApi,
  shopify,
  woo,
  xml,
];

export function listConnectors() {
  return connectors.map((c) => ({
    providerId: c.providerId,
    displayName: c.displayName,
    integrationType: c.integrationType,
    capabilities: c.capabilities(),
    live: c.providerId === "mock-jewellery-hub" || c.providerId === "manual" || c.providerId === "csv" || c.providerId === "affiliate",
  }));
}

export function getConnector(providerId: string): SupplierConnector {
  const found = connectors.find((c) => c.providerId === providerId);
  if (!found) throw Object.assign(new Error(`Unknown connector: ${providerId}`), { code: "UNKNOWN_CONNECTOR" });
  return found;
}

export { mockHub };
export type { SupplierConnector } from "./base";
