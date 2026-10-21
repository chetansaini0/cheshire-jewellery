import { Router } from "express";
import jwt from "jsonwebtoken";
import { seedProducts } from "@cheshire/database";
import { adminDashboardMetrics, getAffiliateStats, getCommissionRules, getSuppliers } from "@cheshire/commerce";

export const adminRouter = Router();

function requireAdmin(req: { headers: { authorization?: string } }, res: { status: (n: number) => { json: (b: unknown) => unknown } }, next: () => void) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET || "dev-secret") as { role?: string };
    if (payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}

adminRouter.get("/dashboard", requireAdmin as never, (_req, res) => {
  res.json({
    ...adminDashboardMetrics(),
    products: seedProducts.length,
    inventoryLow: seedProducts.filter((p) => p.stock < 20).length,
    affiliate: getAffiliateStats(),
    commissionRules: getCommissionRules(),
    suppliers: getSuppliers().map((s) => ({ id: s.id, brandName: s.brandName, status: s.status })),
  });
});

adminRouter.get("/products", requireAdmin as never, (_req, res) => {
  res.json(seedProducts);
});
