import type { AffiliateClick, AffiliateConversion } from "./affiliate";
import { DEFAULT_COMMISSION_RULES } from "./commission";
import type { PayoutRecord } from "./payouts";
import type { ShippingZone } from "./shipping";

export type SupplierStatus = "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "SUSPENDED" | "CHANGES_REQUESTED";
export type ProductLifecycle = "DRAFT" | "SUBMITTED" | "APPROVED" | "LIVE" | "REJECTED" | "INACTIVE";
export type SupplierOrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Packed"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled"
  | "Return Requested"
  | "Returned"
  | "Refunded";

export type DemoSupplier = {
  id: string;
  userId: string;
  brandName: string;
  slug: string;
  ownerName: string;
  email: string;
  phone: string;
  businessName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstin?: string;
  bankAccountName: string;
  bankLast4: string;
  ifscMasked: string;
  categories: string[];
  shippingRegions: string[];
  returnPolicy: string;
  status: SupplierStatus;
  commissionPercent?: number;
  createdAt: string;
};

export type DemoAffiliatePartner = {
  id: string;
  name: string;
  slug: string;
  network: "direct" | "impact" | "cj" | "shareasale" | "custom";
  status: "active" | "inactive";
  defaultCommissionPercent: number;
  contactEmail: string;
};

export type InternalProductEconomics = {
  sku: string;
  productType: "affiliate" | "dropship" | "marketplace";
  supplierId?: string;
  affiliatePartnerId?: string;
  destinationUrl?: string;
  supplierCost?: number;
  commissionPercent?: number;
  affiliateCommissionPercent?: number;
};

export type DemoSupplierOrder = {
  id: string;
  orderNumber: string;
  supplierId: string;
  status: SupplierOrderStatus;
  sku: string;
  productName: string;
  quantity: number;
  customerName: string;
  city: string;
  pincode: string;
  shippingMethod: string;
  total: number;
  createdAt: string;
};

export type DemoReturn = {
  id: string;
  orderNumber: string;
  supplierId: string;
  type: "Return" | "Replacement" | "Refund";
  status:
    | "Requested"
    | "Approved"
    | "Pickup Scheduled"
    | "Picked Up"
    | "Received"
    | "Inspection"
    | "Refund Initiated"
    | "Refunded"
    | "Rejected";
  reason: string;
  amount: number;
  createdAt: string;
};

export const demoSuppliers: DemoSupplier[] = [
  {
    id: "sup-cheshire-house",
    userId: "user-house",
    brandName: "CHESHIRE Atelier",
    slug: "cheshire",
    ownerName: "CHESHIRE Ops",
    email: "atelier@cheshire.com",
    phone: "+91 80000 00000",
    businessName: "CHESHIRE Clothing",
    address: "Confidential fulfilment desk",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    gstin: "27AABCU9603R1ZM",
    bankAccountName: "CHESHIRE CLOTHING",
    bankLast4: "2104",
    ifscMasked: "HDFC****2104",
    categories: ["tees", "hoodies", "denim", "dresses"],
    shippingRegions: ["IN"],
    returnPolicy: "7-day unused returns",
    status: "APPROVED",
    createdAt: "2026-01-12T10:00:00.000Z",
  },
  {
    id: "sup-atelier-noir",
    userId: "user-noir",
    brandName: "Atelier Noir",
    slug: "atelier-noir",
    ownerName: "Meera Kapoor",
    email: "meera@ateliernoir.in",
    phone: "+91 98200 11111",
    businessName: "Atelier Noir Private Limited",
    address: "12 Kala Ghoda",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    gstin: "27AAPCA1111A1Z5",
    bankAccountName: "ATELIER NOIR PVT LTD",
    bankLast4: "8841",
    ifscMasked: "ICIC****8841",
    categories: ["tees", "hoodies"],
    shippingRegions: ["IN"],
    returnPolicy: "7-day unused returns, original packaging",
    status: "APPROVED",
    commissionPercent: 12,
    createdAt: "2026-04-02T09:00:00.000Z",
  },
  {
    id: "sup-lumen-metals",
    userId: "user-lumen",
    brandName: "Lumen Metals",
    slug: "lumen-metals",
    ownerName: "Arjun Sethi",
    email: "arjun@lumenmetals.com",
    phone: "+91 98111 22222",
    businessName: "Lumen Metals LLP",
    address: "88 Sector 18",
    city: "Gurugram",
    state: "Haryana",
    pincode: "122015",
    gstin: "06AABCL2222B1Z3",
    bankAccountName: "LUMEN METALS LLP",
    bankLast4: "4402",
    ifscMasked: "SBIN****4402",
    categories: ["dresses", "outerwear"],
    shippingRegions: ["IN"],
    returnPolicy: "Replacement within 5 days for manufacturing defects",
    status: "APPROVED",
    commissionPercent: 18,
    createdAt: "2026-05-18T11:00:00.000Z",
  },
  {
    id: "sup-maison-aurelia",
    userId: "user-aurelia",
    brandName: "Maison Aurelia",
    slug: "maison-aurelia",
    ownerName: "Aurelia D'Souza",
    email: "hello@maisonaurelia.com",
    phone: "+91 99000 33333",
    businessName: "Maison Aurelia",
    address: "4 Church Street",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    bankAccountName: "MAISON AURELIA",
    bankLast4: "1190",
    ifscMasked: "HDFC****1190",
    categories: ["denim", "accessories"],
    shippingRegions: ["IN", "AE"],
    returnPolicy: "Made-to-order — returns on defect only",
    status: "PENDING_APPROVAL",
    createdAt: "2026-09-01T08:30:00.000Z",
  },
];

