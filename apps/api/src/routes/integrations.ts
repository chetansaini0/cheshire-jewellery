import { Router } from "express";
import { z } from "zod";
import {
  approveAndPublish,
  businessSnapshot,
  getAlerts,
  getFulfillmentSheet,
  getFulfillments,
  getImportedProducts,
  getIntegration,
  getIntegrations,
  getSyncLogs,
  importCsv,
  importProducts,
  ingestWebhook,
  integrationDashboard,
  listProviders,
  markSubmittedManually,
  pauseSupplier,
  previewImport,
  resolveAlert,
  retryFulfillment,
  routePaidOrder,
  runSandboxScenario,
  setCategoryMapping,
  setCompliance,
  setProductPermissions,
  syncInventory,
  syncPrices,
  syncTracking,
  testConnection,
  tryActivate,
  upsertIntegration,
} from "@cheshire/integrations";
import { isAdminRole } from "@cheshire/commerce";
import jwt from "jsonwebtoken";
import type { UserRole } from "@cheshire/types";

export const integrationsRouter = Router();

function actor(req: { headers: { authorization?: string } }): { role?: UserRole } {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    if (process.env.NODE_ENV !== "production") return { role: "ADMIN" };
    return {};
  }
  try {
    return jwt.verify(header.slice(7), process.env.JWT_SECRET || "dev-secret") as { role?: UserRole };
  } catch {
    return {};
  }
}

