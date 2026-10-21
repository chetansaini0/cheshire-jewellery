import type { SupplierOrderStatus } from "@cheshire/types";
import { BaseConnector, fail, ok } from "./base";
import type { ConnectorContext, RawSupplierProduct, TrackingInfo } from "../types";

export type MockCatalogItem = RawSupplierProduct & { remoteOrderStatus?: string };

const IMAGE = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

function seedCatalog(): MockCatalogItem[] {
  const rows: Array<Omit<MockCatalogItem, "supplierProductId"> & { id: string }> = [
    {
      id: "mjh-01",
      sku: "MJH-NK-001",
      name: "Everyday Pullover Hoodie",
      description: "A midweight pullover hoodie in brushed cotton. Layer it or wear it solo.",
      category: "Topwear",
      material: "Cotton Jersey",
      color: "Black",
      weight: "6.2 oz",
      price: 700,
      stock: 10,
      images: [IMAGE("photo-1556821840-3a63f95609a7")],
    },
    {
      id: "mjh-02",
      sku: "MJH-RG-002",
      name: "Pocket Crew Tee",
      description: "A regular-fit crew with a chest pocket.",
      category: "Tee",
      material: "Combed Cotton",
      color: "Black",
      weight: "5.1 oz",
      price: 820,
      stock: 10,
      images: [IMAGE("photo-1564584217132-2271feaeb3c5")],
    },
    {
      id: "mjh-03",
      sku: "MJH-ER-003",
      name: "Dawn Straight Jeans",
      description: "Straight-leg jeans in a soft mid wash.",
      category: "Jeans",
      material: "Denim 14oz",
      color: "Black",
      weight: "2.4 oz",
      price: 540,
      stock: 10,
      images: [IMAGE("photo-1475178626620-a4d074967452")],
    },
    {
      id: "mjh-04",
      sku: "MJH-BR-004",
      name: "Cadence Tiered Dress",
      description: "A tiered cotton dress cut for movement.",
      category: "Frocks",
      material: "Cotton Jersey",
      color: "Black",
      weight: "11 oz",
      price: 960,
      stock: 10,
      images: [IMAGE("photo-1515372039744-b8f02a3ae446")],
    },
    {
      id: "mjh-05",
      sku: "MJH-NK-005",
      name: "Rope Knit Sweatshirt",
      description: "A rope-stitch knit sweatshirt with ribbed trims.",
      category: "Topwear",
      material: "Cotton Jersey",
      color: "Black",
      weight: "8.0 oz",
      price: 1100,
      stock: 10,
      images: [IMAGE("photo-1620799140408-edc6dcb6d633")],
    },
    {
      id: "mjh-06",
      sku: "MJH-ER-006",
      name: "Arc Denim Jacket",
      description: "A cropped denim jacket with curved seams.",
      category: "Jacket",
      material: "Combed Cotton",
      color: "Black",
      weight: "4.8 oz",
      price: 780,
      stock: 10,
      images: [IMAGE("photo-1543076447-215ad9ba6923")],
    },
    {
      id: "mjh-07",
      sku: "MJH-RG-007",
      name: "Offset Graphic Tee",
      description: "An off-centre chest graphic on heavy cotton.",
      category: "Tee",
      material: "Cotton Jersey",
      stoneType: "None",
      color: "Black",
      weight: "3.6 oz",
      price: 890,
      stock: 10,
      images: [IMAGE("photo-1503341504253-dff4815485f1")],
    },
    {
      id: "mjh-08",
      sku: "MJH-AK-008",
      name: "Trail Washed Cap",
      description: "A washed cotton cap with an embroidered bar.",
      category: "Cap",
      material: "Denim 14oz",
      color: "Black",
      weight: "3.2 oz",
      price: 620,
      stock: 10,
      images: [IMAGE("photo-1588850561407-ed78c282e89b")],
    },
    {
      id: "mjh-09",
      sku: "MJH-ST-009",
      name: "Twin Track Set",
      description: "Track jacket and pant, sold as a set.",
      category: "Co-ord",
      material: "Cotton Jersey",
      color: "Black",
      weight: "14 oz",
      price: 1490,
      stock: 10,
      images: [IMAGE("photo-1509631179647-0177331693ae")],
    },
    {
      id: "mjh-10",
      sku: "MJH-BR-010",
      name: "Soft Bomber",
      description: "A padded bomber with rounded collar.",
      category: "Jacket",
      material: "Brass",
      color: "Olive",
      weight: "18 oz",
      price: 640,
      stock: 10,
      images: [IMAGE("photo-1591047139829-d91aecb6caea")],
    },
  ];
  return rows.map((r) => ({ ...r, supplierProductId: r.id }));
}

/**
 * In-process mock apparel hub. Explicitly labelled MOCK.
 * Not a live supplier. Catalog mutates so inventory/price sync can be demonstrated.
 */
export class MockSupplierConnector extends BaseConnector {
  readonly providerId = "mock-jewellery-hub";
  readonly displayName = "Cheshire Mock Hub (sandbox)";
  readonly integrationType = "MOCK" as const;
  private catalog = seedCatalog();
  private orders = new Map<
    string,
    { status: SupplierOrderStatus; tracking?: TrackingInfo; items: { id: string; qty: number }[] }
  >();

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

  reset() {
    this.catalog = seedCatalog();
    this.orders.clear();
  }

  setStock(supplierProductId: string, stock: number) {
    const row = this.catalog.find((p) => p.supplierProductId === supplierProductId);
    if (row) row.stock = stock;
  }

