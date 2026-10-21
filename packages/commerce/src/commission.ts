import type { CommissionScope, ProductType } from "@cheshire/types";

export type CommissionRule = {
  id: string;
  name: string;
  scope: CommissionScope;
  percent: number;
  priority: number;
  isActive: boolean;
  supplierId?: string | null;
  categoryId?: string | null;
  categorySlug?: string | null;
  productId?: string | null;
  collectionSlug?: string | null;
};

export type CommissionContext = {
  productId: string;
  productType: ProductType;
  supplierId?: string | null;
  categorySlug?: string | null;
  collectionSlug?: string | null;
  price: number;
  quantity: number;
  /** Confidential wholesale/cost. Never sent to customers. */
  supplierCost?: number | null;
  productCommissionOverride?: number | null;
  affiliateCommissionPercent?: number | null;
};

export type CommissionResult = {
  percent: number;
  ruleId: string | null;
  ruleName: string;
  customerPrice: number;
  supplierAmount: number;
  cheshireRevenue: number;
  affiliateCommission: number;
  source: "affiliate" | "dropship_margin" | "marketplace_commission";
};

function ruleMatches(rule: CommissionRule, ctx: CommissionContext): boolean {
  if (!rule.isActive) return false;
  switch (rule.scope) {
    case "product":
      return rule.productId === ctx.productId;
    case "collection":
      return Boolean(rule.collectionSlug && rule.collectionSlug === ctx.collectionSlug);
    case "supplier":
      return Boolean(rule.supplierId && rule.supplierId === ctx.supplierId);
    case "category":
      return Boolean(
        (rule.categorySlug && rule.categorySlug === ctx.categorySlug) ||
          (rule.categoryId && rule.categoryId === ctx.categorySlug)
      );
    case "global":
      return true;
    default:
      return false;
  }
}

/** Product > collection > supplier > category > global. Higher priority wins ties. */
export function resolveCommissionPercent(
  rules: CommissionRule[],
  ctx: CommissionContext
): { percent: number; rule: CommissionRule | null } {
  if (ctx.productCommissionOverride != null) {
    return { percent: ctx.productCommissionOverride, rule: null };
  }
  const matches = rules
    .filter((r) => ruleMatches(r, ctx))
    .sort((a, b) => b.priority - a.priority);
  const rule = matches[0] ?? null;
  return { percent: rule?.percent ?? 15, rule };
}

export function calculateLineEconomics(
  rules: CommissionRule[],
  ctx: CommissionContext
): CommissionResult {
  const customerPrice = ctx.price * ctx.quantity;

  if (ctx.productType === "affiliate") {
    const percent = ctx.affiliateCommissionPercent ?? 8;
    const affiliateCommission = Math.round((customerPrice * percent) / 100);
    return {
      percent,
      ruleId: null,
      ruleName: "Affiliate partner commission",
      customerPrice,
      supplierAmount: 0,
      cheshireRevenue: affiliateCommission,
      affiliateCommission,
      source: "affiliate",
    };
  }

  if (ctx.productType === "dropship") {
    const cost = (ctx.supplierCost ?? Math.round(ctx.price * 0.7)) * ctx.quantity;
    const cheshireRevenue = Math.max(0, customerPrice - cost);
    const percent = customerPrice ? Math.round((cheshireRevenue / customerPrice) * 1000) / 10 : 0;
    return {
      percent,
      ruleId: null,
      ruleName: "Dropship margin",
      customerPrice,
      supplierAmount: cost,
      cheshireRevenue,
      affiliateCommission: 0,
      source: "dropship_margin",
    };
  }

  const { percent, rule } = resolveCommissionPercent(rules, ctx);
  const cheshireRevenue = Math.round((customerPrice * percent) / 100);
  return {
    percent,
    ruleId: rule?.id ?? null,
    ruleName: rule?.name ?? "Marketplace commission",
    customerPrice,
    supplierAmount: customerPrice - cheshireRevenue,
    cheshireRevenue,
    affiliateCommission: 0,
    source: "marketplace_commission",
  };
}

export const DEFAULT_COMMISSION_RULES: CommissionRule[] = [
  {
    id: "rule-global",
    name: "Global apparel",
    scope: "global",
    percent: 15,
    priority: 10,
    isActive: true,
  },
  {
    id: "rule-hoodies",
    name: "Hoodies category",
    scope: "category",
    percent: 15,
    priority: 20,
    isActive: true,
    categorySlug: "hoodies",
  },
  {
    id: "rule-supplier-a",
    name: "Atelier Noir",
    scope: "supplier",
    percent: 12,
    priority: 40,
    isActive: true,
    supplierId: "sup-atelier-noir",
  },
  {
    id: "rule-supplier-b",
    name: "Lumen Metals",
    scope: "supplier",
    percent: 18,
    priority: 40,
    isActive: true,
    supplierId: "sup-lumen-metals",
  },
  {
    id: "rule-premium",
    name: "Premium collection",
    scope: "collection",
    percent: 20,
    priority: 50,
    isActive: true,
    collectionSlug: "core",
  },
];

export function summarizeEconomics(lines: CommissionResult[]) {
  return lines.reduce(
    (acc, line) => {
      acc.gmv += line.customerPrice;
      acc.cheshireRevenue += line.cheshireRevenue;
      acc.supplierRevenue += line.supplierAmount;
      acc.affiliateRevenue += line.affiliateCommission;
      return acc;
    },
    { gmv: 0, cheshireRevenue: 0, supplierRevenue: 0, affiliateRevenue: 0 }
  );
}
