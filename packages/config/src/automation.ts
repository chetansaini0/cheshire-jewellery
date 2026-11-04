/**
 * Automation layer: typed events + webhook registry + delivery log.
 *
 * Server-only (node:fs, node:crypto). Used by the admin (server actions) and the API.
 * Storage: `<repo>/.data/automation/*.json` (gitignored). On read-only hosts (Vercel) nothing is
 * stored and no webhooks are called — see `isReadOnlyDataStore()`.
 *
 * Safety: the only outbound HTTP calls are to webhook URLs the owner registered (or a test-send he
 * clicks). Each request has a 5s timeout and an HMAC-SHA256 signature header.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { asStoreError, isReadOnlyDataStore, ReadOnlyStoreError, resolveRepoDataDir } from "./data-dir";

export { isReadOnlyDataStore, ReadOnlyStoreError };

/* ───────────── Event catalogue ───────────── */

export type AutomationEvents = {
  "product.created": { sku: string; name: string; category: string; status: "active" | "draft"; price: number };
  "product.updated": { sku: string; name: string; changed: string[]; status: "active" | "draft" };
  "product.status_changed": { sku: string; name: string; from: "active" | "draft"; to: "active" | "draft" };
  "stock.low": { sku: string; name: string; totalStock: number; threshold: number; lowSizes: Record<string, number> };
  "banner.updated": { activeIds: string[]; total: number; source: "admin" | "api" };
  "order.status_changed": { orderId: string; from: string; to: string; note?: string; customerCity?: string; total?: number };
  "coupon.saved": { code: string; type: string; value: number; active: boolean };
  "settings.updated": { changed: string[] };
};

export type AutomationEventName = keyof AutomationEvents;

export const AUTOMATION_EVENTS: Array<{ name: AutomationEventName; label: string; description: string }> = [
  { name: "product.created", label: "Product created", description: "A new product (or a duplicate) was saved." },
  { name: "product.updated", label: "Product updated", description: "Any product field was changed and saved." },
  { name: "product.status_changed", label: "Product published / unpublished", description: "A product moved between Active and Draft." },
  { name: "stock.low", label: "Stock running low", description: "A save left a product at or below the low-stock threshold." },
  { name: "banner.updated", label: "Homepage banners changed", description: "Hero banners were saved, reordered or reset." },
  { name: "order.status_changed", label: "Order status changed", description: "An order moved to confirmed, packed, shipped, delivered, cancelled or returned." },
  { name: "coupon.saved", label: "Coupon created or changed", description: "A discount code was created, edited, paused or resumed." },
  { name: "settings.updated", label: "Store settings changed", description: "Something on the Settings page was saved." },
];

export type AutomationEnvelope<E extends AutomationEventName = AutomationEventName> = {
  id: string;
  event: E;
  createdAt: string;
  source: "admin" | "api" | "test";
  data: AutomationEvents[E];
};

export type Webhook = {
  id: string;
  name: string;
  url: string;
  events: AutomationEventName[];
  secret: string;
  enabled: boolean;
  createdAt: string;
};

export type Delivery = {
  id: string;
  webhookId: string;
  webhookName: string;
  url: string;
  event: AutomationEventName;
  eventId: string;
  at: string;
  ok: boolean;
  status?: number;
  durationMs: number;
  error?: string;
  test?: boolean;
};

/* ───────────── Storage ───────────── */

function dir() {
  return path.join(resolveRepoDataDir(), "automation");
}

