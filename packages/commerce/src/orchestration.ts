import type { CartPartition, Product, ProductType } from "@cheshire/types";
import { generateOrderNumber, getPrimaryImage } from "@cheshire/utils";
import { calculateLineEconomics, type CommissionRule, type CommissionResult } from "./commission";

export type CartLike = {
  id?: string;
  productId: string;
  quantity: number;
  product: Product;
  variantLabel?: string | null;
  variantId?: string | null;
};

export function productTypeOf(product: Product): ProductType {
  return product.productType ?? "dropship";
}

export function isAffiliateProduct(product: Product) {
  return productTypeOf(product) === "affiliate";
}

export function isFulfillableProduct(product: Product) {
  return !isAffiliateProduct(product);
}

export function partitionCartItems(items: CartLike[]): CartPartition {
  const affiliate: CartPartition["affiliate"] = [];
  const dropship: CartPartition["dropship"] = [];
  const marketplace: CartPartition["marketplace"] = [];

  for (const item of items) {
    const mapped = {
      id: item.id || `${item.productId}`,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      product: item.product,
    };
    const type = productTypeOf(item.product);
    if (type === "affiliate") affiliate.push(mapped);
    else if (type === "marketplace") marketplace.push(mapped);
    else dropship.push(mapped);
  }

  const fulfillable = [...dropship, ...marketplace];
  return {
    affiliate,
    dropship,
    marketplace,
    fulfillable,
    hasAffiliate: affiliate.length > 0,
    hasFulfillable: fulfillable.length > 0,
    isMixed: affiliate.length > 0 && fulfillable.length > 0,
  };
}

export type InternalLine = {
  item: CartLike;
  economics: CommissionResult;
  supplierId?: string | null;
  supplierName?: string | null;
  supplierCost?: number | null;
};

export function buildInternalLines(
  items: CartLike[],
  rules: CommissionRule[],
  internals: Record<
    string,
    { supplierId?: string | null; supplierName?: string | null; supplierCost?: number | null; affiliateCommissionPercent?: number | null }
  >
): InternalLine[] {
  return items.map((item) => {
    const meta = internals[item.productId] ?? {};
    const economics = calculateLineEconomics(rules, {
      productId: item.productId,
      productType: productTypeOf(item.product),
      supplierId: meta.supplierId,
      categorySlug: item.product.category,
      collectionSlug: item.product.collection,
      price: item.product.price,
      quantity: item.quantity,
      supplierCost: meta.supplierCost,
      affiliateCommissionPercent: meta.affiliateCommissionPercent,
    });
    return {
      item,
      economics,
      supplierId: meta.supplierId,
      supplierName: meta.supplierName,
      supplierCost: meta.supplierCost,
    };
  });
}

export type SupplierFulfillmentDraft = {
  supplierId: string;
  supplierName: string;
  status: "pending";
  shippingMethod: string;
  specialInstructions?: string;
  items: Array<{
    productId: string;
    sku: string;
    name: string;
    quantity: number;
    size?: string | null;
    image: string;
  }>;
  supplierAmount: number;
  commissionAmount: number;
};

export function groupSupplierFulfillment(
  lines: InternalLine[],
  shippingMethod = "Standard"
): SupplierFulfillmentDraft[] {
  const map = new Map<string, SupplierFulfillmentDraft>();
  for (const line of lines) {
    if (productTypeOf(line.item.product) === "affiliate") continue;
    const supplierId = line.supplierId || "cheshire-dropship";
    const existing = map.get(supplierId);
    const entry: SupplierFulfillmentDraft = existing ?? {
      supplierId,
      supplierName: line.supplierName || "CHESHIRE fulfillment",
      status: "pending",
      shippingMethod,
      items: [],
      supplierAmount: 0,
      commissionAmount: 0,
    };
    entry.items.push({
      productId: line.item.productId,
      sku: line.item.product.sku,
      name: line.item.product.name,
      quantity: line.item.quantity,
      size: line.item.variantLabel ?? null,
      image: getPrimaryImage(line.item.product),
    });
    entry.supplierAmount += line.economics.supplierAmount;
    entry.commissionAmount += line.economics.cheshireRevenue;
    map.set(supplierId, entry);
  }
  return [...map.values()];
}

export function createOrderNumber() {
  return generateOrderNumber();
}

export { generateOrderNumber };
