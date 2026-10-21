import { getIntegrations, syncInventory, syncPrices, testConnection } from "./engine";
import { getFeatureFlags } from "./flags";
import { integrationLog } from "./logging";

const MS: Record<string, number> = {
  "15m": 15 * 60_000,
  "30m": 30 * 60_000,
  "1h": 60 * 60_000,
  "6h": 6 * 60 * 60_000,
  daily: 24 * 60 * 60_000,
};

let timer: NodeJS.Timeout | null = null;

export function startIntegrationWorker() {
  if (timer || process.env.NODE_ENV === "test") return;
  timer = setInterval(() => {
    void tick();
  }, 60_000);
  integrationLog("info", "worker.started");
}

async function tick() {
  const flags = getFeatureFlags();
  if (!flags.SUPPLIER_SYNC_ENABLED) return;
  const now = Date.now();
  for (const row of getIntegrations()) {
    if (row.schedule === "manual" || row.integrationStatus === "DISABLED") continue;
    const every = MS[row.schedule];
    if (!every) continue;
    const last = row.lastSuccessfulSync ? Date.parse(row.lastSuccessfulSync) : 0;
    if (now - last < every) continue;
    try {
      await testConnection(row.id);
      if (flags.AUTO_INVENTORY_SYNC_ENABLED && row.capabilities.includes("INVENTORY_SYNC")) {
        await syncInventory(row.id);
      }
      if (flags.AUTO_PRICE_SYNC_ENABLED && row.capabilities.includes("PRICE_SYNC")) {
        await syncPrices(row.id);
      }
    } catch (error) {
      integrationLog("error", "worker.tick", {
        supplierId: row.supplierId,
        data: { message: error instanceof Error ? error.message : "tick failed" },
      });
    }
  }
}
