export type ShippingZone = {
  id: string;
  supplierId: string;
  name: string;
  regions: string[];
  minDays: number;
  maxDays: number;
  fee: number;
  freeAbove?: number | null;
  codAvailable: boolean;
  returnShippingPaidBy: "customer" | "supplier" | "cheshire";
};

export type ShippingProfile = {
  deliveryMinDays: number;
  deliveryMaxDays: number;
  fee: number;
  freeOver?: number | null;
  codAvailable?: boolean;
  regions?: string[];
};

export function estimateDeliveryWindow(
  profile: ShippingProfile,
  from = new Date()
): { from: Date; to: Date; label: string } {
  const start = new Date(from);
  start.setDate(start.getDate() + profile.deliveryMinDays);
  const end = new Date(from);
  end.setDate(end.getDate() + profile.deliveryMaxDays);
  const fmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long" });
  return {
    from: start,
    to: end,
    label: `Delivery by ${fmt.format(start)}–${fmt.format(end)}`,
  };
}

export function resolveShippingFee(subtotal: number, profile: ShippingProfile) {
  if (profile.freeOver != null && subtotal >= profile.freeOver) return 0;
  return profile.fee;
}
