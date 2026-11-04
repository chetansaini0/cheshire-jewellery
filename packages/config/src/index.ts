export const brand = {
  name: "CHESHIRE",
  tagline: "Roots. Remixed.",
  secondaryTagline: "Wear Your World",
  philosophy: "Luxury without trying too hard. Rooted in tradition, styled for now.",
  domain: "cheshire.com",
  supportEmail: "care@cheshire.com",
  supportWhatsApp: "+919876543210",
  bundleId: "com.cheshire.clothing",
} as const;

/** Mirrors packages/ui/tokens.json (the Tailwind preset). Kept here for non-Tailwind consumers (mobile, emails). */
export const colors = {
  ivory: "#F7F5F0",
  gold: "#A6844A",
  goldSoft: "#EFE7D8",
  goldDeep: "#7D6235",
  softBlack: "#111111",
  charcoal: "#2A2826",
  metallic: "#A6844A",
  white: "#FFFFFF",
  muted: "#6B6560",
  border: "#E8E4DD",
  sale: "#9E3B2E",
} as const;

export const typography = {
  serif: "Cormorant Garamond, Georgia, serif",
  sans: "Manrope, system-ui, sans-serif",
} as const;

export const nav = {
  primary: [
    { label: "New In", href: "/new-in" },
    { label: "Women", href: "/women" },
    { label: "Men", href: "/men" },
    { label: "Collections", href: "/collections" },
    { label: "About", href: "/about" },
  ],
  utility: [
    { label: "SEARCH", href: "/search", icon: "search" },
    { label: "ACCOUNT", href: "/account", icon: "account" },
    { label: "WISHLIST", href: "/wishlist", icon: "wishlist" },
    { label: "CART", href: "/cart", icon: "cart" },
  ],
} as const;

export type CategoryGroup = "ethnic" | "casual" | "accessories";

export const categoryGroups: Array<{ slug: CategoryGroup; name: string; description: string }> = [
  { slug: "ethnic", name: "Ethnic", description: "Sarees, lehengas, suits and kurtas." },
  { slug: "casual", name: "Casual", description: "Tees, hoodies, sweatshirts, denim and layers." },
  { slug: "accessories", name: "Accessories", description: "Bags, sneakers and finishing pieces." },
];

export const categories = [
  { slug: "sarees", name: "Sarees", href: "/shop/sarees", group: "ethnic" },
  { slug: "lehengas", name: "Lehengas", href: "/shop/lehengas", group: "ethnic" },
  { slug: "suits", name: "Suits", href: "/shop/suits", group: "ethnic" },
  { slug: "kurtas", name: "Kurtas", href: "/shop/kurtas", group: "ethnic" },
  { slug: "tees", name: "T-shirts", href: "/shop/tees", group: "casual" },
  { slug: "hoodies", name: "Hoodies", href: "/shop/hoodies", group: "casual" },
  { slug: "sweatshirts", name: "Sweatshirts", href: "/shop/sweatshirts", group: "casual" },
  { slug: "outerwear", name: "Outerwear", href: "/shop/outerwear", group: "casual" },
  { slug: "denim", name: "Denim", href: "/shop/denim", group: "casual" },
  { slug: "dresses", name: "Dresses", href: "/shop/dresses", group: "casual" },
  { slug: "co-ords", name: "Co-ords", href: "/shop/co-ords", group: "casual" },
  { slug: "accessories", name: "Accessories", href: "/shop/accessories", group: "accessories" },
] as const;

/** Ethnic / Casual / Accessories for any category slug (unknown → casual). */
export function categoryGroup(slug: string): CategoryGroup {
  return (categories.find((c) => c.slug === slug)?.group as CategoryGroup | undefined) ?? "casual";
}

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
  defaultTitle: "CHESHIRE — Roots. Remixed. | Fusion wear for a Gen Z India",
  description:
    "Roots. Remixed. CHESHIRE is fusion wear for a Gen Z India: sarees, lehengas, suits and kurtas alongside hoodies, tees, sweatshirts and accessories. Tradition meets now.",
  siteUrl: "https://www.cheshire.com",
  twitterHandle: "@cheshireclothing",
  keywords: [
    "fusion wear india",
    "indo-western clothing",
    "sarees online",
    "lehengas online",
    "kurtas for men",
    "kurta sets for women",
    "anarkali suits",
    "hoodies india",
    "oversized t-shirts",
    "sweatshirts",
    "gen z fashion india",
    "contemporary indian clothing brand",
    "CHESHIRE Clothing",
  ],
} as const;

export type HeroBanner = {
  id: string;
  eyebrow: string;
  headline: string;
  /** Second line, set in champagne italic */
  accent: string;
  supporting: string;
  cta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  /**
   * Finished artwork with the headline and "Shop now" baked in (e.g. "/banners/banner-01-wear-the-mix.webp",
   * served from the app's /public). When set, the storefront shows the whole image and links it to `cta.href`.
   */
  image?: string;
  /** Pixel size of `image` (defaults to 2880×1440, 2:1; keep text inside the centre 2400×1200 safe area). */
  imageSize?: { width: number; height: number };
  /** Colours down the artwork's left and right edges (top → bottom), used to fill any letterbox around `image`. */
  edgeColors?: { left: string[]; right: string[] };
  /** Photo ids for text-overlay banners, resolved with productImage(): "photo-…" (Unsplash) or "px:<id>" (Pexels). Unused when `image` is set. */
  imageIds: string[];
  /** "light" = ivory editorial panel, "dark" = soft-black panel. (Legacy "lime" is read as "light".) */
  theme: "light" | "dark";
  isActive: boolean;
  sortOrder: number;
};

