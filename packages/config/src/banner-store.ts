/**
 * Server-only banner store shared by the admin (writer) and the storefront (reader).
 *
 * Source of truth, in order:
 *   1. `<repo>/.data/hero-banners.json` — written by Admin → Banners (gitignored, local/self-hosted only)
 *   2. `heroBanners` in ./index.ts — the committed defaults (what Vercel builds with)
 *
 * Never import this from a client component: it uses node:fs.
 */
import fs from "node:fs";
import path from "node:path";
import { heroBanners, MAX_ACTIVE_BANNERS, type HeroBanner } from "./index";
import { asStoreError, isReadOnlyDataStore, ReadOnlyStoreError, resolveRepoDataDir } from "./data-dir";

export { resolveRepoDataDir, isReadOnlyDataStore, ReadOnlyStoreError };

export const BANNER_FILE_NAME = "hero-banners.json";
export { MAX_ACTIVE_BANNERS };

export function bannerFilePath() {
  return path.join(resolveRepoDataDir(), BANNER_FILE_NAME);
}

const isStr = (v: unknown, max = 200): v is string => typeof v === "string" && v.trim().length > 0 && v.length <= max;
const isHref = (v: unknown): v is string => isStr(v, 300) && (v.startsWith("/") || v.startsWith("https://"));
const isImageId = (v: unknown): v is string =>
  isStr(v, 300) && (/^photo-[\w-]+$/.test(v) || /^px:\d+$/.test(v));

/** Finished banner artwork shipped in the apps' /public/banners folder. */
const isBannerImage = (v: unknown): v is string => isStr(v, 200) && /^\/banners\/[\w.-]+\.(webp|jpe?g|png|avif)$/i.test(v);

export type BannerValidation = { ok: true; banner: HeroBanner } | { ok: false; errors: string[] };

