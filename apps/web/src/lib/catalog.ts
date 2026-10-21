import type { Product, ProductFilters, Paginated, Mood, Occasion, ProductLabel } from "@cheshire/types";
import {
  calcDiscount,
  productImage,
  seedProducts,
  categories as seedCategories,
} from "@cheshire/database/catalog";
import { publicCommerceFields } from "@cheshire/commerce";

const LABEL_FROM_COPY: Record<string, ProductLabel> = {
  Exclusive: "EXCLUSIVE",
  Trending: "TRENDING",
  New: "NEW",
  "Best Seller": "BEST_SELLER",
  Limited: "LIMITED",
  "Partner Pick": "PARTNER_PICK",
};

function merchLabel(p: (typeof seedProducts)[number], fallback: ProductLabel | null): ProductLabel | null {
  if (fallback) return fallback;
  const fromCopy = p.labels?.[0] ? LABEL_FROM_COPY[p.labels[0]] : undefined;
  if (fromCopy) return fromCopy;
  if (p.badge === "BESTSELLER") return "BEST_SELLER";
  if (p.badge === "NEW") return "NEW";
  if (p.badge === "LIMITED") return "LIMITED";
  if (p.badge === "EXCLUSIVE") return "EXCLUSIVE";
  if (p.badge === "TRENDING") return "TRENDING";
  if (p.badge === "PARTNER_PICK") return "PARTNER_PICK";
  return null;
}

export function mapSeedToProduct(p: (typeof seedProducts)[number], index: number): Product {
  const commerce = publicCommerceFields(p.sku);
  return {
    id: `local-${p.sku}`,
    sku: p.sku,
    name: p.name,
    slug: p.slug,
    description: p.description,
    shortDescription: p.shortDescription,
    price: p.price,
    mrp: p.mrp,
    discountPercent: calcDiscount(p.price, p.mrp),
    category: p.category as Product["category"],
    collection: p.collection ?? null,
    material: p.material,
    color: p.color,
    moods: p.moods as Mood[],
    occasions: p.occasions as Occasion[],
    tags: p.tags,
    badge: p.badge ?? null,
    rating: p.rating,
    reviewCount: p.reviewCount,
    stock: p.stock,
    images: [
      {
        id: `${p.sku}-1`,
        url: productImage(p.imageIds[0]),
        alt: p.name,
        sortOrder: 0,
        isPrimary: true,
      },
      {
        id: `${p.sku}-2`,
        url: productImage(p.imageIds[1]),
        alt: `${p.name} alternate`,
        sortOrder: 1,
      },
    ],
    hoverImage: productImage(p.imageIds[1]),
    videoUrl: p.videoUrl ?? null,
    sizes: p.sizes,
    dimensions: "See size guide on product page",
    care: "Machine wash cold, inside out. Do not tumble dry. Iron on reverse.",
    shippingInfo: p.estimatedDeliveryMinDays
      ? `Dispatch in 24–48 hours. ${commerce.estimatedDelivery}`
      : "Dispatched in 24–48 hours. Free shipping over ₹999.",
    returnsInfo: "Easy 7-day returns on unused products.",
    warranty: "30-day quality promise on seams and fabric.",
    seoTitle: `${p.name} | CHESHIRE`,
    seoDescription: p.shortDescription,
    isPublished: true,
    isNew: Boolean(p.isNew) || index < 6,
    isBestseller: Boolean(p.isBestseller),
    createdAt: new Date(Date.now() - index * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    productType: p.productType ?? commerce.productType,
    brandSlug: p.brandSlug ?? commerce.brandSlug,
    brandName: p.brandName ?? commerce.brandName,
    subcategory: p.subcategory ?? commerce.subcategory,
    stoneType: p.stoneType ?? commerce.stoneType,
    weight: p.weight ?? commerce.weight,
    label: merchLabel(p, commerce.label),
    estimatedDelivery: commerce.estimatedDelivery,
    affiliateDisclosure: commerce.affiliateDisclosure,
    availability: p.stock > 0 ? "in_stock" : "out_of_stock",
  };
}

export const catalog: Product[] = seedProducts.map(mapSeedToProduct);

export const categoryMeta = seedCategories;

export function getProductBySlug(slug: string): Product | undefined {
  return catalog.find((p) => p.slug === slug);
}

export function getProducts(filters: ProductFilters = {}): Paginated<Product> {
  let items = [...catalog];

  if (filters.category && filters.category !== "all") {
    items = items.filter((p) => p.category === filters.category);
  }

  if (filters.q) {
    const q = filters.q.toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q)) ||
        p.material.toLowerCase().includes(q) ||
        p.color.toLowerCase().includes(q) ||
        p.moods.some((m) => m.toLowerCase().includes(q)) ||
        (q.includes("under") && p.price <= extractUnderPrice(q))
    );
  }

  if (filters.priceMin != null) items = items.filter((p) => p.price >= filters.priceMin!);
  if (filters.priceMax != null) items = items.filter((p) => p.price <= filters.priceMax!);
  if (filters.material?.length)
    items = items.filter((p) =>
      filters.material!.some((m) => p.material.toLowerCase().includes(m.toLowerCase()))
    );
  if (filters.color?.length)
    items = items.filter((p) =>
      filters.color!.some((c) => p.color.toLowerCase().includes(c.toLowerCase()))
    );
  if (filters.style?.length)
    items = items.filter((p) => p.moods.some((m) => filters.style!.includes(m)));
  if (filters.occasion?.length)
    items = items.filter((p) => p.occasions.some((o) => filters.occasion!.includes(o)));
  if (filters.collection?.length)
    items = items.filter((p) => p.collection && filters.collection!.includes(p.collection));
  if (filters.availability === "in_stock") items = items.filter((p) => p.stock > 0);

  switch (filters.sort) {
    case "newest":
      items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      break;
    case "bestselling":
      items.sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller) || b.reviewCount - a.reviewCount);
      break;
    case "top_rated":
      items.sort((a, b) => b.rating - a.rating);
      break;
    case "price_asc":
      items.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      items.sort((a, b) => b.price - a.price);
      break;
    default:
      items.sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount);
  }

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 24;
  const start = (page - 1) * pageSize;
  const data = items.slice(start, start + pageSize);

  return {
    data,
    total: items.length,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
  };
}

