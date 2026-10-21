import { Router } from "express";
import { catalog } from "./catalog-bridge";

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
  const product = catalog.find((p) => p.slug === String(req.params.slug));
  if (!product) return res.status(404).json({ error: "Not found" });
  return res.json(product);
});
