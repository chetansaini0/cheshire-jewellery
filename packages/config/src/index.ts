export const brand = {
  name: "CHESHIRE",
  tagline: "LUXURY WITHOUT TRYING TOO HARD.",
  philosophy: "Jewellery designed for the moments that become memories.",
  domain: "cheshire.com",
  supportEmail: "care@cheshire.com",
  supportWhatsApp: "+919876543210",
  bundleId: "com.cheshire.jewellery",
} as const;

export const colors = {
  ivory: "#F7F5F0",
  softBlack: "#111111",
  charcoal: "#242424",
  metallic: "#B8B8B8",
  white: "#FFFFFF",
  muted: "#6B6B6B",
  border: "#E6E2DA",
  sale: "#8B1E1E",
} as const;

export const typography = {
  serif: "Cormorant Garamond, Georgia, serif",
  sans: "Manrope, system-ui, sans-serif",
} as const;

export const nav = {
  primary: [
    { label: "SHOP", href: "/shop" },
    { label: "NEW IN", href: "/shop?sort=newest" },
    { label: "BESTSELLERS", href: "/shop?sort=bestselling" },
    { label: "COLLECTIONS", href: "/collections" },
    { label: "INSPIRATION", href: "/inspiration" },
    { label: "GIFTS", href: "/gifts" },
    { label: "ABOUT", href: "/about" },
  ],
  utility: [
    { label: "SEARCH", href: "/search", icon: "search" },
    { label: "ACCOUNT", href: "/account", icon: "account" },
    { label: "WISHLIST", href: "/wishlist", icon: "wishlist" },
    { label: "CART", href: "/cart", icon: "cart" },
  ],
} as const;

export const categories = [
  { slug: "rings", name: "RINGS", href: "/shop/rings" },
  { slug: "necklaces", name: "NECKLACES", href: "/shop/necklaces" },
  { slug: "earrings", name: "EARRINGS", href: "/shop/earrings" },
  { slug: "bracelets", name: "BRACELETS", href: "/shop/bracelets" },
  { slug: "anklets", name: "ANKLETS", href: "/shop/anklets" },
  { slug: "sets", name: "SETS", href: "/shop/sets" },
] as const;

export const moods = [
  { slug: "minimal", name: "MINIMAL", copy: "Quiet lines. Loud presence." },
  { slug: "bold", name: "BOLD", copy: "Made to be noticed." },
  { slug: "romantic", name: "ROMANTIC", copy: "Soft edge, hard to forget." },
  { slug: "dark", name: "DARK", copy: "Night energy. Day confidence." },
  { slug: "everyday", name: "EVERYDAY", copy: "Luxury that lives with you." },
  { slug: "statement", name: "STATEMENT", copy: "One piece. Whole look." },
] as const;

export const giftCategories = [
  { slug: "for-her", name: "FOR HER", href: "/gifts/for-her" },
  { slug: "for-him", name: "FOR HIM", href: "/gifts/for-him" },
  { slug: "for-yourself", name: "FOR YOURSELF", href: "/gifts/for-yourself" },
  { slug: "under-999", name: "UNDER ₹999", href: "/gifts/under-999" },
  { slug: "under-1999", name: "UNDER ₹1999", href: "/gifts/under-1999" },
  { slug: "premium", name: "PREMIUM GIFTS", href: "/gifts/premium" },
] as const;

export const orderTimeline = [
  "PLACED",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

export const freeShippingThreshold = 999;

export const seoDefaults = {
  titleTemplate: "%s · CHESHIRE Jewellery",
  defaultTitle: "CHESHIRE Jewellery — Wear Your Story",
  description:
    "Contemporary aesthetic jewellery for people who treat jewellery as part of their identity. Luxury without trying too hard.",
  siteUrl: "https://www.cheshire.com",
  twitterHandle: "@cheshirejewellery",
  keywords: [
    "aesthetic jewellery",
    "minimal jewellery",
    "premium jewellery",
    "trendy jewellery",
    "fashion jewellery",
    "everyday jewellery",
    "statement jewellery",
    "jewellery online",
    "gifts for her",
    "gifts for him",
    "CHESHIRE Jewellery",
  ],
} as const;
