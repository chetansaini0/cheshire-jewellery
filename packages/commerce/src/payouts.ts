export type PayoutStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export type PayoutRecord = {
  id: string;
  supplierId: string;
  periodLabel: string;
  grossSale: number;
  cheshireCommission: number;
  refunds: number;
  adjustments: number;
  payout: number;
  status: PayoutStatus;
  createdAt: string;
  paidAt?: string | null;
};

export function payoutTotals(records: PayoutRecord[]) {
  return {
    pending: records.filter((p) => p.status === "PENDING" || p.status === "PROCESSING").reduce((s, p) => s + p.payout, 0),
    completed: records.filter((p) => p.status === "COMPLETED").reduce((s, p) => s + p.payout, 0),
    commission: records.reduce((s, p) => s + p.cheshireCommission, 0),
  };
}

export function supplierPayout(input: {
  grossSale: number;
  commission: number;
  refunds?: number;
  adjustments?: number;
}) {
  const refunds = input.refunds ?? 0;
  const adjustments = input.adjustments ?? 0;
  return {
    grossSale: input.grossSale,
    commission: input.commission,
    refunds,
    adjustments,
    netAmount: input.grossSale - input.commission - refunds + adjustments,
  };
}

export const RETURN_FLOW = [
  "requested",
  "approved",
  "pickup_scheduled",
  "picked_up",
  "received",
  "inspection",
  "refund_initiated",
  "refunded",
] as const;

export function syncAvailability(stock: number, affiliateAvailable = true) {
  if (stock <= 0 || !affiliateAvailable) return "out_of_stock" as const;
  return "in_stock" as const;
}
