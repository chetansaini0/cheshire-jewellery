"use server";

import {
  approveAndPublish,
  importCsv,
  importProducts,
  markSubmittedManually,
  pauseSupplier,
  previewImport,
  resolveAlert,
  retryFulfillment,
  runSandboxScenario,
  setCategoryMapping,
  setCompliance,
  setProductPermissions,
  syncInventory,
  syncPrices,
  testConnection,
  tryActivate,
  upsertIntegration,
  type ComplianceChecklist,
  type ConnectorCredentials,
} from "@cheshire/integrations";
import { revalidatePath } from "next/cache";

function refresh() {
  revalidatePath("/integrations");
  revalidatePath("/sync-logs");
  revalidatePath("/suppliers");
}

export async function actionTestConnection(id: string) {
  const result = await testConnection(id);
  refresh();
  return result;
}

export async function actionImportTest(id: string) {
  const result = await importProducts(id, { testOne: true });
  refresh();
  return result;
}

export async function actionImportSelected(id: string, selectedIds: string[]) {
  const result = await importProducts(id, { selectedIds });
  refresh();
  return result;
}

export async function actionPreview(id: string) {
  return previewImport(id, 25);
}

export async function actionSyncInventory(id: string) {
  const result = await syncInventory(id);
  refresh();
  return result;
}

export async function actionSyncPrices(id: string) {
  const result = await syncPrices(id);
  refresh();
  return result;
}

export async function actionSetPermissions(productId: string, image: "APPROVED" | "UNKNOWN", content: "APPROVED" | "UNKNOWN") {
  setProductPermissions(productId, { imageUsagePermission: image, contentPermissionStatus: content });
  refresh();
}

export async function actionPublish(productId: string) {
  const row = approveAndPublish(productId);
  refresh();
  return row;
}

export async function actionCompliance(id: string, patch: Partial<ComplianceChecklist>) {
  const row = setCompliance(id, patch);
  refresh();
  return row;
}

export async function actionMapCategory(supplierId: string, from: string, to: string) {
  setCategoryMapping(supplierId, from, to);
  refresh();
}

export async function actionActivate(id: string) {
  const row = tryActivate(id);
  refresh();
  return row;
}

export async function actionPause(supplierId: string, paused: boolean) {
  pauseSupplier(supplierId, paused);
  refresh();
}

export async function actionRetry(id: string) {
  const row = await retryFulfillment(id);
  refresh();
  return row;
}

export async function actionManualSubmit(id: string) {
  markSubmittedManually(id);
  refresh();
}

export async function actionResolveAlert(id: string, resolution: "ignored" | "resolved") {
  resolveAlert(id, resolution);
  refresh();
}

export async function actionSandbox() {
  const result = await runSandboxScenario();
  refresh();
  return result;
}

export async function actionUpsert(input: {
  supplierId: string;
  supplierName: string;
  providerId: string;
  credentials?: ConnectorCredentials;
  emailRecipient?: string;
}) {
  const row = upsertIntegration(input);
  refresh();
  return { id: row.id, status: row.integrationStatus };
}

export async function actionCsv(id: string, csv: string) {
  const row = importCsv(id, csv, {
    name: "name",
    sku: "sku",
    price: "price",
    stock: "stock",
    image: "image",
    category: "category",
    description: "description",
  });
  refresh();
  return row;
}
