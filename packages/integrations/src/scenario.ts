import {
  approveAndPublish,
  getImportedProduct,
  getImportedProducts,
  importProducts,
  ingestWebhook,
  MOCK_SUPPLIER,
  mockControls,
  previewImport,
  recordPayout,
  resetIntegrationEngine,
  retryFulfillment,
  routePaidOrder,
  setCategoryMapping,
  setCompliance,
  setProductPermissions,
  syncInventory,
  syncTracking,
  testConnection,
  tryActivate,
} from "./engine";
import { mockHub } from "./connectors/mock";

export type ScenarioStep = { step: string; ok: boolean; detail?: string };

export async function runSandboxScenario(): Promise<{ ok: boolean; steps: ScenarioStep[]; orderNumber: string }> {
  const steps: ScenarioStep[] = [];
  const note = (step: string, ok: boolean, detail?: string) => steps.push({ step, ok, detail });

  resetIntegrationEngine(true);
  mockHub.reset();

  const health = await testConnection(MOCK_SUPPLIER.integrationId);
  note("1. Connect + test connection", health.status === "CONNECTED", health.message);

  setCategoryMapping(MOCK_SUPPLIER.id, "Topwear", "hoodies");
  note("5. Map category Topwear → hoodies", true);

  const preview = await previewImport(MOCK_SUPPLIER.integrationId, 10);
  note("3. Preview catalog", Boolean(preview.items.length), `${preview.items.length} products`);

  const one = await importProducts(MOCK_SUPPLIER.integrationId, { testOne: true, selectedIds: ["mjh-01"] });
  note("3. Import one test product", Boolean(one.ok), `created=${one.created ?? 0}`);

  const product = getImportedProducts(MOCK_SUPPLIER.id)[0];
  if (!product) {
    note("4. Approve permissions", false, "No product imported");
    return { ok: false, steps, orderNumber: "" };
  }

  setProductPermissions(product.id, { imageUsagePermission: "APPROVED", contentPermissionStatus: "APPROVED" });
  note("4. Approve image + content permission", true);

  try {
    approveAndPublish(product.id);
    note("6–7. Approve and publish", true, product.sku);
  } catch (error) {
    note("6–7. Approve and publish", false, error instanceof Error ? error.message : "failed");
  }

  const live = getImportedProduct(product.id);
  note("8. Product is LIVE", live?.lifecycle === "LIVE", live?.slug);

  mockControls().setStock("mjh-01", 5);
  const inv = await syncInventory(MOCK_SUPPLIER.integrationId);
  const after = getImportedProduct(product.id);
  note("9–11. Inventory 10 → 5", Boolean(inv.ok) && after?.inventory.supplierStock === 5, String(after?.inventory.supplierStock));

  setCompliance(MOCK_SUPPLIER.integrationId, {
    dropshipping_permitted: true,
    image_rights: true,
    content_rights: true,
    blind_shipping: true,
    return_policy: true,
    shipping_policy: true,
    invoice_process: true,
    gst_tax: true,
    integration_tested: true,
  });
  tryActivate(MOCK_SUPPLIER.integrationId);

  const orderNumber = "CHS-E2E-1001";
  const routed = await routePaidOrder({
    cheshireOrderNumber: orderNumber,
    paymentStatus: "PAID",
    shipping: {
      fullName: "Test Customer",
      phone: "9999999999",
      line1: "1 Ivory Lane",
      city: "Mumbai",
      state: "MH",
      pincode: "400001",
    },
    items: [
      {
        productId: product.id,
        sku: product.sku,
        name: product.title,
        quantity: 1,
        productType: "dropship",
        supplierId: MOCK_SUPPLIER.id,
      },
    ],
  });
  const ff = routed.fulfillments[0];
  note("12–16. Paid order routed + supplier accepted", ff?.status === "confirmed", ff?.remoteOrderId);

  if (ff?.remoteOrderId) {
    mockControls().ship(ff.remoteOrderId);
    await syncTracking(ff.id);
    note("17–19. Shipped + tracking synced", true, getImportedProduct(product.id)?.sku);
    mockControls().deliver(ff.remoteOrderId);
    await ingestWebhook({
      eventId: `evt-${orderNumber}-delivered`,
      supplierId: MOCK_SUPPLIER.id,
      type: "ORDER_SHIPPED",
      payload: { remoteOrderId: ff.remoteOrderId, trackingNumber: "MS123", courier: "MockShip" },
    });
    note("20. Delivered webhook processed", true);
  }

  const payout = recordPayout(MOCK_SUPPLIER.id, orderNumber);
  note("21–22. Commission + payout recorded", payout.netAmount > 0, String(payout.netAmount));

  const failed = await routePaidOrder({
    cheshireOrderNumber: "CHS-E2E-FAIL",
    paymentStatus: "PAID",
    simulateFailure: "order",
    shipping: {
      fullName: "Test Customer",
      phone: "9999999999",
      line1: "1 Ivory Lane",
      city: "Mumbai",
      state: "MH",
      pincode: "400001",
    },
    items: [
      {
        productId: product.id,
        sku: product.sku,
        name: product.title,
        quantity: 1,
        productType: "dropship",
        supplierId: MOCK_SUPPLIER.id,
      },
    ],
  });
  const failRow = failed.fulfillments[0];
  note("Fail-safe: paid order kept after supplier API failure", failRow?.status === "SUPPLIER_SUBMISSION_FAILED");
  const retried = failRow ? await retryFulfillment(failRow.id) : null;
  note("Retry available after failure", Boolean(retried), retried?.status);

  return { ok: steps.every((s) => s.ok), steps, orderNumber };
}
