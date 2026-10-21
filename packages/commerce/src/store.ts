import type {
  AffiliatePartnerStatus,
  ProductLabel,
  ProductType,
  SupplierOrderStatus,
  SupplierStatus,
} from "@cheshire/types";
import type { CommissionRule } from "./commission";
import { DEFAULT_COMMISSION_RULES } from "./commission";
import type { AffiliateClickRecord } from "./affiliate";
import { recordAffiliateClick } from "./affiliate";
import { estimateDeliveryWindow } from "./shipping";
import { supplierPayout } from "./payouts";
import { createCommerceEvent, emitCommerceEvent, logNotification } from "./events";
import { createOrderNumber, groupSupplierFulfillment, buildInternalLines } from "./orchestration";
import type { CartLike } from "./orchestration";

export type DemoSupplier = {
  id: string;
  brandName: string;
  slug: string;
  ownerName: string;
  email: string;
  phone: string;
  businessName: string;
  gstNumber: string;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  bankAccountName: string;
  bankIfsc: string;
  productCategories: string[];
  shippingRegions: string[];
  returnPolicy: string;
  status: SupplierStatus;
  commissionPercent: number;
  defaultShippingFee: number;
  freeShippingThreshold: number;
  deliveryMinDays: number;
  deliveryMaxDays: number;
  codAvailable: boolean;
};

export type DemoAffiliatePartner = {
  id: string;
  name: string;
  slug: string;
  network: string;
  website: string;
  status: AffiliatePartnerStatus;
  defaultCommission: number;
};

export type ProductInternal = {
  sku: string;
  productType: ProductType;
  supplierId?: string;
  affiliatePartnerId?: string;
  supplierCost?: number;
  affiliateUrl?: string;
  affiliateCommissionPercent?: number;
  stoneType?: string;
  weight?: string;
  subcategory?: string;
  label?: ProductLabel;
  deliveryMinDays?: number;
  deliveryMaxDays?: number;
};

export type StoredSupplierOrder = {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  status: SupplierOrderStatus;
  shippingMethod: string;
  specialInstructions?: string;
  items: Array<{ productId: string; sku: string; name: string; quantity: number; size?: string | null; image: string }>;
  customer: { fullName: string; phone: string; line1: string; city: string; state: string; pincode: string };
  supplierAmount: number;
  commissionAmount: number;
  createdAt: string;
  trackingNumber?: string;
};

export type StoredPayout = {
  id: string;
  supplierId: string;
  grossSale: number;
  commission: number;
  refunds: number;
  adjustments: number;
  netAmount: number;
  status: "pending" | "completed";
  periodLabel: string;
  createdAt: string;
};

export type StoredReturn = {
  id: string;
  orderNumber: string;
  supplierId?: string;
  kind: "return" | "replacement" | "refund";
  status: string;
  reason: string;
  createdAt: string;
};

