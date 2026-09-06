import { Router } from "express";
import { seedProducts } from "@cheshire/database/catalog";

export const searchRouter = Router();

searchRouter.get("/", (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const products = seedProducts
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q)) ||
        p.moods.some((m) => m.toLowerCase().includes(q))
    )
    .slice(0, 10);
  res.json({
    products,
    categories: ["rings", "necklaces", "earrings", "bracelets"],
    popular: ["silver ring", "minimal necklace", "gift under 2000", "black jewellery"],
  });
});
