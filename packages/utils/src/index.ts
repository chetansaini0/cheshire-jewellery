import type { Product } from "@cheshire/types";

export const FREE_SHIPPING_THRESHOLD = 999;
export const CURRENCY = "INR" as const;

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calcDiscountPercent(price: number, mrp: number): number {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function amountToFreeShipping(
  subtotal: number,
  threshold = FREE_SHIPPING_THRESHOLD
): number {
  return Math.max(0, threshold - subtotal);
}

export function calcShipping(
  subtotal: number,
  threshold = FREE_SHIPPING_THRESHOLD,
  flatRate = 79
): number {
  return subtotal >= threshold ? 0 : flatRate;
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function getPrimaryImage(product: Product): string {
  const primary = product.images.find((i) => i.isPrimary) ?? product.images[0];
  return primary?.url ?? "/images/products/placeholder.jpg";
}

export function getHoverImage(product: Product): string | null {
  return product.hoverImage ?? product.images[1]?.url ?? null;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function uniqueBy<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const k = key(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function parseBudgetBand(band: string): { min: number; max: number } {
  switch (band) {
    case "UNDER_999":
      return { min: 0, max: 999 };
    case "999_1999":
      return { min: 999, max: 1999 };
    case "1999_4999":
      return { min: 1999, max: 4999 };
    case "5000_PLUS":
      return { min: 5000, max: Number.MAX_SAFE_INTEGER };
    default:
      return { min: 0, max: Number.MAX_SAFE_INTEGER };
  }
}

export function orderStatusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

export function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 90000 + 10000);
  return `CH${y}${m}${d}${rand}`;
}