function requireAdmin(
  req: { headers: { authorization?: string } },
  res: { status: (n: number) => { json: (b: unknown) => unknown } },
  next: () => void
) {
  if (!isAdminRole(actor(req).role)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}

integrationsRouter.get("/providers", requireAdmin as never, (_req, res) => {
  res.json(listProviders());
});

integrationsRouter.get("/dashboard", requireAdmin as never, (_req, res) => {
  res.json({ ...integrationDashboard(), business: businessSnapshot() });
});

integrationsRouter.get("/", requireAdmin as never, (_req, res) => {
  res.json(getIntegrations());
});

integrationsRouter.post("/", requireAdmin as never, (req, res) => {
  const parsed = z
    .object({
      supplierId: z.string(),
      supplierName: z.string(),
      providerId: z.string(),
      integrationType: z.string().optional(),
      schedule: z.string().optional(),
      credentials: z.record(z.string()).optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });
  const row = upsertIntegration({
    supplierId: parsed.data.supplierId,
    supplierName: parsed.data.supplierName,
    providerId: parsed.data.providerId,
    credentials: parsed.data.credentials as import("@cheshire/integrations").ConnectorCredentials | undefined,
  });
  return res.status(201).json({ id: row.id, status: row.integrationStatus });
});

integrationsRouter.get("/ops/logs", requireAdmin as never, (_req, res) => {
  res.json(getSyncLogs());
});

integrationsRouter.get("/ops/errors", requireAdmin as never, (_req, res) => {
  res.json(getAlerts(false));
});

integrationsRouter.post("/ops/errors/:id", requireAdmin as never, (req, res) => {
  const row = resolveAlert(String(req.params.id), req.body?.resolution || "resolved");
  if (!row) return res.status(404).json({ error: "Not found" });
  return res.json(row);
});

integrationsRouter.get("/ops/fulfillments", requireAdmin as never, (_req, res) => {
  res.json(getFulfillments());
});

integrationsRouter.get("/ops/fulfillments/:id/sheet", requireAdmin as never, (req, res) => {
  const sheet = getFulfillmentSheet(String(req.params.id));
  if (!sheet) return res.status(404).json({ error: "Not found" });
  return res.json(sheet);
});

integrationsRouter.post("/ops/fulfillments/:id/retry", requireAdmin as never, async (req, res) => {
  const row = await retryFulfillment(String(req.params.id));
  if (!row) return res.status(404).json({ error: "Not found" });
  return res.json(row);
});

integrationsRouter.post("/ops/fulfillments/:id/manual", requireAdmin as never, (req, res) => {
  const row = markSubmittedManually(String(req.params.id));
  if (!row) return res.status(404).json({ error: "Not found" });
  return res.json(row);
});

integrationsRouter.post("/ops/fulfillments/:id/tracking", requireAdmin as never, async (req, res) => {
  const row = await syncTracking(String(req.params.id));
  return res.json(row);
});

integrationsRouter.post("/ops/sandbox", requireAdmin as never, async (_req, res) => {
  res.json(await runSandboxScenario());
});

integrationsRouter.post("/ops/route-order", requireAdmin as never, async (req, res) => {
  res.json(await routePaidOrder(req.body));
});

integrationsRouter.post("/webhooks/:supplierId", (req, res) => {
  const result = ingestWebhook({
    eventId: String(req.body?.eventId || req.headers["x-event-id"] || ""),
    supplierId: String(req.params.supplierId),
    type: String(req.body?.type || ""),
    signature: String(req.headers["x-cheshire-signature"] || ""),
    payload: (req.body?.payload || req.body || {}) as Record<string, unknown>,
  });
  res.status(result.status === "rejected" ? 400 : 200).json(result);
});

integrationsRouter.post("/products/:productId/permissions", requireAdmin as never, (req, res) => {
  const row = setProductPermissions(String(req.params.productId), req.body || {});
  if (!row) return res.status(404).json({ error: "Not found" });
  return res.json(row);
});

integrationsRouter.post("/products/:productId/publish", requireAdmin as never, (req, res) => {
  try {
    return res.json(approveAndPublish(String(req.params.productId)));
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Cannot publish" });
  }
});

integrationsRouter.get("/:id", requireAdmin as never, (req, res) => {
  const row = getIntegration(String(req.params.id));
  if (!row) return res.status(404).json({ error: "Not found" });
  return res.json({ ...row, encryptedCredentials: undefined });
});

integrationsRouter.post("/:id/test", requireAdmin as never, async (req, res) => {
  try {
    return res.json(await testConnection(String(req.params.id)));
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Failed" });
  }
});

integrationsRouter.post("/:id/compliance", requireAdmin as never, (req, res) => {
  const row = setCompliance(String(req.params.id), req.body || {});
  if (!row) return res.status(404).json({ error: "Not found" });
  return res.json(row);
});

integrationsRouter.post("/:id/mappings", requireAdmin as never, (req, res) => {
  const integration = getIntegration(String(req.params.id));
  if (!integration) return res.status(404).json({ error: "Not found" });
  return res.json(
    setCategoryMapping(integration.supplierId, String(req.body?.supplierCategory || ""), String(req.body?.cheshireCategory || ""))
  );
});

integrationsRouter.post("/:id/preview", requireAdmin as never, async (req, res) => {
  res.json(await previewImport(String(req.params.id), Number(req.body?.limit || 25)));
});

integrationsRouter.post("/:id/import", requireAdmin as never, async (req, res) => {
  res.json(
    await importProducts(String(req.params.id), {
      testOne: Boolean(req.body?.testOne),
      selectedIds: Array.isArray(req.body?.selectedIds) ? req.body.selectedIds : undefined,
    })
  );
});

integrationsRouter.post("/:id/import-csv", requireAdmin as never, (req, res) => {
  res.json(importCsv(String(req.params.id), String(req.body?.csv || ""), req.body?.map || {}));
});

integrationsRouter.post("/:id/sync/inventory", requireAdmin as never, async (req, res) => {
  res.json(await syncInventory(String(req.params.id)));
});

integrationsRouter.post("/:id/sync/prices", requireAdmin as never, async (req, res) => {
  res.json(await syncPrices(String(req.params.id)));
});

integrationsRouter.post("/:id/activate", requireAdmin as never, (req, res) => {
  res.json(tryActivate(String(req.params.id)));
});

integrationsRouter.post("/:id/pause", requireAdmin as never, (req, res) => {
  const integration = getIntegration(String(req.params.id));
  if (!integration) return res.status(404).json({ error: "Not found" });
  return res.json(pauseSupplier(integration.supplierId, req.body?.paused !== false));
});

integrationsRouter.get("/:id/products", requireAdmin as never, (req, res) => {
  const integration = getIntegration(String(req.params.id));
  if (!integration) return res.status(404).json({ error: "Not found" });
  return res.json(getImportedProducts(integration.supplierId));
});