function read<T>(name: string, fallback: T): T {
  try {
    const f = path.join(dir(), `${name}.json`);
    return fs.existsSync(f) ? (JSON.parse(fs.readFileSync(f, "utf8")) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(name: string, data: unknown) {
  if (isReadOnlyDataStore()) throw new ReadOnlyStoreError();
  const f = path.join(dir(), `${name}.json`);
  try {
    fs.mkdirSync(path.dirname(f), { recursive: true });
    const tmp = `${f}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
    fs.renameSync(tmp, f);
  } catch (e) {
    throw asStoreError(e);
  }
}

const MAX_LOG = 100;

export function listWebhooks(): Webhook[] {
  return read<Webhook[]>("webhooks", []);
}

export function listDeliveries(): Delivery[] {
  return read<Delivery[]>("deliveries", []);
}

export function listRecentEvents(): AutomationEnvelope[] {
  return read<AutomationEnvelope[]>("events", []);
}

/** Accept https URLs, or http only for localhost / 127.0.0.1 (local testing). */
export function validateWebhookUrl(url: string): string | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return "Enter a full URL, e.g. https://hooks.zapier.com/…";
  }
  if (u.username || u.password) return "Don't put usernames or passwords in the URL";
  if (u.protocol === "https:") return null;
  if (u.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname)) return null;
  return "Use an https:// address (http:// is only allowed for localhost)";
}

export function saveWebhook(input: { id?: string; name: string; url: string; events: AutomationEventName[]; enabled: boolean }) {
  const all = listWebhooks();
  const existing = input.id ? all.find((w) => w.id === input.id) : undefined;
  const hook: Webhook = {
    id: existing?.id ?? `wh_${crypto.randomBytes(6).toString("hex")}`,
    secret: existing?.secret ?? `whsec_${crypto.randomBytes(24).toString("hex")}`,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    name: input.name.trim(),
    url: input.url.trim(),
    events: input.events,
    enabled: input.enabled,
  };
  write("webhooks", existing ? all.map((w) => (w.id === hook.id ? hook : w)) : [...all, hook]);
  return hook;
}

export function deleteWebhook(id: string) {
  write(
    "webhooks",
    listWebhooks().filter((w) => w.id !== id)
  );
}

/* ───────────── Delivery ───────────── */

export function signPayload(secret: string, timestamp: string, body: string) {
  return crypto.createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
}

async function deliver(hook: Webhook, envelope: AutomationEnvelope, test = false): Promise<Delivery> {
  const body = JSON.stringify(envelope);
  const ts = String(Math.floor(Date.now() / 1000));
  const started = Date.now();
  const base = {
    id: `dl_${crypto.randomBytes(6).toString("hex")}`,
    webhookId: hook.id,
    webhookName: hook.name,
    url: hook.url,
    event: envelope.event,
    eventId: envelope.id,
    at: new Date().toISOString(),
    test,
  };
  try {
    const res = await fetch(hook.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "cheshire-automations/1",
        "x-cheshire-event": envelope.event,
        "x-cheshire-delivery": base.id,
        "x-cheshire-timestamp": ts,
        "x-cheshire-signature": `sha256=${signPayload(hook.secret, ts, body)}`,
      },
      body,
      redirect: "manual",
      signal: AbortSignal.timeout(5000),
    });
    return { ...base, ok: res.ok, status: res.status, durationMs: Date.now() - started, error: res.ok ? undefined : `HTTP ${res.status}` };
  } catch (e) {
    const msg = e instanceof Error ? (e.name === "TimeoutError" ? "Timed out after 5s" : e.message) : "Request failed";
    return { ...base, ok: false, durationMs: Date.now() - started, error: msg.slice(0, 200) };
  }
}

function logDeliveries(rows: Delivery[]) {
  if (!rows.length) return;
  try {
    write("deliveries", [...rows, ...listDeliveries()].slice(0, MAX_LOG));
  } catch {
    /* logging must never break the action */
  }
}

/**
 * Record an event and deliver it to every enabled webhook subscribed to it.
 * Never throws: automations must not break the action that triggered them.
 */
export async function emitEvent<E extends AutomationEventName>(event: E, data: AutomationEvents[E], source: "admin" | "api" = "admin") {
  const envelope: AutomationEnvelope<E> = {
    id: `evt_${crypto.randomBytes(8).toString("hex")}`,
    event,
    createdAt: new Date().toISOString(),
    source,
    data,
  };
  if (isReadOnlyDataStore()) return { envelope, deliveries: [] as Delivery[] };
  try {
    write("events", [envelope, ...listRecentEvents()].slice(0, MAX_LOG));
  } catch {
    /* ignore */
  }
  const hooks = listWebhooks().filter((w) => w.enabled && w.events.includes(event));
  const deliveries = await Promise.all(hooks.map((h) => deliver(h, envelope)));
  logDeliveries(deliveries);
  return { envelope, deliveries };
}

export const SAMPLE_PAYLOADS: { [E in AutomationEventName]: AutomationEvents[E] } = {
  "product.created": { sku: "CH-LEH-007", name: "EMERALD CHANDERI LEHENGA", category: "lehengas", status: "draft", price: 14999 },
  "product.updated": { sku: "CH-SAR-001", name: "KANJEEVARAM TEMPLE SAREE", changed: ["price", "stock"], status: "active" },
  "product.status_changed": { sku: "CH-SUT-002", name: "MINT CHANDERI ANARKALI", from: "draft", to: "active" },
  "stock.low": { sku: "CH-LEH-003", name: "RANI SINDOOR BRIDAL LEHENGA", totalStock: 4, threshold: 10, lowSizes: { S: 1, XXL: 0 } },
  "banner.updated": { activeIds: ["festive-edit", "drop-07"], total: 5, source: "admin" },
  "order.status_changed": { orderId: "CH10607", from: "placed", to: "confirmed", note: "Test", customerCity: "Bhopal", total: 2299 },
  "coupon.saved": { code: "DIWALI20", type: "percent", value: 20, active: true },
  "settings.updated": { changed: ["lowStockThreshold"] },
};

/** Send a sample payload to one webhook, on demand (the "Send test" button). */
export async function sendTestEvent(webhookId: string, event?: AutomationEventName) {
  const hook = listWebhooks().find((w) => w.id === webhookId);
  if (!hook) return null;
  const name = event ?? hook.events[0] ?? "product.updated";
  const envelope: AutomationEnvelope = {
    id: `evt_test_${crypto.randomBytes(6).toString("hex")}`,
    event: name,
    createdAt: new Date().toISOString(),
    source: "test",
    data: SAMPLE_PAYLOADS[name],
  };
  const d = await deliver(hook, envelope, true);
  logDeliveries([d]);
  return d;
}
