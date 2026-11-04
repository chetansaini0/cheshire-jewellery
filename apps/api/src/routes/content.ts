import { Router } from "express";
import jwt from "jsonwebtoken";
import { readAllHeroBanners, readHeroBanners, ReadOnlyStoreError, writeHeroBanners } from "@cheshire/config/banner-store";
import { emitEvent } from "@cheshire/config/automation";

/**
 * Storefront content (hero banners). Same JSON-file store the admin writes:
 * `.data/hero-banners.json`, falling back to the committed defaults in @cheshire/config.
 */
export const contentRouter = Router();

contentRouter.get("/banners", (_req, res) => {
  res.json({ banners: readHeroBanners() });
});

function isAdmin(header?: string) {
  if (!header?.startsWith("Bearer ")) return false;
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET || "dev-secret") as { role?: string };
    return payload.role === "ADMIN" || payload.role === "SUPER_ADMIN";
  } catch {
    return false;
  }
}

contentRouter.get("/banners/all", (req, res) => {
  if (!isAdmin(req.headers.authorization)) return void res.status(401).json({ error: "Unauthorized" });
  res.json(readAllHeroBanners());
});

contentRouter.put("/banners", (req, res) => {
  if (!isAdmin(req.headers.authorization)) return void res.status(401).json({ error: "Unauthorized" });
  let result: ReturnType<typeof writeHeroBanners>;
  try {
    result = writeHeroBanners((req.body as { banners?: unknown })?.banners);
  } catch (e) {
    if (e instanceof ReadOnlyStoreError) return void res.status(503).json({ error: e.message });
    throw e;
  }
  if (!result.ok) return void res.status(400).json({ error: "Invalid banners", details: result.errors });
  res.json({ banners: result.banners });
  // Fire-and-forget: automations never delay or break the API response.
  void emitEvent("banner.updated", { activeIds: result.banners.filter((b) => b.isActive).map((b) => b.id), total: result.banners.length, source: "api" }, "api").catch(() => undefined);
});