/** Validate untrusted input (admin form / API body) into a HeroBanner. */
export function validateBanner(input: unknown): BannerValidation {
  const errors: string[] = [];
  const b = (input ?? {}) as Record<string, unknown>;
  const cta = (b.cta ?? {}) as Record<string, unknown>;
  const sec = b.secondaryCta as Record<string, unknown> | undefined;
  if (!isStr(b.id, 60) || !/^[a-z0-9-]+$/.test(b.id)) errors.push("id must be lowercase letters, numbers and dashes");
  if (!isStr(b.eyebrow, 80)) errors.push("eyebrow is required (max 80)");
  if (!isStr(b.headline, 40)) errors.push("headline is required (max 40)");
  if (!isStr(b.accent, 40)) errors.push("accent line is required (max 40)");
  if (!isStr(b.supporting, 240)) errors.push("supporting copy is required (max 240)");
  if (!isStr(cta.label, 40) || !isHref(cta.href)) errors.push("primary CTA needs a label and a link starting with / or https://");
  if (sec && (sec.label || sec.href) && (!isStr(sec.label, 40) || !isHref(sec.href)))
    errors.push("secondary CTA needs both a label and a valid link");
  const ids = Array.isArray(b.imageIds) ? b.imageIds.filter((x) => typeof x === "string" && x.trim()) : [];
  const image = typeof b.image === "string" && b.image.trim() ? b.image.trim() : undefined;
  if (image && !isBannerImage(image)) errors.push("banner image must be a /banners/… .webp, .jpg or .png file");
  if (!image && (ids.length < 1 || ids.length > 2 || !ids.every(isImageId)))
    errors.push("add a full banner image (/banners/…) or 1–2 photos: Unsplash photo-… or Pexels px:<id>");
  if (image && ids.length && (ids.length > 2 || !ids.every(isImageId))) errors.push("photos must be Unsplash photo-… or Pexels px:<id>");
  const size = (b.imageSize ?? {}) as Record<string, unknown>;
  if (b.theme !== "dark" && b.theme !== "light" && b.theme !== "lime") errors.push("theme must be light or dark");
  const sortOrder = Number(b.sortOrder);
  if (!Number.isFinite(sortOrder)) errors.push("sortOrder must be a number");
  if (errors.length) return { ok: false, errors };
  const banner: HeroBanner = {
    id: String(b.id),
    eyebrow: String(b.eyebrow).trim(),
    headline: String(b.headline).trim(),
    accent: String(b.accent).trim(),
    supporting: String(b.supporting).trim(),
    cta: { label: String(cta.label).trim(), href: String(cta.href).trim() },
    imageIds: ids.slice(0, 2) as string[],
    theme: b.theme === "dark" ? "dark" : "light",
    isActive: Boolean(b.isActive),
    sortOrder,
  };
  if (image) {
    banner.image = image;
    const w = Number(size.width);
    const h = Number(size.height);
    const ec = b.edgeColors as { left?: unknown; right?: unknown } | undefined;
    const hexList = (v: unknown) => (Array.isArray(v) && v.length > 0 && v.length <= 8 && v.every((c) => typeof c === "string" && /^#[0-9a-f]{6}$/i.test(c)) ? (v as string[]) : null);
    const left = hexList(ec?.left);
    const right = hexList(ec?.right);
    if (left && right) banner.edgeColors = { left, right };
    banner.imageSize = w > 0 && h > 0 && w < 10000 && h < 10000 ? { width: Math.round(w), height: Math.round(h) } : { width: 2880, height: 1440 };
  }
  if (sec && sec.label && sec.href) banner.secondaryCta = { label: String(sec.label).trim(), href: String(sec.href).trim() };
  return { ok: true, banner };
}

/** Renumber sortOrder 1..n in current order. */
export function normaliseOrder(list: HeroBanner[]): HeroBanner[] {
  return [...list].sort((a, b) => a.sortOrder - b.sortOrder).map((b, i) => ({ ...b, sortOrder: i + 1 }));
}

export function validateBannerList(input: unknown): { ok: true; banners: HeroBanner[] } | { ok: false; errors: string[] } {
  if (!Array.isArray(input)) return { ok: false, errors: ["banners must be an array"] };
  const errors: string[] = [];
  const out: HeroBanner[] = [];
  input.forEach((raw, i) => {
    const r = validateBanner(raw);
    if (r.ok) out.push(r.banner);
    else errors.push(...r.errors.map((e) => `#${i + 1}: ${e}`));
  });
  const ids = new Set(out.map((b) => b.id));
  if (ids.size !== out.length) errors.push("banner ids must be unique");
  if (out.filter((b) => b.isActive).length > MAX_ACTIVE_BANNERS)
    errors.push(`at most ${MAX_ACTIVE_BANNERS} banners can be active at once`);
  return errors.length ? { ok: false, errors } : { ok: true, banners: normaliseOrder(out) };
}

export type BannerSource = "file" | "config";

/** All banners (active + hidden), sorted. Falls back to committed config if no valid file. */
export function readAllHeroBanners(file = bannerFilePath()): { banners: HeroBanner[]; source: BannerSource } {
  try {
    if (fs.existsSync(file)) {
      const parsed = validateBannerList(JSON.parse(fs.readFileSync(file, "utf8")));
      if (parsed.ok) return { banners: parsed.banners, source: "file" };
    }
  } catch {
    /* fall through to defaults */
  }
  return { banners: normaliseOrder(heroBanners), source: "config" };
}

/** Active banners only, in display order — what the storefront carousel renders. */
export function readHeroBanners(file?: string): HeroBanner[] {
  return readAllHeroBanners(file).banners.filter((b) => b.isActive);
}

export function writeHeroBanners(list: unknown, file = bannerFilePath()) {
  const parsed = validateBannerList(list);
  if (!parsed.ok) return parsed;
  if (isReadOnlyDataStore()) throw new ReadOnlyStoreError();
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(parsed.banners, null, 2), "utf8");
    fs.renameSync(tmp, file);
  } catch (e) {
    throw asStoreError(e);
  }
  return parsed;
}

/** Delete the local override so the storefront goes back to the committed defaults. */
export function resetHeroBanners(file = bannerFilePath()) {
  if (isReadOnlyDataStore()) throw new ReadOnlyStoreError();
  if (fs.existsSync(file)) fs.rmSync(file);
}
