import { BaseConnector, fail, unsupported } from "./base";
import type { IntegrationType } from "../types";

/**
 * Placeholder for a real HTTP supplier. Health fails closed until credentials
 * and a documented API are actually configured. Never reports CONNECTED by default.
 */
export class PendingHttpConnector extends BaseConnector {
  constructor(
    readonly providerId: string,
    readonly displayName: string,
    readonly integrationType: IntegrationType
  ) {
    super();
  }

  capabilities() {
    return [
      "PRODUCT_SYNC",
      "INVENTORY_SYNC",
      "PRICE_SYNC",
      "ORDER_SUBMISSION",
      "ORDER_STATUS_SYNC",
      "TRACKING_SYNC",
      "CANCELLATION",
      "WEBHOOKS",
    ] as const satisfies import("../types").ConnectorCapability[];
  }

  async healthCheck(ctx: import("../types").ConnectorContext): Promise<import("../types").CapabilityResult<{ latencyMs: number; message: string }>> {
    if (!ctx.credentials.baseUrl || !(ctx.credentials.apiKey || ctx.credentials.accessToken)) {
      return fail(
        "INTEGRATION_PENDING",
        "No live API is configured. Add credentials only when the supplier has issued them — this connector will not pretend to be connected.",
        false
      );
    }
    return fail(
      "INTEGRATION_PENDING",
      "A base URL is present, but this provider adapter is not implemented yet. Status remains Integration pending.",
      false
    );
  }
}

export class ManualConnector extends BaseConnector {
  readonly providerId = "manual";
  readonly displayName = "Manual / email fulfillment";
  readonly integrationType = "MANUAL" as const;
  capabilities() {
    return [] as const satisfies import("../types").ConnectorCapability[];
  }
  async healthCheck() {
    return {
      ok: true as const,
      supported: true as const,
      data: { latencyMs: 0, message: "Manual desk is available. Orders must be forwarded by an operator." },
    };
  }
}

export class CsvConnector extends BaseConnector {
  readonly providerId = "csv";
  readonly displayName = "CSV / spreadsheet import";
  readonly integrationType = "CSV" as const;
  capabilities() {
    return ["PRODUCT_SYNC", "INVENTORY_SYNC", "PRICE_SYNC"] as const satisfies import("../types").ConnectorCapability[];
  }
  async healthCheck() {
    return {
      ok: true as const,
      supported: true as const,
      data: { latencyMs: 0, message: "CSV import is available. Upload a file to sync." },
    };
  }
  async getProducts(): Promise<import("../types").CapabilityResult<{ items: import("../types").RawSupplierProduct[]; nextCursor?: string }>> {
    return unsupported("getProducts");
  }
}

export class AffiliateNetworkConnector extends BaseConnector {
  readonly providerId = "affiliate";
  readonly displayName = "Affiliate partner (redirect)";
  readonly integrationType = "CUSTOM" as const;
  capabilities() {
    return [] as const satisfies import("../types").ConnectorCapability[];
  }
  async healthCheck() {
    return {
      ok: true as const,
      supported: true as const,
      data: {
        latencyMs: 0,
        message: "Affiliate products redirect to the partner. Cheshire does not submit fulfillment orders.",
      },
    };
  }
}
