import { Router } from "express";
import { seedProducts } from "@cheshire/database";

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
    categories: ["tees", "hoodies", "denim", "dresses"],
    popular: ["oversized tee", "baggy jeans", "black hoodie", "gift under 2000"],
  });
});
