import { Router } from "express";
import jwt from "jsonwebtoken";
import {
  adminDashboardMetrics,
  getAffiliatePartners,
  getAffiliateStats,
  getCommissionRules,
  getPayouts,
  getReturns,
  getSupplierOrders,
  getSuppliers,
  isAdminRole,
  registerSupplier,
  setSupplierStatus,
  trackAffiliateClick,
} from "@cheshire/commerce";
import type { UserRole } from "@cheshire/types";
import { catalog } from "./catalog-bridge";

export const commerceRouter = Router();

function actor(req: { headers: { authorization?: string } }): { role?: UserRole; sub?: string } {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return {};
  try {
    return jwt.verify(header.slice(7), process.env.JWT_SECRET || "dev-secret") as {
      role?: UserRole;
      sub?: string;
    };
  } catch {
    return {};
  }
}

function requireAdmin(req: { headers: { authorization?: string } }, res: { status: (n: number) => { json: (b: unknown) => unknown } }, next: () => void) {
  const { role } = actor(req);
  if (!isAdminRole(role)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}

commerceRouter.get("/health", (_req, res) => {
  res.json({ ok: true, models: ["affiliate", "dropship", "marketplace"] });
});

commerceRouter.post("/affiliate/click", (req, res) => {
  const slug = String(req.body.slug || "");
  const product = catalog.find((p) => p.slug === slug);
  if (!product || product.productType !== "affiliate") {
    return res.status(404).json({ error: "Not found" });
  }
  try {
    const click = trackAffiliateClick({
      sku: product.sku,
      productId: product.id,
      productName: product.name,
      product,
      campaign: req.body.campaign,
      source: req.body.source || "api",
    });
    return res.json({ trackingId: click.trackingId, url: click.destinationUrl });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Unavailable" });
  }
});

commerceRouter.post("/suppliers/register", (req, res) => {
  const row = registerSupplier(req.body);
  res.status(201).json({ id: row.id, status: row.status });
});

commerceRouter.get("/admin/overview", requireAdmin as never, (_req, res) => {
  res.json({
    dashboard: adminDashboardMetrics(),
    affiliate: getAffiliateStats(),
    suppliers: getSuppliers().map((s) => ({ id: s.id, brandName: s.brandName, status: s.status })),
    partners: getAffiliatePartners(),
    rules: getCommissionRules(),
    payouts: getPayouts(),
    returns: getReturns(),
    supplierOrders: getSupplierOrders(),
  });
});

commerceRouter.post("/admin/suppliers/:id/status", requireAdmin as never, (req, res) => {
  const row = setSupplierStatus(String(req.params.id), req.body.status);
  if (!row) return res.status(404).json({ error: "Not found" });
  return res.json({ id: row.id, status: row.status });
});
