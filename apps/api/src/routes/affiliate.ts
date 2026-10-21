import { Router } from "express";
import { z } from "zod";
import {
  getAffiliateStats,
  getAffiliatePartners,
  trackAffiliateClick,
} from "@cheshire/commerce";
import { seedProducts, productImage, calcDiscount } from "@cheshire/database";
import type { Mood, Occasion, Product } from "@cheshire/types";

function toProduct(sku: string): Product | undefined {
  const p = seedProducts.find((row) => row.sku === sku || row.slug === sku);
  if (!p) return undefined;
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
    material: p.material,
    color: p.color,
    moods: p.moods as Mood[],
    occasions: p.occasions as Occasion[],
    tags: p.tags,
    rating: p.rating,
    reviewCount: p.reviewCount,
    stock: p.stock,
    images: [{ id: "1", url: productImage(p.imageIds[0]), alt: p.name, sortOrder: 0, isPrimary: true }],
    sizes: p.sizes,
    isPublished: true,
    isNew: Boolean(p.isNew),
    isBestseller: Boolean(p.isBestseller),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    productType: p.productType ?? "dropship",
  };
}

export const affiliateRouter = Router();

affiliateRouter.get("/partners", (_req, res) => {
  res.json(getAffiliatePartners());
});

affiliateRouter.get("/stats", (_req, res) => {
  res.json(getAffiliateStats());
});

affiliateRouter.post("/click", (req, res) => {
  const parsed = z.object({
    sku: z.string(),
    sessionId: z.string().optional(),
    campaign: z.string().optional(),
    source: z.string().optional(),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });
  const product = toProduct(parsed.data.sku);
  if (!product) return res.status(404).json({ error: "Not found" });
  try {
    const click = trackAffiliateClick({
      sku: product.sku,
      productId: product.id,
      productName: product.name,
      product,
      sessionId: parsed.data.sessionId,
      campaign: parsed.data.campaign,
      source: parsed.data.source,
    });
    return res.json({ trackingId: click.trackingId, url: click.destinationUrl });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Click failed" });
  }
});
