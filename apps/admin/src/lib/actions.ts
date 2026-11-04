"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { readAllHeroBanners, resetHeroBanners, writeHeroBanners } from "@cheshire/config/banner-store";
import {
  deleteWebhook,
  emitEvent,
  sendTestEvent,
  saveWebhook,
  validateWebhookUrl,
  AUTOMATION_EVENTS,
  type AutomationEventName,
  type AutomationEvents,
} from "@cheshire/config/automation";
import type { HeroBanner } from "@cheshire/config";
import {
  duplicateProduct,
  getProduct,
  revertProduct,
  saveProduct,
  setProductStatus,
  setStockBySize,
  totalStock,
  validateProduct,
  type AdminProduct,
  type ProductInput,
  type ProductStatus,
} from "./products";
import { getOrder, ORDER_STATUSES, updateOrderStatus, type OrderStatus } from "./orders";
import { listCoupons, saveCoupon, toggleCoupon, validateCoupon, type Coupon, type CouponType } from "./coupons";
import { listCollections, saveCollection } from "./collections";
import { getSettings, saveSettings, type StoreSettings } from "./settings";
import { ReadOnlyStoreError } from "./store";
import { slugify } from "./products";

export type FormState = { ok?: boolean; message?: string; errors?: Record<string, string> };

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const int = (fd: FormData, k: string) => {
  const n = Number(fd.get(k));
  return Number.isFinite(n) ? Math.round(n) : NaN;
};
const list = (v: string) =>
  v
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

/** Turns "can't write here" into a friendly error result; anything else (incl. redirects) is rethrown. */
function storeFailure(e: unknown): FormState {
  if (e instanceof ReadOnlyStoreError || (e instanceof Error && e.name === "ReadOnlyStoreError")) return { ok: false, message: e.message };
  throw e;
}

/** Fire an automation event after the response is sent (never blocks or breaks the save). */
function emit<E extends AutomationEventName>(event: E, data: AutomationEvents[E]) {
  after(async () => {
    try {
      await emitEvent(event, data, "admin");
    } catch {
      /* automations never break admin actions */
    }
  });
}

function productEvents(before: AdminProduct | undefined, after: AdminProduct) {
  if (!before) {
    emit("product.created", { sku: after.sku, name: after.name, category: after.category, status: after.status, price: after.price });
  } else {
    const keys: Array<keyof AdminProduct> = ["sku", "name", "slug", "description", "category", "collection", "fabric", "colour", "colours", "sizes", "stockBySize", "price", "compareAt", "images", "status", "badge"];
    const changed = keys.filter((k) => JSON.stringify(before[k]) !== JSON.stringify(after[k])).map(String);
    if (changed.length) emit("product.updated", { sku: after.sku, name: after.name, changed, status: after.status });
    if (before.status !== after.status) emit("product.status_changed", { sku: after.sku, name: after.name, from: before.status, to: after.status });
  }
  const threshold = getSettings().lowStockThreshold;
  const total = totalStock(after);
  const beforeTotal = before ? totalStock(before) : Infinity;
  if (after.status === "active" && total <= threshold && (beforeTotal > threshold || total < beforeTotal)) {
    const lowSizes = Object.fromEntries(Object.entries(after.stockBySize).filter(([, n]) => n <= 2));
    emit("stock.low", { sku: after.sku, name: after.name, totalStock: total, threshold, lowSizes });
  }
}

/* ───────────── Products ───────────── */

