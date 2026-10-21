import { affiliateSummary, listAffiliateClicks, listAffiliateConversions } from "./affiliate";
import { seedAffiliateClicks, seedAffiliateConversions, demoPayouts, demoSupplierOrders, demoReturns } from "./demo";

export type PlatformKpis = {
  gmv: number;
  cheshireRevenue: number;
  supplierRevenue: number;
  affiliateRevenue: number;
  orders: number;
  customers: number;
  suppliers: number;
  pendingOrders: number;
  pendingPayouts: number;
  returns: number;
  refunds: number;
};

export function platformKpis(): PlatformKpis {
  const affiliate = affiliateSummary(
    seedAffiliateClicks,
    seedAffiliateConversions.concat(listAffiliateConversions())
  );
  const gmv = demoSupplierOrders.reduce((s, o) => s + o.total, 0) + 428900;
  const supplierRevenue = demoPayouts.reduce((s, p) => s + p.payout, 0);
  const cheshireRevenue = demoPayouts.reduce((s, p) => s + p.cheshireCommission, 0) + affiliate.commission;
  return {
    gmv,
    cheshireRevenue,
    supplierRevenue,
    affiliateRevenue: affiliate.commission,
    orders: 1284 + demoSupplierOrders.length,
    customers: 8420,
    suppliers: 4,
    pendingOrders: demoSupplierOrders.filter((o) => o.status === "Pending").length + 11,
    pendingPayouts: demoPayouts.filter((p) => p.status === "PENDING").reduce((s, p) => s + p.payout, 0),
    returns: demoReturns.length + 18,
    refunds: demoReturns.filter((r) => r.type === "Refund" || r.status === "Refunded").length + 7,
  };
}

export function seriesLast14Days(base: number, seed = 7): Array<{ label: string; value: number }> {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const wave = Math.sin((i + seed) / 2.4) * 0.18 + 1;
    return {
      label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      value: Math.round(base * wave * (0.85 + (i % 5) * 0.04)),
    };
  });
}

export function liveAffiliateSummary() {
  return affiliateSummary(
    seedAffiliateClicks.concat(listAffiliateClicks()),
    seedAffiliateConversions.concat(listAffiliateConversions())
  );
}
