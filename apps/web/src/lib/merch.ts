import type { ProductLabel } from "@cheshire/types";

const COPY: Record<ProductLabel, string> = {
  EXCLUSIVE: "Exclusive",
  TRENDING: "Trending",
  NEW: "New",
  BEST_SELLER: "Best Seller",
  LIMITED: "Limited",
  PARTNER_PICK: "Partner Pick",
};

export function merchLabelCopy(label?: ProductLabel | null): string | null {
  if (!label) return null;
  return COPY[label] ?? null;
}