export const demoAffiliatePartners: DemoAffiliatePartner[] = [
  {
    id: "aff-brand-xyz",
    name: "Brand XYZ",
    slug: "brand-xyz",
    network: "direct",
    status: "active",
    defaultCommissionPercent: 8,
    contactEmail: "partners@brandxyz.example",
  },
  {
    id: "aff-lumen-edit",
    name: "Lumen Edit",
    slug: "lumen-edit",
    network: "custom",
    status: "inactive",
    defaultCommissionPercent: 10,
    contactEmail: "affiliates@lumenmetals.com",
  },
];

/** Server-only destinations. Never expose on the public Product type. */
export const affiliateDestinations: Record<string, string> = {
  "partner-varsity-jacket": "https://partner-example.com/product/123",
};

export const internalEconomics: InternalProductEconomics[] = [
  {
    sku: "CH-BFLY-033",
    productType: "affiliate",
    affiliatePartnerId: "aff-brand-xyz",
    destinationUrl: affiliateDestinations["partner-varsity-jacket"],
    affiliateCommissionPercent: 8,
  },
  {
    sku: "CH-HALO-034",
    productType: "marketplace",
    supplierId: "sup-atelier-noir",
    supplierCost: 2100,
    commissionPercent: 12,
  },
  {
    sku: "CH-QLINK-035",
    productType: "dropship",
    supplierId: "sup-lumen-metals",
    supplierCost: 700,
  },
];

export const demoShippingZones: ShippingZone[] = [
  {
    id: "zone-noir-in",
    supplierId: "sup-atelier-noir",
    name: "India metro",
    regions: ["IN"],
    minDays: 4,
    maxDays: 7,
    fee: 89,
    freeAbove: 1499,
    codAvailable: true,
    returnShippingPaidBy: "customer",
  },
  {
    id: "zone-lumen-in",
    supplierId: "sup-lumen-metals",
    name: "India standard",
    regions: ["IN"],
    minDays: 3,
    maxDays: 6,
    fee: 79,
    freeAbove: 999,
    codAvailable: true,
    returnShippingPaidBy: "supplier",
  },
];

export const demoSupplierOrders: DemoSupplierOrder[] = [
  {
    id: "so-1001",
    orderNumber: "CH2609041001",
    supplierId: "sup-atelier-noir",
    status: "Shipped",
    sku: "CH-HALO-034",
    productName: "ATELIER NOIR MINI BAG",
    quantity: 1,
    customerName: "A. Sharma",
    city: "Pune",
    pincode: "411001",
    shippingMethod: "Standard",
    total: 2999,
    createdAt: "2026-09-04T11:20:00.000Z",
  },
  {
    id: "so-1002",
    orderNumber: "CH2609051002",
    supplierId: "sup-lumen-metals",
    status: "Processing",
    sku: "CH-QLINK-035",
    productName: "RELAXED OXFORD SHIRT",
    quantity: 2,
    customerName: "R. Iyer",
    city: "Chennai",
    pincode: "600004",
    shippingMethod: "Standard",
    total: 1998,
    createdAt: "2026-09-05T16:10:00.000Z",
  },
  {
    id: "so-1003",
    orderNumber: "CH2609061003",
    supplierId: "sup-atelier-noir",
    status: "Pending",
    sku: "CH-HALO-034",
    productName: "ATELIER NOIR MINI BAG",
    quantity: 1,
    customerName: "S. Banerjee",
    city: "Kolkata",
    pincode: "700019",
    shippingMethod: "Standard",
    total: 2999,
    createdAt: "2026-09-06T09:45:00.000Z",
  },
];