/** Most banners that can be live in the homepage carousel at once. */
export const MAX_ACTIVE_BANNERS = 8;

/** Homepage hero carousel. Shown on the storefront and listed in Admin → Banners. */
export const heroBanners: HeroBanner[] = [
  {
    id: "wear-the-mix",
    eyebrow: "Fusion ethnic streetwear",
    headline: "Wear the",
    accent: "mix.",
    supporting: "Fusion ethnic streetwear for the now generation.",
    cta: { label: "Shop now", href: "/new-in" },
    image: "/banners/banner-01-wear-the-mix-v3.webp",
    imageSize: { width: 2880, height: 1440 },
    edgeColors: { left: ["#004B59", "#004958", "#004655", "#004250", "#003D4C"], right: ["#B95134", "#B95134", "#B85133", "#B54F31", "#8D503B"] },
    imageIds: [],
    theme: "light",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "no-rules",
    eyebrow: "Sarees",
    headline: "No",
    accent: "rules.",
    supporting: "The saree, styled your way.",
    cta: { label: "Shop now", href: "/shop/sarees" },
    image: "/banners/banner-02-no-rules-v3.webp",
    imageSize: { width: 2880, height: 1440 },
    edgeColors: { left: ["#E6D1B5", "#E9D4B8", "#EAD6BA", "#EBD6BB", "#EAD5B9"], right: ["#EAD5BA", "#EDD9BF", "#EFDBC2", "#F1DCC4", "#F1DDC4"] },
    imageIds: [],
    theme: "light",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "two-worlds-one-style",
    eyebrow: "Ethnic x street",
    headline: "Two worlds,",
    accent: "one style.",
    supporting: "Tradition meets street. Style unites.",
    cta: { label: "Shop now", href: "/collections" },
    image: "/banners/banner-03-two-worlds-one-style-v3.webp",
    imageSize: { width: 2880, height: 1440 },
    edgeColors: { left: ["#F0E0CA", "#DCCEB0", "#A6996A", "#D6C5A6", "#EDDBC3"], right: ["#96928C", "#6A6865", "#686765", "#595957", "#5E5E5B"] },
    imageIds: [],
    theme: "light",
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "culture-in-motion",
    eyebrow: "Lehengas",
    headline: "Culture",
    accent: "in motion.",
    supporting: "Contemporary silhouettes. Timeless heritage.",
    cta: { label: "Shop now", href: "/shop/lehengas" },
    image: "/banners/banner-04-culture-in-motion-v3.webp",
    imageSize: { width: 2880, height: 1440 },
    edgeColors: { left: ["#23211F", "#534E49", "#4B4642", "#2D2A27", "#242322"], right: ["#625D59", "#756E6A", "#79736F", "#6F6965", "#575350"] },
    imageIds: [],
    theme: "light",
    isActive: true,
    sortOrder: 4,
  },
  {
    id: "roots-remixed",
    eyebrow: "The new season",
    headline: "Roots.",
    accent: "Remixed.",
    supporting: "Modern layers. Heritage forever. Styled for now.",
    cta: { label: "Shop now", href: "/women" },
    image: "/banners/banner-05-roots-remixed-v3.webp",
    imageSize: { width: 2880, height: 1440 },
    edgeColors: { left: ["#FEF4E3", "#FEF6E4", "#FEF6E5", "#FEF6E5", "#FEF6E5"], right: ["#FEF5E3", "#FEF6E5", "#FEF6E6", "#FEF7E6", "#FEF7E7"] },
    imageIds: [],
    theme: "light",
    isActive: true,
    sortOrder: 5,
  },
  {
    id: "the-new-heirloom",
    eyebrow: "The Festive Edit",
    headline: "The new",
    accent: "heirloom.",
    supporting: "Contemporary ethnic wear for a modern legacy.",
    cta: { label: "Shop now", href: "/collections/festive-edit" },
    image: "/banners/banner-06-the-new-heirloom-v3.webp",
    imageSize: { width: 2880, height: 1440 },
    edgeColors: { left: ["#EBD9C5", "#EEDCC9", "#EFDDCA", "#EDDAC6", "#E6D1BC"], right: ["#C2A88F", "#C2A88D", "#AC8F6F", "#715639", "#5B4531"] },
    imageIds: [],
    theme: "light",
    isActive: true,
    sortOrder: 6,
  },
  {
    id: "fashion-has-no-rules",
    eyebrow: "Women",
    headline: "Fashion has",
    accent: "no rules.",
    supporting: "Style is yours. Own it.",
    cta: { label: "Shop now", href: "/women" },
    image: "/banners/banner-07-fashion-has-no-rules-v3.webp",
    imageSize: { width: 2880, height: 1440 },
    edgeColors: { left: ["#FEC6CB", "#FECACD", "#FEC9CC", "#FEC5CA", "#FEC3C8"], right: ["#FEBDC5", "#FEC1C8", "#FEC5CB", "#FEC2C9", "#FEC3CA"] },
    imageIds: [],
    theme: "light",
    isActive: true,
    sortOrder: 7,
  },
];
