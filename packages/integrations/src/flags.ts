import type { FeatureFlags } from "./types";

function flag(name: string, fallback: boolean) {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallback;
  return raw === "1" || raw.toLowerCase() === "true";
}

export function getFeatureFlags(): FeatureFlags {
  return {
    SUPPLIER_SYNC_ENABLED: flag("SUPPLIER_SYNC_ENABLED", true),
    AUTO_ORDER_SUBMISSION_ENABLED: flag("AUTO_ORDER_SUBMISSION_ENABLED", true),
    AUTO_PRICE_SYNC_ENABLED: flag("AUTO_PRICE_SYNC_ENABLED", false),
    AUTO_INVENTORY_SYNC_ENABLED: flag("AUTO_INVENTORY_SYNC_ENABLED", false),
    WEBHOOKS_ENABLED: flag("WEBHOOKS_ENABLED", true),
  };
}
