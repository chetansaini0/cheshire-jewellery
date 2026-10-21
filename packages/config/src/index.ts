export const brand = {
  name: "CHESHIRE",
  tagline: "WEAR THE MOMENT.",
  philosophy: "Streetwear with intention. Heavyweight essentials, bold drops and clothes made to be lived in.",
  domain: "cheshire.com",
  supportEmail: "care@cheshire.com",
  supportWhatsApp: "+919876543210",
  bundleId: "com.cheshire.clothing",
} as const;

export const colors = {
  ivory: "#F4F3EF",
  gold: "#D7FF3A",
  goldSoft: "#ECFFA6",
  goldDeep: "#0A0A0A",
  softBlack: "#0A0A0A",
  charcoal: "#1A1A1A",
  metallic: "#D7FF3A",
  white: "#FFFFFF",
  muted: "#6B6B6B",
  border: "#E4E4E0",
  sale: "#FF3B1F",
} as const;

export const typography = {
  serif: "Archivo Black, Impact, sans-serif",
  sans: "Inter, system-ui, sans-serif",
} as const;

export const nav = {
  primary: [
    { label: "SHOP", href: "/shop" },
    { label: "NEW IN", href: "/shop?sort=newest" },
    { label: "BESTSELLERS", href: "/shop?sort=bestselling" },
    { label: "DROPS", href: "/collections" },
    { label: "LOOKBOOK", href: "/inspiration" },
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
  { slug: "tees", name: "TEES", href: "/shop/tees" },
  { slug: "hoodies", name: "HOODIES", href: "/shop/hoodies" },
  { slug: "outerwear", name: "OUTERWEAR", href: "/shop/outerwear" },
  { slug: "denim", name: "DENIM", href: "/shop/denim" },
  { slug: "dresses", name: "DRESSES", href: "/shop/dresses" },
  { slug: "co-ords", name: "CO-ORDS", href: "/shop/co-ords" },
  { slug: "accessories", name: "ACCESSORIES", href: "/shop/accessories" },
] as const;

export const moods = [
  { slug: "minimal", name: "MINIMAL", copy: "Clean lines. No noise." },
  { slug: "bold", name: "BOLD", copy: "Colour, graphics, volume." },
  { slug: "romantic", name: "ROMANTIC", copy: "Soft fabrics, easy shapes." },
  { slug: "dark", name: "DARK", copy: "Black on black on black." },
  { slug: "everyday", name: "EVERYDAY", copy: "Built for repeat wear." },
  { slug: "statement", name: "STATEMENT", copy: "One piece. Whole fit." },
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
  titleTemplate: "%s · CHESHIRE",
  defaultTitle: "CHESHIRE — Wear The Moment | Streetwear & Clothing",
  description:
    "CHESHIRE — wear the moment. Heavyweight tees, hoodies, outerwear, denim, dresses and co-ords. New drops every week.",
  siteUrl: "https://www.cheshire.com",
  twitterHandle: "@cheshireclothing",
  keywords: [
    "streetwear",
    "oversized tees",
    "hoodies",
    "baggy jeans",
    "co-ord sets",
    "dresses online",
    "outerwear",
    "clothing brand india",
    "new drops",
    "CHESHIRE Clothing",
  ],
} as const;
