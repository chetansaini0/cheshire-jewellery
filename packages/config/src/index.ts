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
    { label: "ETHNIC", href: "/collections/festive-edit" },
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
  { slug: "lehengas", name: "LEHENGAS", href: "/shop/lehengas" },
  { slug: "sarees", name: "SAREES", href: "/shop/sarees" },
  { slug: "suits", name: "SUITS", href: "/shop/suits" },
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
    "lehengas online",
    "designer sarees",
    "anarkali suits",
    "salwar suits",
    "dresses online",
    "outerwear",
    "clothing brand india",
    "new drops",
    "CHESHIRE Clothing",
  ],
} as const;

export type HeroBanner = {
  id: string;
  eyebrow: string;
  headline: string;
  /** Second line rendered in outline style */
  accent: string;
  supporting: string;
  cta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  /** Image ids resolved with productImage(): "photo-…" (Unsplash) or "px:<id>" (Pexels) */
  imageIds: [string] | [string, string];
  theme: "dark" | "lime";
  isActive: boolean;
  sortOrder: number;
};

/** Homepage hero carousel. Shown on the storefront and listed in Admin → Banners. */
export const heroBanners: HeroBanner[] = [
  {
    id: "drop-07",
    eyebrow: "Drop 07 — Live now",
    headline: "Wear the",
    accent: "moment.",
    supporting: "Heavyweight essentials, loud graphics and sharp outerwear. Designed in India, built to be lived in.",
    cta: { label: "Shop the drop", href: "/shop?sort=newest" },
    secondaryCta: { label: "View lookbook", href: "/inspiration" },
    imageIds: ["photo-1520975954732-35dd22299614", "photo-1529139574466-a303027c1d8b"],
    theme: "dark",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "festive-edit",
    eyebrow: "The Festive Edit",
    headline: "Shaadi",
    accent: "season.",
    supporting: "Lehengas, sarees and suits in banarasi, chanderi and georgette — for every function on the card.",
    cta: { label: "Shop lehengas", href: "/shop/lehengas" },
    secondaryCta: { label: "Sarees & suits", href: "/collections/festive-edit" },
    imageIds: ["px:27329528", "px:29585830"],
    theme: "dark",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "denim-lab",
    eyebrow: "Denim Lab",
    headline: "Baggy is",
    accent: "back.",
    supporting: "14oz rigid denim, cut wide and low. Built to fade into your story.",
    cta: { label: "Shop denim", href: "/shop/denim" },
    imageIds: ["photo-1541099649105-f69ad21f3246", "photo-1542272604-787c3835535d"],
    theme: "dark",
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "sale",
    eyebrow: "Season sale — up to 40% off",
    headline: "Last",
    accent: "call.",
    supporting: "Tees, hoodies and outerwear marked down while sizes last. No code needed.",
    cta: { label: "Shop the sale", href: "/shop?sort=price_asc" },
    imageIds: ["photo-1578587018452-892bacefd3f2", "photo-1503342217505-b0a15ec3261c"],
    theme: "lime",
    isActive: true,
    sortOrder: 4,
  },
  {
    id: "lookbook-fw26",
    eyebrow: "Lookbook — FW26",
    headline: "Styled by",
    accent: "the street.",
    supporting: "Trench season, track sets and all-black everything. Tap a look to shop it.",
    cta: { label: "Open lookbook", href: "/inspiration" },
    imageIds: ["photo-1539533018447-63fcce2678e3", "photo-1509631179647-0177331693ae"],
    theme: "dark",
    isActive: true,
    sortOrder: 5,
  },
];
