import { productImage } from "@cheshire/database/catalog";

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Math.round(n));

export const compactInr = (n: number) => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)}L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
  return `₹${Math.round(n)}`;
};

export const num = (n: number) => new Intl.NumberFormat("en-IN").format(n);

export const dateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(new Date(iso));

export const dateOnly = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(iso));

/** Accepts catalogue ids ("photo-…", "px:<id>") or absolute https URLs. */
export function imageUrl(id: string, w = 400) {
  if (/^https?:\/\//.test(id)) return id;
  return productImage(id, w);
}

export function isOptimisableImage(src: string) {
  return src.startsWith("https://images.unsplash.com") || src.startsWith("https://images.pexels.com");
}