export async function saveProductAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const originalSku = str(fd, "originalSku") || undefined;
  const sizes = fd.getAll("sizes").map(String).filter(Boolean);
  const extraSizes = list(str(fd, "customSizes"));
  const allSizes = [...new Set([...sizes, ...extraSizes])];
  const stockBySize: Record<string, number> = {};
  for (const s of allSizes) {
    const n = Number(fd.get(`stock_${s}`) ?? 0);
    stockBySize[s] = Number.isFinite(n) ? Math.round(n) : -1;
  }
  const input: ProductInput = {
    sku: str(fd, "sku").toUpperCase(),
    name: str(fd, "name").toUpperCase(),
    slug: str(fd, "slug") || slugify(str(fd, "name")),
    description: str(fd, "description"),
    category: str(fd, "category"),
    collection: str(fd, "collection"),
    fabric: str(fd, "fabric"),
    colour: str(fd, "colour"),
    colours: list(str(fd, "colours")),
    sizes: allSizes,
    stockBySize,
    price: int(fd, "price"),
    compareAt: int(fd, "compareAt") || 0,
    images: list(str(fd, "images")),
    status: (str(fd, "status") === "draft" ? "draft" : "active") as ProductStatus,
    badge: str(fd, "badge"),
  };
  const errors = validateProduct(input, { isNew: !originalSku, originalSku });
  if (Object.keys(errors).length) return { ok: false, errors, message: "Please fix the highlighted fields." };
  const before = originalSku ? getProduct(originalSku) : undefined;
  try {
    const saved = saveProduct(input, originalSku);
    productEvents(before, saved);
  } catch (e) {
    return storeFailure(e);
  }
  revalidatePath("/products");
  revalidatePath("/inventory");
  revalidatePath("/");
  if (!originalSku || originalSku !== input.sku) redirect(`/products/${encodeURIComponent(input.sku)}?saved=1`);
  return { ok: true, message: `Saved ${input.name}` };
}

export async function duplicateProductAction(sku: string): Promise<FormState> {
  let copy: AdminProduct | null;
  try {
    copy = duplicateProduct(sku);
  } catch (e) {
    return storeFailure(e);
  }
  if (!copy) return { ok: false, message: "Product not found" };
  productEvents(undefined, copy);
  revalidatePath("/products");
  redirect(`/products/${encodeURIComponent(copy.sku)}?duplicated=${encodeURIComponent(sku)}`);
}

export async function setProductStatusAction(sku: string, status: ProductStatus): Promise<FormState> {
  const before = getProduct(sku);
  try {
    const saved = setProductStatus(sku, status);
    if (!saved) return { ok: false, message: "Product not found" };
    productEvents(before, saved);
  } catch (e) {
    return storeFailure(e);
  }
  revalidatePath("/products");
  revalidatePath(`/products/${sku}`);
  revalidatePath("/");
  return { ok: true, message: status === "active" ? `${sku} is now live on the store` : `${sku} is now hidden (draft)` };
}

export async function revertProductAction(sku: string): Promise<FormState> {
  const before = getProduct(sku);
  try {
    if (!revertProduct(sku)) return { ok: false, message: "Only catalogue products can be reverted" };
  } catch (e) {
    return storeFailure(e);
  }
  const after = getProduct(sku);
  if (before && after) productEvents(before, after);
  revalidatePath("/products");
  revalidatePath(`/products/${sku}`);
  revalidatePath("/inventory");
  return { ok: true, message: "Reverted to the original catalogue values" };
}

export async function saveStockAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const sku = str(fd, "sku");
  const p = getProduct(sku);
  if (!p) return { ok: false, message: "Product not found" };
  const next: Record<string, number> = {};
  for (const s of p.sizes) {
    const n = Number(fd.get(`stock_${s}`));
    if (!Number.isInteger(n) || n < 0) return { ok: false, message: `Size ${s}: enter a whole number, 0 or more` };
    next[s] = n;
  }
  try {
    const saved = setStockBySize(sku, next);
    if (saved) productEvents(p, saved);
  } catch (e) {
    return storeFailure(e);
  }
  revalidatePath("/inventory");
  revalidatePath("/products");
  revalidatePath("/");
  return { ok: true, message: `Stock updated for ${p.name}` };
}

/* ───────────── Banners (shared with storefront via @cheshire/config/banner-store) ───────────── */

export async function saveBannersAction(banners: HeroBanner[]): Promise<FormState> {
  try {
    const r = writeHeroBanners(banners);
    if (!r.ok) return { ok: false, message: r.errors.join(" · ") };
    emit("banner.updated", { activeIds: r.banners.filter((b) => b.isActive).map((b) => b.id), total: r.banners.length, source: "admin" });
  } catch (e) {
    return storeFailure(e);
  }
  revalidatePath("/banners");
  return { ok: true, message: "Banners saved. The storefront shows them on the next page load." };
}

