import type { Product } from "@cheshire/types";
import { calcDiscount } from "@cheshire/database/catalog";
import { livePublicCatalog, type PublicImportedProduct } from "@cheshire/integrations";
import { getProductBySlug as getSeedProduct, catalog } from "./catalog";

function importedToProduct(p: PublicImportedProduct): Product {
  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    slug: p.slug,
    description: p.description,
    shortDescription: p.description.slice(0, 140),
    price: p.price,
    mrp: p.mrp,
    discountPercent: calcDiscount(p.price, p.mrp),
    category: p.category as Product["category"],
    collection: null,
    material: p.material,
    color: p.color,
    moods: ["EVERYDAY"],
    occasions: ["EVERYDAY"],
    tags: [],
    rating: 0,
    reviewCount: 0,
    stock: p.stock,
    images: p.images,
    hoverImage: p.images[1]?.url ?? null,
    videoUrl: null,
    sizes: p.sizes,
    dimensions: "See size guide on product page",
    care: "Store dry. Avoid perfume and water. Wipe with a soft cloth.",
    shippingInfo: p.estimatedDelivery || "Dispatched in 24–48 hours. Free shipping over ₹999.",
    returnsInfo: "Easy 7-day returns on unused products.",
    warranty: "6-month manufacturing warranty.",
    seoTitle: `${p.name} | CHESHIRE`,
    seoDescription: p.description.slice(0, 160),
    isPublished: true,
    isNew: true,
    isBestseller: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    productType: p.productType,
    brandSlug: p.brandSlug,
    brandName: p.brandName,
    weight: p.weight ?? null,
    stoneType: p.stoneType ?? null,
    estimatedDelivery: p.estimatedDelivery ?? null,
    availability: p.availability,
  };
}

export function importedStorefrontProducts(): Product[] {
  return livePublicCatalog().map(importedToProduct);
}

export function getStorefrontProduct(slug: string): Product | undefined {
  return getSeedProduct(slug) ?? importedStorefrontProducts().find((p) => p.slug === slug);
}

export function storefrontCatalog(): Product[] {
  const imported = importedStorefrontProducts();
  const skus = new Set(imported.map((p) => p.sku));
  return [...catalog.filter((p) => !skus.has(p.sku)), ...imported];
}
