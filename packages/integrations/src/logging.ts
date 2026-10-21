import { sanitizeLogValue } from "./credentials";

export type IntegrationLog = {
  at: string;
  level: "info" | "warn" | "error";
  event: string;
  supplierId?: string;
  durationMs?: number;
  status?: string;
  data?: unknown;
};

const buffer: IntegrationLog[] = [];

export function integrationLog(
  level: IntegrationLog["level"],
  event: string,
  extra: Omit<IntegrationLog, "at" | "level" | "event"> = {}
) {
  const row: IntegrationLog = {
    at: new Date().toISOString(),
    level,
    event,
    ...extra,
    data: extra.data !== undefined ? sanitizeLogValue(extra.data) : undefined,
  };
  buffer.unshift(row);
  if (buffer.length > 400) buffer.pop();
  if (level === "error") console.error("[cheshire:integrations]", event, row.data ?? "");
  else if (process.env.NODE_ENV !== "test") console.info("[cheshire:integrations]", event);
  return row;
}

export function recentIntegrationLogs(limit = 50) {
  return buffer.slice(0, limit);
}
