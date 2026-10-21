import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { hasRole, isAdminRole } from "@cheshire/commerce";
import type { UserRole } from "@cheshire/types";

export type AuthPayload = { sub: string; role: UserRole; supplierId?: string };

export function readAuth(req: Request): AuthPayload | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(header.slice(7), process.env.JWT_SECRET || "dev-secret") as AuthPayload;
  } catch {
    return null;
  }
}

export function requireRoles(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = readAuth(req);
    if (!auth) return res.status(401).json({ error: "Unauthorized" });
    if (!hasRole(auth.role, roles) && !isAdminRole(auth.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    (req as Request & { auth: AuthPayload }).auth = auth;
    return next();
  };
}

export function requireSupplierScope(req: Request, res: Response, next: NextFunction) {
  const auth = readAuth(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });
  if (isAdminRole(auth.role)) {
    (req as Request & { auth: AuthPayload }).auth = auth;
    return next();
  }
  if (auth.role !== "SUPPLIER" || !auth.supplierId) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const paramId = String(req.params.supplierId || req.body?.supplierId || auth.supplierId);
  if (paramId !== auth.supplierId) {
    return res.status(403).json({ error: "Forbidden" });
  }
  (req as Request & { auth: AuthPayload }).auth = auth;
  return next();
}
