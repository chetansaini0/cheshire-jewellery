import { Router } from "express";
import {
  calcDiscount,
  productImage,
  seedProducts,
} from "@cheshire/database/catalog";

const catalog = seedProducts.map((p, index) => ({
  id: `seed-${p.sku}`,
  ...p,
  discountPercent: calcDiscount(p.price, p.mrp),
  images: [
    { id: "1", url: productImage(p.imageIds[0]), alt: p.name, sortOrder: 0, isPrimary: true },
    { id: "2", url: productImage(p.imageIds[1]), alt: p.name, sortOrder: 1 },
  ],
  hoverImage: productImage(p.imageIds[1]),
  isPublished: true,
  isNew: Boolean(p.isNew) || index < 6,
  isBestseller: Boolean(p.isBestseller),
  createdAt: new Date(Date.now() - index * 86400000).toISOString(),
  updatedAt: new Date().toISOString(),
}));

export const productsRouter = Router();

productsRouter.get("/", (req, res) => {
  let items = [...catalog];
  const { category, sort, q, page = "1", pageSize = "24" } = req.query;

  if (category && category !== "all") {
    items = items.filter((p) => p.category === category);
  }
  if (q) {
    const query = String(q).toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.tags.some((t) => t.includes(query)) ||
        p.moods.some((m) => m.toLowerCase().includes(query))
    );
  }
  if (sort === "price_asc") items.sort((a, b) => a.price - b.price);
  if (sort === "price_desc") items.sort((a, b) => b.price - a.price);
  if (sort === "newest") items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  if (sort === "bestselling") items.sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller));

  const p = Number(page);
  const size = Number(pageSize);
  const start = (p - 1) * size;
  const data = items.slice(start, start + size);
  res.json({ data, total: items.length, page: p, pageSize: size, totalPages: Math.ceil(items.length / size) });
});

productsRouter.get("/:slug", (req, res) => {
  const product = catalog.find((p) => p.slug === req.params.slug);
  if (!product) return res.status(404).json({ error: "Not found" });
  return res.json(product);
});
