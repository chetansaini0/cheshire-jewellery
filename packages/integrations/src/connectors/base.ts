import type { CapabilityResult, ConnectorCapability, ConnectorContext, SafeError } from "../types";
import type {
  InventorySnapshot,
  NormalizedSupplierOrder,
  PriceSnapshot,
  RawSupplierProduct,
  TrackingInfo,
} from "../types";

export function unsupported(method: string): { ok: false; supported: false; reason: string } {
  return {
    ok: false,
    supported: false,
    reason: `${method} is not supported by this connector. Use manual or CSV fulfillment instead.`,
  };
}

export function fail(code: string, message: string, retryable = false): { ok: false; supported: true; error: SafeError } {
  return { ok: false, supported: true, error: { code, message, retryable } };
}

export function ok<T>(data: T): { ok: true; supported: true; data: T } {
  return { ok: true, supported: true, data };
}

export interface SupplierConnector {
  readonly providerId: string;
  readonly displayName: string;
  readonly integrationType: import("../types").IntegrationType;
  capabilities(): ConnectorCapability[];
  supports(capability: ConnectorCapability): boolean;
  healthCheck(ctx: ConnectorContext): Promise<CapabilityResult<{ latencyMs: number; message: string }>>;
  getProducts(
    ctx: ConnectorContext,
    opts?: { cursor?: string; limit?: number }
  ): Promise<CapabilityResult<{ items: RawSupplierProduct[]; nextCursor?: string }>>;
  getProduct(ctx: ConnectorContext, supplierProductId: string): Promise<CapabilityResult<RawSupplierProduct>>;
  getInventory(ctx: ConnectorContext, ids?: string[]): Promise<CapabilityResult<InventorySnapshot[]>>;
  getPrices(ctx: ConnectorContext, ids?: string[]): Promise<CapabilityResult<PriceSnapshot[]>>;
  createOrder(
    ctx: ConnectorContext,
    order: NormalizedSupplierOrder
  ): Promise<CapabilityResult<{ remoteOrderId: string }>>;
  getOrderStatus(
    ctx: ConnectorContext,
    remoteOrderId: string
  ): Promise<CapabilityResult<{ status: string; mapped: import("@cheshire/types").SupplierOrderStatus }>>;
  getShipmentTracking(ctx: ConnectorContext, remoteOrderId: string): Promise<CapabilityResult<TrackingInfo>>;
  cancelOrder(ctx: ConnectorContext, remoteOrderId: string): Promise<CapabilityResult<{ cancelled: boolean }>>;
}

export abstract class BaseConnector implements SupplierConnector {
  abstract readonly providerId: string;
  abstract readonly displayName: string;
  abstract readonly integrationType: import("../types").IntegrationType;
  abstract capabilities(): ConnectorCapability[];

  supports(capability: ConnectorCapability) {
    return this.capabilities().includes(capability);
  }

  healthCheck(_ctx: ConnectorContext): Promise<CapabilityResult<{ latencyMs: number; message: string }>> {
    return Promise.resolve(unsupported("healthCheck"));
  }
  getProducts(_ctx: ConnectorContext): Promise<CapabilityResult<{ items: RawSupplierProduct[]; nextCursor?: string }>> {
    return Promise.resolve(unsupported("getProducts"));
  }
  getProduct(_ctx: ConnectorContext, _id: string): Promise<CapabilityResult<RawSupplierProduct>> {
    return Promise.resolve(unsupported("getProduct"));
  }
  getInventory(_ctx: ConnectorContext): Promise<CapabilityResult<InventorySnapshot[]>> {
    return Promise.resolve(unsupported("getInventory"));
  }
  getPrices(_ctx: ConnectorContext): Promise<CapabilityResult<PriceSnapshot[]>> {
    return Promise.resolve(unsupported("getPrices"));
  }
  createOrder(_ctx: ConnectorContext, _order: NormalizedSupplierOrder): Promise<CapabilityResult<{ remoteOrderId: string }>> {
    return Promise.resolve(unsupported("createOrder"));
  }
  getOrderStatus(
    _ctx: ConnectorContext,
    _id: string
  ): Promise<CapabilityResult<{ status: string; mapped: import("@cheshire/types").SupplierOrderStatus }>> {
    return Promise.resolve(unsupported("getOrderStatus"));
  }
  getShipmentTracking(_ctx: ConnectorContext, _id: string): Promise<CapabilityResult<TrackingInfo>> {
    return Promise.resolve(unsupported("getShipmentTracking"));
  }
  cancelOrder(_ctx: ConnectorContext, _id: string): Promise<CapabilityResult<{ cancelled: boolean }>> {
    return Promise.resolve(unsupported("cancelOrder"));
  }
}