export async function resetBannersAction(): Promise<FormState> {
  try {
    resetHeroBanners();
  } catch (e) {
    return storeFailure(e);
  }
  const { banners } = readAllHeroBanners();
  emit("banner.updated", { activeIds: banners.filter((b) => b.isActive).map((b) => b.id), total: banners.length, source: "admin" });
  revalidatePath("/banners");
  return { ok: true, message: "Banners reset to the original set." };
}

export async function getBannersAction() {
  return readAllHeroBanners();
}

/* ───────────── Orders ───────────── */

export async function updateOrderStatusAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const id = str(fd, "id");
  const status = str(fd, "status") as OrderStatus;
  if (!ORDER_STATUSES.includes(status)) return { ok: false, message: "Unknown status" };
  const before = getOrder(id);
  try {
    const r = updateOrderStatus(id, status, str(fd, "note"));
    if (!r.ok) return { ok: false, message: r.error };
  } catch (e) {
    return storeFailure(e);
  }
  if (before)
    emit("order.status_changed", {
      orderId: id,
      from: before.status,
      to: status,
      note: str(fd, "note") || undefined,
      customerCity: before.customer.city,
      total: before.total,
    });
  revalidatePath(`/orders/${id}`);
  revalidatePath("/orders");
  revalidatePath("/");
  return { ok: true, message: `Order ${id} marked as ${status}` };
}

/* ───────────── Coupons ───────────── */

export async function saveCouponAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const originalCode = str(fd, "originalCode") || undefined;
  const type = str(fd, "type") as CouponType;
  const c: Coupon = {
    code: str(fd, "code").toUpperCase(),
    description: str(fd, "description"),
    type: type === "flat" || type === "free_shipping" ? type : "percent",
    value: type === "free_shipping" ? 0 : int(fd, "value"),
    minSubtotal: int(fd, "minSubtotal") || 0,
    categories: fd.getAll("categories").map(String),
    usageLimit: int(fd, "usageLimit") || 0,
    used: int(fd, "used") || 0,
    startsAt: str(fd, "startsAt"),
    endsAt: str(fd, "endsAt"),
    active: fd.get("active") === "on",
  };
  const errors = validateCoupon(c, { isNew: !originalCode });
  if (Object.keys(errors).length) return { ok: false, errors, message: "Please fix the highlighted fields." };
  try {
    saveCoupon(c, originalCode);
  } catch (e) {
    return storeFailure(e);
  }
  emit("coupon.saved", { code: c.code, type: c.type, value: c.value, active: c.active });
  revalidatePath("/coupons");
  return { ok: true, message: `Saved coupon ${c.code}` };
}

export async function toggleCouponAction(code: string): Promise<FormState> {
  try {
    toggleCoupon(code);
  } catch (e) {
    return storeFailure(e);
  }
  const c = listCoupons().find((x) => x.code === code);
  if (c) emit("coupon.saved", { code: c.code, type: c.type, value: c.value, active: c.active });
  revalidatePath("/coupons");
  return { ok: true, message: c?.active ? `${code} resumed` : `${code} paused` };
}

/* ───────────── Collections ───────────── */

export async function saveCollectionAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const original = str(fd, "originalSlug");
  const name = str(fd, "name");
  const slug = original || slugify(str(fd, "slug") || name);
  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Enter a name (at least 2 characters)";
  if (!/^[a-z0-9-]{2,60}$/.test(slug)) errors.slug = "Use lowercase letters, numbers and dashes only";
  const existing = listCollections();
  if (!original && existing.some((c) => c.slug === slug)) errors.slug = "Another collection already uses this web address";
  if (Object.keys(errors).length) return { ok: false, errors, message: "Please fix the highlighted fields." };
  const prev = existing.find((c) => c.slug === slug);
  try {
    saveCollection({
      slug,
      name,
      description: str(fd, "description"),
      featured: fd.get("featured") === "on",
      sortOrder: int(fd, "sortOrder") || prev?.sortOrder || existing.length + 1,
      origin: prev?.origin ?? "admin",
    });
  } catch (e) {
    return storeFailure(e);
  }
  revalidatePath("/collections");
  return { ok: true, message: `Saved collection ${name}` };
}