function extractUnderPrice(q: string): number {
  const match = q.match(/under\s*₹?\s*(\d+)/i) || q.match(/under\s+(\d+)/i);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

export function getNewDrops(limit = 8): Product[] {
  return getProducts({ sort: "newest", pageSize: limit }).data;
}

export function getBestsellers(limit = 10): Product[] {
  return getProducts({ sort: "bestselling", pageSize: limit }).data;
}

export function getByMood(mood: Mood, limit = 8): Product[] {
  return getProducts({ style: [mood], pageSize: limit }).data;
}

export function getComplementary(product: Product, limit = 4): Product[] {
  const complementMap: Record<string, string[]> = {
    tees: ["denim", "outerwear", "accessories"],
    hoodies: ["denim", "accessories"],
    outerwear: ["tees", "denim"],
    denim: ["tees", "hoodies", "accessories"],
    dresses: ["outerwear", "accessories"],
    "co-ords": ["accessories", "tees"],
    accessories: ["tees", "hoodies"],
  };
  const targets = complementMap[product.category] ?? ["tees"];
  return catalog
    .filter((p) => p.id !== product.id && targets.includes(p.category))
    .slice(0, limit);
}

export function youMayAlsoLike(product: Product, limit = 8): Product[] {
  return catalog
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.category === product.category ||
          p.moods.some((m) => product.moods.includes(m)))
    )
    .slice(0, limit);
}

export function getProductsByBrand(slug: string): Product[] {
  return catalog.filter((p) => p.brandSlug === slug);
}

export function formatProductLabel(label?: Product["label"] | Product["badge"]) {
  if (!label) return null;
  if (label === "BEST_SELLER" || label === "BESTSELLER") return "Best Seller";
  if (label === "PARTNER_PICK") return "Partner Pick";
  return label.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function stylistRecommend(input: {
  occasion: string;
  style: string;
  budget: string;
}): { lookName: string; rationale: string; products: Product[] } {
  const budgetMap: Record<string, [number, number]> = {
    UNDER_999: [0, 999],
    "999_1999": [999, 1999],
    "1999_4999": [1999, 4999],
    "5000_PLUS": [5000, 100000],
  };
  const [min, max] = budgetMap[input.budget] ?? [0, 100000];
  const style = input.style.toUpperCase();
  const occasion = input.occasion.toUpperCase();

  const products = catalog
    .filter((p) => p.price >= min && p.price <= max)
    .filter(
      (p) =>
        p.moods.some((m) => m.includes(style) || style.includes(m)) ||
        p.occasions.includes(occasion as Occasion) ||
        (style === "EDGY" && p.moods.includes("DARK"))
    )
    .slice(0, 6);

  const fallback = catalog.filter((p) => p.price >= min && p.price <= max).slice(0, 6);

  return {
    lookName: `${input.style} ${input.occasion} Edit`.toUpperCase(),
    rationale:
      "Curated from CHESHIRE moods, occasions, and budget bands. Swap in a live AI model later without changing this contract.",
    products: products.length ? products : fallback,
  };
}
