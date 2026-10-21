export type ShippingQuoteInput = {
  provider: import("./types").ShippingProviderId;
  fee: number;
  minDays: number;
  maxDays: number;
  freeOver?: number;
  subtotal: number;
};

export function quoteShipping(input: ShippingQuoteInput) {
  const fee = input.freeOver != null && input.subtotal >= input.freeOver ? 0 : input.fee;
  const start = new Date();
  start.setDate(start.getDate() + input.minDays);
  const end = new Date();
  end.setDate(end.getDate() + input.maxDays);
  const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "long" });
  return {
    provider: input.provider,
    fee,
    label: `Delivery by ${fmt(start)}–${fmt(end)}`,
    minDays: input.minDays,
    maxDays: input.maxDays,
  };
}

export const SHIPPING_PROVIDERS = [
  { id: "supplier", label: "Supplier-provided shipping" },
  { id: "manual", label: "Manual shipping" },
  { id: "shiprocket", label: "Shiprocket (adapter pending)" },
  { id: "delhivery", label: "Delhivery (adapter pending)" },
  { id: "bluedart", label: "Blue Dart (adapter pending)" },
  { id: "indiapost", label: "India Post (adapter pending)" },
] as const;