  setPrice(supplierProductId: string, price: number) {
    const row = this.catalog.find((p) => p.supplierProductId === supplierProductId);
    if (row) row.price = price;
  }

  removeProduct(supplierProductId: string) {
    this.catalog = this.catalog.filter((p) => p.supplierProductId !== supplierProductId);
  }

  private guard(ctx: ConnectorContext, kind: NonNullable<ConnectorContext["simulateFailure"]>) {
    if (ctx.simulateFailure === "timeout") {
      return fail("TIMEOUT", "Supplier did not respond in time.", true);
    }
    if (ctx.simulateFailure === kind) {
      return fail("PROVIDER_ERROR", "Mock supplier simulated a temporary failure.", true);
    }
    return null;
  }

  async healthCheck(ctx: ConnectorContext) {
    const blocked = this.guard(ctx, "health");
    if (blocked) return blocked;
    return ok({ latencyMs: 12, message: "Mock hub reachable. This is sandbox data, not a live supplier." });
  }

  async getProducts(ctx: ConnectorContext, opts?: { cursor?: string; limit?: number }) {
    const blocked = this.guard(ctx, "products");
    if (blocked) return blocked;
    const limit = Math.min(opts?.limit ?? 50, 50);
    const start = Number(opts?.cursor || 0);
    const slice = this.catalog.slice(start, start + limit);
    const next = start + limit < this.catalog.length ? String(start + limit) : undefined;
    return ok({ items: slice, nextCursor: next });
  }

  async getProduct(ctx: ConnectorContext, id: string) {
    const blocked = this.guard(ctx, "products");
    if (blocked) return blocked;
    const row = this.catalog.find((p) => p.supplierProductId === id || p.sku === id);
    if (!row) return fail("NOT_FOUND", "Product not in mock catalog.", false);
    return ok(row);
  }

  async getInventory(ctx: ConnectorContext, ids?: string[]) {
    const blocked = this.guard(ctx, "inventory");
    if (blocked) return blocked;
    const rows = ids?.length ? this.catalog.filter((p) => ids.includes(p.supplierProductId)) : this.catalog;
    return ok(rows.map((p) => ({ supplierProductId: p.supplierProductId, sku: p.sku, stock: p.stock })));
  }

  async getPrices(ctx: ConnectorContext, ids?: string[]) {
    const blocked = this.guard(ctx, "inventory");
    if (blocked) return blocked;
    const rows = ids?.length ? this.catalog.filter((p) => ids.includes(p.supplierProductId)) : this.catalog;
    return ok(rows.map((p) => ({ supplierProductId: p.supplierProductId, sku: p.sku, price: p.price })));
  }

  async createOrder(ctx: ConnectorContext, order: import("../types").NormalizedSupplierOrder) {
    const blocked = this.guard(ctx, "order");
    if (blocked) return blocked;
    for (const item of order.items) {
      const row = this.catalog.find((p) => p.supplierProductId === item.supplierProductId || p.sku === item.sku);
      if (!row || row.stock < item.quantity) {
        return fail("OUT_OF_STOCK", "Mock hub declined the line — insufficient stock.", false);
      }
    }
    for (const item of order.items) {
      const row = this.catalog.find((p) => p.supplierProductId === item.supplierProductId || p.sku === item.sku);
      if (row) row.stock -= item.quantity;
    }
    const remoteOrderId = `MOCK-${order.cheshireOrderNumber}`;
    this.orders.set(remoteOrderId, {
      status: "confirmed",
      items: order.items.map((i) => ({ id: i.supplierProductId, qty: i.quantity })),
    });
    return ok({ remoteOrderId });
  }

  async getOrderStatus(_ctx: ConnectorContext, remoteOrderId: string) {
    const row = this.orders.get(remoteOrderId);
    if (!row) return fail("NOT_FOUND", "Unknown mock order.", false);
    return ok({ status: row.status, mapped: row.status });
  }

  async getShipmentTracking(_ctx: ConnectorContext, remoteOrderId: string) {
    const row = this.orders.get(remoteOrderId);
    if (!row) return fail("NOT_FOUND", "Unknown mock order.", false);
    const tracking: TrackingInfo = row.tracking ?? {
      courier: "MockShip",
      trackingNumber: `MS${remoteOrderId.slice(-6)}`,
      trackingUrl: `https://tracking.example.invalid/${remoteOrderId}`,
      status: row.status,
    };
    return ok(tracking);
  }

  async cancelOrder(_ctx: ConnectorContext, remoteOrderId: string) {
    const row = this.orders.get(remoteOrderId);
    if (!row) return fail("NOT_FOUND", "Unknown mock order.", false);
    row.status = "cancelled";
    return ok({ cancelled: true });
  }

  accept(remoteOrderId: string) {
    const row = this.orders.get(remoteOrderId);
    if (row) row.status = "processing";
  }

  ship(remoteOrderId: string) {
    const row = this.orders.get(remoteOrderId);
    if (!row) return;
    row.status = "shipped";
    row.tracking = {
      courier: "MockShip",
      trackingNumber: `MS${Date.now().toString().slice(-8)}`,
      trackingUrl: `https://tracking.example.invalid/${remoteOrderId}`,
      status: "shipped",
      estimatedDelivery: new Date(Date.now() + 86400000 * 4).toISOString(),
    };
  }

  deliver(remoteOrderId: string) {
    const row = this.orders.get(remoteOrderId);
    if (row) {
      row.status = "delivered";
      if (row.tracking) row.tracking.status = "delivered";
    }
  }
}

export const mockHub = new MockSupplierConnector();