const suppliers: DemoSupplier[] = [
  {
    id: "sup-atelier-noir",
    brandName: "Atelier Noir",
    slug: "atelier-noir",
    ownerName: "Aanya Shah",
    email: "atelier@lumen.example",
    phone: "+91 90000 11101",
    businessName: "Lumen Atelier Private Limited",
    gstNumber: "27AABCL1234Q1Z5",
    addressLine1: "12 Kala Ghoda",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    bankAccountName: "Lumen Atelier Pvt Ltd",
    bankIfsc: "HDFC0001234",
    productCategories: ["hoodies", "denim"],
    shippingRegions: ["IN"],
    returnPolicy: "7-day returns on unused pieces with original packaging.",
    status: "approved",
    commissionPercent: 12,
    defaultShippingFee: 79,
    freeShippingThreshold: 999,
    deliveryMinDays: 4,
    deliveryMaxDays: 7,
    codAvailable: true,
  },
  {
    id: "sup-lumen-metals",
    brandName: "Northstar Apparel",
    slug: "northstar-apparel",
    ownerName: "Rohan Mehta",
    email: "ops@northstar.example",
    phone: "+91 90000 22202",
    businessName: "Northstar Apparel Co",
    gstNumber: "08AABCN9876P1Z2",
    addressLine1: "Sitapura Industrial Area",
    city: "Jaipur",
    state: "Rajasthan",
    pincode: "302022",
    bankAccountName: "Northstar Apparel Co",
    bankIfsc: "ICIC0004321",
    productCategories: ["tees", "dresses"],
    shippingRegions: ["IN"],
    returnPolicy: "Replacement within 5 days for manufacturing defects.",
    status: "approved",
    commissionPercent: 18,
    defaultShippingFee: 99,
    freeShippingThreshold: 1499,
    deliveryMinDays: 3,
    deliveryMaxDays: 6,
    codAvailable: true,
  },
  {
    id: "sup_pending",
    brandName: "Craft House",
    slug: "craft-house",
    ownerName: "Meera Iyer",
    email: "hello@crafthouse.example",
    phone: "+91 90000 33303",
    businessName: "Craft House Studio",
    gstNumber: "33AABCC1111R1Z8",
    addressLine1: "T. Nagar",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600017",
    bankAccountName: "Craft House Studio",
    bankIfsc: "SBIN0001111",
    productCategories: ["accessories"],
    shippingRegions: ["IN"],
    returnPolicy: "To be confirmed.",
    status: "pending_approval",
    commissionPercent: 15,
    defaultShippingFee: 79,
    freeShippingThreshold: 999,
    deliveryMinDays: 5,
    deliveryMaxDays: 8,
    codAvailable: false,
  },
];

const affiliatePartners: DemoAffiliatePartner[] = [
  {
    id: "aff-brand-xyz",
    name: "Brand XYZ",
    slug: "brand-xyz",
    network: "direct",
    website: "https://partner-example.com",
    status: "active",
    defaultCommission: 8,
  },
  {
    id: "aff_aurelia",
    name: "Maison Aurelia",
    slug: "maison-aurelia",
    network: "impact",
    website: "https://aurelia-example.com",
    status: "active",
    defaultCommission: 10,
  },
];

export const defaultCommissionRules: CommissionRule[] = DEFAULT_COMMISSION_RULES;

/** Confidential internals keyed by SKU. Never sent to the customer catalogue mapper. */
export const productInternals: ProductInternal[] = [
  {
    sku: "CH-BFLY-033",
    productType: "affiliate",
    affiliatePartnerId: "aff-brand-xyz",
    affiliateUrl: "https://partner-example.com/product/123",
    affiliateCommissionPercent: 8,
    stoneType: "None",
    weight: "4.2g",
    subcategory: "jackets",
    label: "PARTNER_PICK",
    deliveryMinDays: 5,
    deliveryMaxDays: 9,
  },
  {
    sku: "CH-AFF-102",
    productType: "affiliate",
    affiliatePartnerId: "aff_aurelia",
    affiliateUrl: "https://aurelia-example.com/shop/structured-tote",
    affiliateCommissionPercent: 10,
    stoneType: "Cubic zirconia",
    weight: "14g",
    subcategory: "cuffs",
    label: "EXCLUSIVE",
  },
  {
    sku: "CH-QLINK-035",
    productType: "dropship",
    supplierId: "sup-lumen-metals",
    supplierCost: 700,
    stoneType: "None",
    weight: "8.0g",
    subcategory: "links",
    label: "TRENDING",
    deliveryMinDays: 3,
    deliveryMaxDays: 6,
  },
  {
    sku: "CH-DS-202",
    productType: "dropship",
    supplierId: "sup-lumen-metals",
    supplierCost: 1180,
    stoneType: "None",
    weight: "11g",
    subcategory: "link",
    label: "NEW",
  },
  {
    sku: "CH-HALO-034",
    productType: "marketplace",
    supplierId: "sup-atelier-noir",
    supplierCost: 2100,
    stoneType: "Cubic zirconia",
    weight: "3.1g",
    subcategory: "statement",
    label: "EXCLUSIVE",
    deliveryMinDays: 4,
    deliveryMaxDays: 7,
  },
  {
    sku: "CH-MP-302",
    productType: "marketplace",
    supplierId: "sup-atelier-noir",
    supplierCost: 1650,
    stoneType: "None",
    weight: "4g",
    subcategory: "bags",
    label: "BEST_SELLER",
  },
];

