import { Router } from "express";
import jwt from "jsonwebtoken";
import { seedProducts } from "@cheshire/database/catalog";

export const adminRouter = Router();

function requireAdmin(req: { headers: { authorization?: string } }, res: { status: (n: number) => { json: (b: unknown) => unknown } }, next: () => void) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET || "dev-secret") as { role?: string };
    if (payload.role !== "ADMIN") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}

adminRouter.get("/dashboard", requireAdmin as never, (_req, res) => {
  const revenue = seedProducts.reduce((s, p) => s + p.price * Math.max(1, Math.floor(p.reviewCount / 20)), 0);
  res.json({
    revenue,
    orders: 1284,
    customers: 8420,
    products: seedProducts.length,
    inventoryLow: seedProducts.filter((p) => p.stock < 20).length,
    conversion: 2.8,
    aov: 2140,
    topProducts: seedProducts.filter((p) => p.isBestseller).slice(0, 5),
  });
});

adminRouter.get("/products", requireAdmin as never, (_req, res) => {
  res.json(seedProducts);
});