/* ───────────── Settings ───────────── */

export async function saveSettingsAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const s: StoreSettings = {
    storeName: str(fd, "storeName"),
    supportEmail: str(fd, "supportEmail"),
    supportPhone: str(fd, "supportPhone"),
    freeShippingThreshold: int(fd, "freeShippingThreshold"),
    standardShippingFee: int(fd, "standardShippingFee"),
    lowStockThreshold: int(fd, "lowStockThreshold"),
    gstPercent: int(fd, "gstPercent"),
    codEnabled: fd.get("codEnabled") === "on",
    announcement: str(fd, "announcement"),
  };
  const errors: Record<string, string> = {};
  if (!s.storeName) errors.storeName = "Enter your store name";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.supportEmail)) errors.supportEmail = "Enter a valid email, e.g. care@cheshire.in";
  for (const k of ["freeShippingThreshold", "standardShippingFee", "lowStockThreshold", "gstPercent"] as const)
    if (!Number.isFinite(s[k]) || s[k] < 0) errors[k] = "Enter a whole number, 0 or more";
  if (Object.keys(errors).length) return { ok: false, errors, message: "Please fix the highlighted fields." };
  const before = getSettings();
  try {
    saveSettings(s);
  } catch (e) {
    return storeFailure(e);
  }
  const changed = (Object.keys(s) as Array<keyof StoreSettings>).filter((k) => before[k] !== s[k]);
  if (changed.length) emit("settings.updated", { changed });
  revalidatePath("/", "layout");
  return { ok: true, message: "Settings saved" };
}

/* ───────────── Automations (webhooks) ───────────── */

export async function saveWebhookAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const id = str(fd, "id") || undefined;
  const name = str(fd, "name");
  const url = str(fd, "url");
  const known = new Set(AUTOMATION_EVENTS.map((e) => e.name));
  const events = fd.getAll("events").map(String).filter((e): e is AutomationEventName => known.has(e as AutomationEventName));
  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Give it a name you'll recognise, e.g. “Zapier – low stock”";
  const urlErr = validateWebhookUrl(url);
  if (urlErr) errors.url = urlErr;
  if (!events.length) errors.events = "Pick at least one event";
  if (Object.keys(errors).length) return { ok: false, errors, message: "Please fix the highlighted fields." };
  try {
    saveWebhook({ id, name, url, events, enabled: fd.get("enabled") === "on" || !id });
  } catch (e) {
    return storeFailure(e);
  }
  revalidatePath("/automations");
  return { ok: true, message: id ? `Updated “${name}”` : `Added “${name}”. Use “Send test” to check it works.` };
}

export async function toggleWebhookAction(id: string, enabled: boolean): Promise<FormState> {
  const { listWebhooks } = await import("@cheshire/config/automation");
  const hook = listWebhooks().find((w) => w.id === id);
  if (!hook) return { ok: false, message: "Webhook not found" };
  try {
    saveWebhook({ ...hook, enabled });
  } catch (e) {
    return storeFailure(e);
  }
  revalidatePath("/automations");
  return { ok: true, message: enabled ? `“${hook.name}” turned on` : `“${hook.name}” paused` };
}

export async function deleteWebhookAction(id: string): Promise<FormState> {
  try {
    deleteWebhook(id);
  } catch (e) {
    return storeFailure(e);
  }
  revalidatePath("/automations");
  return { ok: true, message: "Webhook removed" };
}

export async function testWebhookAction(id: string, event?: AutomationEventName): Promise<FormState> {
  let d;
  try {
    d = await sendTestEvent(id, event);
  } catch (e) {
    return storeFailure(e);
  }
  revalidatePath("/automations");
  if (!d) return { ok: false, message: "Webhook not found" };
  return d.ok
    ? { ok: true, message: `Test delivered (HTTP ${d.status}, ${d.durationMs} ms)` }
    : { ok: false, message: `Test failed: ${d.error ?? "no response"}` };
}
