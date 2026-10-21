import {
  calcDiscount,
  productImage,
  seedProducts,
} from "@cheshire/database";
import { publicCommerceFields } from "@cheshire/commerce";
import type { Mood, Occasion, Product } from "@cheshire/types";

export const catalog: Product[] = seedProducts.map((p, index) => {
  const commerce = publicCommerceFields(p.sku);
  return {
    id: `seed-${p.sku}`,
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
      { id: "1", url: productImage(p.imageIds[0]), alt: p.name, sortOrder: 0, isPrimary: true },
      { id: "2", url: productImage(p.imageIds[1]), alt: p.name, sortOrder: 1 },
    ],
    hoverImage: productImage(p.imageIds[1]),
    sizes: p.sizes,
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
    label: commerce.label,
    estimatedDelivery: commerce.estimatedDelivery,
    affiliateDisclosure: commerce.affiliateDisclosure,
    availability: p.stock > 0 ? "in_stock" : "out_of_stock",
  };
});