const clicks: AffiliateClickRecord[] = [];
const conversions: Array<{ clickId: string; amount: number; commission: number; createdAt: string }> = [];
const supplierOrders: StoredSupplierOrder[] = [
  {
    id: "so_1001",
    orderNumber: "CH2609071001",
    supplierId: "sup-lumen-metals",
    supplierName: "Northstar Apparel",
    status: "processing",
    shippingMethod: "Standard",
    items: [{ productId: "local-CH-QLINK-035", sku: "CH-QLINK-035", name: "RELAXED OXFORD SHIRT", quantity: 1, size: "M", image: "" }],
    customer: { fullName: "Priya Kapoor", phone: "+91 98xxxxxx21", line1: "Bandra West", city: "Mumbai", state: "MH", pincode: "400050" },
    supplierAmount: 700,
    commissionAmount: 299,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "so_1002",
    orderNumber: "CH2609071002",
    supplierId: "sup-atelier-noir",
    supplierName: "Atelier Noir",
    status: "shipped",
    shippingMethod: "Standard",
    trackingNumber: "LUM8821IN",
    items: [{ productId: "local-CH-HALO-034", sku: "CH-HALO-034", name: "ATELIER NOIR MINI BAG", quantity: 1, image: "" }],
    customer: { fullName: "Arjun Nair", phone: "+91 98xxxxxx44", line1: "Indiranagar", city: "Bengaluru", state: "KA", pincode: "560038" },
    supplierAmount: 2631,
    commissionAmount: 358,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];
const payouts: StoredPayout[] = [
  {
    id: "po_1",
    supplierId: "sup-atelier-noir",
    ...supplierPayout({ grossSale: 29900, commission: 3588, refunds: 0 }),
    status: "completed",
    periodLabel: "August 2026",
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
  {
    id: "po_2",
    supplierId: "sup-lumen-metals",
    ...supplierPayout({ grossSale: 18400, commission: 3312, refunds: 999 }),
    status: "pending",
    periodLabel: "September 2026",
    createdAt: new Date().toISOString(),
  },
];
const returns: StoredReturn[] = [
  {
    id: "ret_1",
    orderNumber: "CH2608310881",
    supplierId: "sup-atelier-noir",
    kind: "return",
    status: "inspection",
    reason: "Size exchange requested",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];
const events: ReturnType<typeof createCommerceEvent>[] = [];
const analytics = {
  productViews: 12840,
  addToCart: 2144,
  checkoutStarted: 980,
  purchases: 412,
  affiliateClicks: 186,
  affiliateConversions: 22,
};

export function getSuppliers() {
  return suppliers;
}

export function getSupplier(idOrSlug: string) {
  return suppliers.find((s) => s.id === idOrSlug || s.slug === idOrSlug || s.email === idOrSlug);
}

export function getAffiliatePartners() {
  return affiliatePartners;
}

export function getAffiliatePartner(id: string) {
  return affiliatePartners.find((p) => p.id === id || p.slug === id);
}

export function getCommissionRules() {
  return defaultCommissionRules;
}

export function getProductInternal(sku: string) {
  return productInternals.find((p) => p.sku === sku);
}

export function internalsByProductId(productId: string, sku?: string) {
  const found = productInternals.find((p) => p.sku === sku || `local-${p.sku}` === productId);
  if (!found) return {};
  const supplier = found.supplierId ? getSupplier(found.supplierId) : undefined;
  const partner = found.affiliatePartnerId ? getAffiliatePartner(found.affiliatePartnerId) : undefined;
  return {
    supplierId: found.supplierId,
    supplierName: supplier?.brandName,
    supplierCost: found.supplierCost,
    affiliateCommissionPercent: found.affiliateCommissionPercent,
    affiliateUrl: found.affiliateUrl,
    partnerId: partner?.id,
    partnerName: partner?.name,
  };
}

export function publicCommerceFields(sku: string) {
  const internal = getProductInternal(sku);
  const supplier = internal?.supplierId ? getSupplier(internal.supplierId) : undefined;
  const partner = internal?.affiliatePartnerId ? getAffiliatePartner(internal.affiliatePartnerId) : undefined;
  const shipping = estimateDeliveryWindow({
    deliveryMinDays: internal?.deliveryMinDays ?? supplier?.deliveryMinDays ?? 3,
    deliveryMaxDays: internal?.deliveryMaxDays ?? supplier?.deliveryMaxDays ?? 6,
    fee: supplier?.defaultShippingFee ?? 79,
    freeOver: supplier?.freeShippingThreshold ?? 999,
  });
  return {
    productType: internal?.productType ?? ("dropship" as const),
    brandSlug: supplier?.slug || partner?.slug || null,
    brandName: supplier?.brandName || partner?.name || null,
    subcategory: internal?.subcategory ?? null,
    stoneType: internal?.stoneType ?? null,
    weight: internal?.weight ?? null,
    label: internal?.label ?? null,
    estimatedDelivery: shipping.label,
    affiliateDisclosure: internal?.productType === "affiliate",
    availability: "in_stock" as const,
  };
}

export function trackAffiliateClick(input: {
  sku: string;
  productId: string;
  productName: string;
  product: Parameters<typeof recordAffiliateClick>[0]["product"];
  sessionId?: string;
  userId?: string;
  campaign?: string;
  source?: string;
}) {
  const internal = getProductInternal(input.sku);
  const partner = internal?.affiliatePartnerId ? getAffiliatePartner(internal.affiliatePartnerId) : undefined;
  if (!internal?.affiliateUrl || !partner) {
    throw new Error("Affiliate destination is not configured for this product");
  }
  const click = recordAffiliateClick({
    product: input.product,
    partnerId: partner.id,
    partnerName: partner.name,
    destinationUrl: internal.affiliateUrl,
    sessionId: input.sessionId,
    userId: input.userId,
    campaign: input.campaign,
    source: input.source || "pdp",
  });
  clicks.unshift(click);
  analytics.affiliateClicks += 1;
  const event = createCommerceEvent("affiliate_click", {
    trackingId: click.trackingId,
    productId: input.productId,
    partnerId: partner.id,
  });
  events.unshift(event);
  void emitCommerceEvent(event);
  return click;
}

export function getAffiliateClicks() {
  return clicks;
}

export function getAffiliateStats() {
  const byPartner: Record<string, { clicks: number; conversions: number; commission: number }> = {};
  for (const click of clicks) {
    const row = (byPartner[click.partnerId] ??= { clicks: 0, conversions: 0, commission: 0 });
    row.clicks += 1;
  }
  for (const conv of conversions) {
    const click = clicks.find((c) => c.trackingId === conv.clickId);
    if (!click) continue;
    const row = (byPartner[click.partnerId] ??= { clicks: 0, conversions: 0, commission: 0 });
    row.conversions += 1;
    row.commission += conv.commission;
  }
  const estimatedCommission = clicks.reduce((s, c) => {
    const internal = getProductInternal(c.product.sku);
    return s + Math.round((c.product.price * (internal?.affiliateCommissionPercent ?? 8)) / 100);
  }, 0);
  return {
    clicks: clicks.length || analytics.affiliateClicks,
    conversions: conversions.length || analytics.affiliateConversions,
    estimatedCommission: estimatedCommission || 18420,
    byPartner,
    recent: clicks.slice(0, 20),
  };
}

export function getSupplierOrders(supplierId?: string) {
  return supplierId ? supplierOrders.filter((o) => o.supplierId === supplierId) : supplierOrders;
}

export function updateSupplierOrderStatus(id: string, supplierId: string, status: SupplierOrderStatus) {
  const order = supplierOrders.find((o) => o.id === id && o.supplierId === supplierId);
  if (!order) return null;
  order.status = status;
  if (status === "shipped") order.trackingNumber = order.trackingNumber || `TRK${Date.now().toString().slice(-8)}`;
  const event = createCommerceEvent(
    status === "shipped" ? "order_shipped" : status === "delivered" ? "order_delivered" : "supplier_accepted",
    { supplierOrderId: id, status }
  );
  events.unshift(event);
  void emitCommerceEvent(event);
  logNotification("email", getSupplier(supplierId)?.email || "ops@cheshire.com", `Order ${order.orderNumber} is now ${status}`);
  return order;
}

export function getPayouts(supplierId?: string) {
  return supplierId ? payouts.filter((p) => p.supplierId === supplierId) : payouts;
}

export function getReturns(supplierId?: string) {
  return supplierId ? returns.filter((r) => r.supplierId === supplierId) : returns;
}

export function getAnalytics() {
  const conversionRate = analytics.productViews
    ? Math.round((analytics.purchases / analytics.productViews) * 1000) / 10
    : 0;
  return { ...analytics, conversionRate };
}

export function recordAnalytics(name: keyof typeof analytics, increment = 1) {
  analytics[name] += increment;
}

export function recordCheckoutFulfillment(input: {
  items: CartLike[];
  address: StoredSupplierOrder["customer"] & { email?: string };
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}) {
  const orderNumber = createOrderNumber();
  const internalsMap: Record<string, ReturnType<typeof internalsByProductId>> = {};
  for (const item of input.items) {
    internalsMap[item.productId] = internalsByProductId(item.productId, item.product.sku);
  }
  const lines = buildInternalLines(input.items, defaultCommissionRules, internalsMap);
  const fulfillable = lines.filter((l) => l.item.product.productType !== "affiliate");
  const groups = groupSupplierFulfillment(fulfillable);
  const created: StoredSupplierOrder[] = groups.map((g, i) => {
    const row: StoredSupplierOrder = {
      id: `so_${orderNumber}_${i}`,
      orderNumber,
      supplierId: g.supplierId,
      supplierName: g.supplierName,
      status: "pending",
      shippingMethod: g.shippingMethod,
      specialInstructions: g.specialInstructions,
      items: g.items,
      customer: input.address,
      supplierAmount: g.supplierAmount,
      commissionAmount: g.commissionAmount,
      createdAt: new Date().toISOString(),
    };
    supplierOrders.unshift(row);
    const supplier = getSupplier(g.supplierId);
    logNotification(
      "email",
      supplier?.email || "ops@cheshire.com",
      `New CHESHIRE fulfillment ${orderNumber}: ${g.items.map((it) => `${it.sku} x${it.quantity}`).join(", ")}`
    );
    const event = createCommerceEvent("supplier_order_created", { supplierOrderId: row.id, orderNumber });
    events.unshift(event);
    void emitCommerceEvent(event);
    return row;
  });

  const cheshireRevenue = fulfillable.reduce((s, l) => s + l.economics.cheshireRevenue, 0);
  const supplierRevenue = fulfillable.reduce((s, l) => s + l.economics.supplierAmount, 0);
  analytics.purchases += 1;

  return {
    orderNumber,
    supplierOrders: created,
    cheshireRevenue,
    supplierRevenue,
    paymentMethod: input.paymentMethod,
    total: input.total,
  };
}

export function adminDashboardMetrics() {
  const gmv = 2140000;
  return {
    gmv,
    cheshireRevenue: 286400,
    supplierRevenue: 1642800,
    affiliateRevenue: 18420,
    orders: analytics.purchases + 872,
    customers: 8420,
    suppliers: suppliers.filter((s) => s.status === "approved").length,
    pendingOrders: supplierOrders.filter((o) => o.status === "pending" || o.status === "processing").length,
    pendingPayouts: payouts.filter((p) => p.status === "pending").reduce((s, p) => s + p.netAmount, 0),
    returns: returns.length,
    refunds: 2,
    affiliateClicks: getAffiliateStats().clicks,
    conversionRate: getAnalytics().conversionRate,
  };
}

export function registerSupplier(input: Omit<DemoSupplier, "id" | "status" | "slug"> & { slug?: string }) {
  const row: DemoSupplier = {
    ...input,
    id: `sup_${Date.now().toString(36)}`,
    slug: input.slug || input.brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    status: "pending_approval",
  };
  suppliers.push(row);
  return row;
}

export function setSupplierStatus(id: string, status: SupplierStatus, notes?: string) {
  const row = getSupplier(id);
  if (!row) return null;
  row.status = status;
  if (notes) row.returnPolicy = row.returnPolicy;
  return row;
}

export const DEMO_SUPPLIER_LOGIN = {
  email: "atelier@lumen.example",
  hint: "Use this approved supplier email on /supplier to preview the dashboard.",
};
