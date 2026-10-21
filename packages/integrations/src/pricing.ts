import type { PricingQuote, PricingRule } from "./types";

const GLOBAL_RULE: PricingRule = {
  id: "global-default",
  method: "PERCENT_MARGIN",
  value: 20,
  minMargin: 50,
  rounding: "nearest_9",
  priority: 0,
};

export function resolvePricingRule(rules: PricingRule[], ctx: { supplierId?: string; category?: string; productId?: string }) {
  const matches = [...rules, GLOBAL_RULE]
    .filter((r) => {
      if (r.productId) return r.productId === ctx.productId;
      if (r.categorySlug) return r.categorySlug === ctx.category && (!r.supplierId || r.supplierId === ctx.supplierId);
      if (r.supplierId) return r.supplierId === ctx.supplierId && !r.categorySlug && !r.productId;
      return !r.productId && !r.categorySlug && !r.supplierId;
    })
    .sort((a, b) => b.priority - a.priority);
  return matches[0] ?? GLOBAL_RULE;
}

function roundPrice(amount: number, mode: PricingRule["rounding"]) {
  if (mode === "nearest_9") return Math.max(9, Math.round(amount / 10) * 10 - 1);
  if (mode === "nearest_99") return Math.max(99, Math.round(amount / 100) * 100 - 1);
  return Math.round(amount);
}

/** Product override → category → supplier → global. */
export function quoteCustomerPrice(
  supplierCost: number,
  rules: PricingRule[],
  ctx: { supplierId?: string; category?: string; productId?: string; previousCost?: number }
): PricingQuote {
  const rule = resolvePricingRule(rules, ctx);
  let raw =
    rule.method === "FIXED_MARGIN"
      ? supplierCost + rule.value
      : rule.method === "COMMISSION_MARKUP"
        ? supplierCost / Math.max(0.05, 1 - rule.value / 100)
        : supplierCost * (1 + rule.value / 100);
  if (rule.minMargin != null) raw = Math.max(raw, supplierCost + rule.minMargin);
  const customerPrice = roundPrice(raw, rule.rounding);
  const margin = customerPrice - supplierCost;
  const lossRisk = margin <= 0 || customerPrice < supplierCost;
  let flaggedChange: PricingQuote["flaggedChange"];
  if (ctx.previousCost && ctx.previousCost > 0 && supplierCost !== ctx.previousCost) {
    const changePercent = Math.round(((supplierCost - ctx.previousCost) / ctx.previousCost) * 1000) / 10;
    if (Math.abs(changePercent) >= 15) {
      flaggedChange = { previousCost: ctx.previousCost, newCost: supplierCost, changePercent };
    }
  }
  return {
    supplierCost,
    customerPrice,
    margin,
    marginPercent: supplierCost ? Math.round((margin / supplierCost) * 1000) / 10 : 0,
    ruleId: rule.id,
    lossRisk,
    flaggedChange,
  };
}

export function assertSellableQuote(quote: PricingQuote) {
  if (quote.lossRisk) {
    throw Object.assign(new Error("Price protection: this line would sell below supplier cost."), {
      code: "LOSS_RISK",
    });
  }
  return quote;
}