export const demoPayouts: PayoutRecord[] = [
  {
    id: "pay-noir-aug",
    supplierId: "sup-atelier-noir",
    periodLabel: "August 2026",
    grossSale: 128960,
    cheshireCommission: 15475,
    refunds: 2999,
    adjustments: 0,
    payout: 110486,
    status: "COMPLETED",
    createdAt: "2026-09-01T10:00:00.000Z",
    paidAt: "2026-09-02T14:00:00.000Z",
  },
  {
    id: "pay-lumen-aug",
    supplierId: "sup-lumen-metals",
    periodLabel: "August 2026",
    grossSale: 84230,
    cheshireCommission: 15161,
    refunds: 0,
    adjustments: 500,
    payout: 68569,
    status: "COMPLETED",
    createdAt: "2026-09-01T10:00:00.000Z",
    paidAt: "2026-09-02T14:10:00.000Z",
  },
  {
    id: "pay-noir-sep",
    supplierId: "sup-atelier-noir",
    periodLabel: "September 2026",
    grossSale: 41986,
    cheshireCommission: 5038,
    refunds: 0,
    adjustments: 0,
    payout: 36948,
    status: "PENDING",
    createdAt: "2026-09-07T08:00:00.000Z",
  },
];

export const demoReturns: DemoReturn[] = [
  {
    id: "ret-01",
    orderNumber: "CH2608280881",
    supplierId: "sup-atelier-noir",
    type: "Return",
    status: "Inspection",
    reason: "Size mismatch",
    amount: 2999,
    createdAt: "2026-08-30T12:00:00.000Z",
  },
  {
    id: "ret-02",
    orderNumber: "CH2609010902",
    supplierId: "sup-lumen-metals",
    type: "Replacement",
    status: "Approved",
    reason: "Finish defect",
    amount: 999,
    createdAt: "2026-09-03T15:20:00.000Z",
  },
];

export const seedAffiliateClicks: AffiliateClick[] = [
  {
    id: "clk-seed-1",
    trackingId: "aff_seed_1",
    productId: "local-CH-BFLY-033",
    productSlug: "partner-varsity-jacket",
    partnerId: "aff-brand-xyz",
    partnerName: "Brand XYZ",
    campaign: "edit-sep",
    source: "pdp",
    network: "direct",
    destinationUrl: affiliateDestinations["partner-varsity-jacket"],
    createdAt: "2026-09-05T10:12:00.000Z",
    converted: true,
    estimatedCommission: 120,
  },
  {
    id: "clk-seed-2",
    trackingId: "aff_seed_2",
    productId: "local-CH-BFLY-033",
    productSlug: "partner-varsity-jacket",
    partnerId: "aff-brand-xyz",
    partnerName: "Brand XYZ",
    campaign: "edit-sep",
    source: "cart",
    network: "direct",
    destinationUrl: affiliateDestinations["partner-varsity-jacket"],
    createdAt: "2026-09-06T18:40:00.000Z",
  },
];

export const seedAffiliateConversions: AffiliateConversion[] = [
  {
    id: "cnv-seed-1",
    clickId: "clk-seed-1",
    trackingId: "aff_seed_1",
    productId: "local-CH-BFLY-033",
    partnerId: "aff-brand-xyz",
    orderRef: "XYZ-4412",
    amount: 1499,
    commission: 120,
    status: "approved",
    createdAt: "2026-09-05T12:08:00.000Z",
  },
];

export const commissionRules = DEFAULT_COMMISSION_RULES;

export function economicsForSku(sku: string): InternalProductEconomics | undefined {
  return internalEconomics.find((e) => e.sku === sku);
}

export function supplierById(id: string): DemoSupplier | undefined {
  return demoSuppliers.find((s) => s.id === id);
}

export function partnerById(id: string): DemoAffiliatePartner | undefined {
  return demoAffiliatePartners.find((p) => p.id === id);
}
