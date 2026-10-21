import { Router } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import {
  getSupplier,
  getSupplierOrders,
  getPayouts,
  getReturns,
  registerSupplier,
  updateSupplierOrderStatus,
} from "@cheshire/commerce";
import { requireRoles, requireSupplierScope, readAuth } from "../middleware/auth";
import type { SupplierOrderStatus } from "@cheshire/types";

export const suppliersRouter = Router();

suppliersRouter.post("/register", (req, res) => {
  const parsed = z
    .object({
      brandName: z.string().min(2),
      ownerName: z.string().min(2),
      email: z.string().email(),
      phone: z.string().min(8),
      businessName: z.string().optional(),
      gstNumber: z.string().optional(),
      addressLine1: z.string().min(3),
      city: z.string(),
      state: z.string(),
      pincode: z.string(),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid registration" });
  const row = registerSupplier({
    ...parsed.data,
    businessName: parsed.data.businessName || parsed.data.brandName,
    gstNumber: parsed.data.gstNumber || "",
    bankAccountName: parsed.data.brandName,
    bankIfsc: "",
    productCategories: [],
    shippingRegions: ["IN"],
    returnPolicy: "7-day returns",
    commissionPercent: 15,
    defaultShippingFee: 79,
    freeShippingThreshold: 999,
    deliveryMinDays: 4,
    deliveryMaxDays: 7,
    codAvailable: true,
  });
  return res.status(201).json({ id: row.id, status: row.status, slug: row.slug });
});

suppliersRouter.post("/login", (req, res) => {
  const parsed = z.object({ email: z.string().email() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid email" });
  const supplier = getSupplier(parsed.data.email);
  if (!supplier) return res.status(401).json({ error: "Unknown supplier" });
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"];
  const token = jwt.sign(
    { sub: supplier.id, role: "SUPPLIER", supplierId: supplier.id },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn }
  );
  return res.json({ token, supplier: { id: supplier.id, brandName: supplier.brandName, status: supplier.status } });
});

suppliersRouter.get("/me/orders", requireRoles("SUPPLIER", "ADMIN", "SUPER_ADMIN"), (req, res) => {
  const auth = readAuth(req);
  const supplierId = auth?.role === "SUPPLIER" ? auth.supplierId : String(req.query.supplierId || "");
  res.json(getSupplierOrders(supplierId));
});

suppliersRouter.get("/me/payouts", requireRoles("SUPPLIER", "ADMIN", "SUPER_ADMIN"), (req, res) => {
  const auth = readAuth(req);
  const supplierId = auth?.role === "SUPPLIER" ? auth.supplierId : String(req.query.supplierId || "");
  res.json(getPayouts(supplierId));
});

suppliersRouter.get("/me/returns", requireRoles("SUPPLIER", "ADMIN", "SUPER_ADMIN"), (req, res) => {
  const auth = readAuth(req);
  const supplierId = auth?.role === "SUPPLIER" ? auth.supplierId : String(req.query.supplierId || "");
  res.json(getReturns(supplierId));
});

suppliersRouter.post(
  "/me/orders/:id/status",
  requireSupplierScope,
  (req, res) => {
    const auth = readAuth(req);
    const status = req.body.status as SupplierOrderStatus;
    const updated = updateSupplierOrderStatus(String(req.params.id), auth?.supplierId || "", status);
    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json(updated);
  }
);
