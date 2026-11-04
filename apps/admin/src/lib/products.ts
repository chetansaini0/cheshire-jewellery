import { categories, seedProducts, type SeedProduct } from "@cheshire/database/catalog";
import { readStore, writeStore } from "./store";

export type ProductStatus = "active" | "draft";

export type AdminProduct = {
  sku: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  collection: string;
  fabric: string;
  colour: string;
  /** Other colourways offered (free text, e.g. "Black", "Bottle Green") */
  colours: string[];
  sizes: string[];
  stockBySize: Record<string, number>;
  price: number;
  compareAt: number;
  /** Catalogue image ids ("photo-…", "px:<id>") or https URLs. First is the cover. */
  images: string[];
  status: ProductStatus;
  badge: string;
  /** "catalogue" = committed seed product; "admin" = created in the admin */
  origin: "catalogue" | "admin";
  /** true once edited in the admin (local store overrides the catalogue) */
  edited: boolean;
  updatedAt?: string;
};

export const SIZE_PRESETS: Record<string, string[]> = {
  apparel: ["XS", "S", "M", "L", "XL", "XXL"],
  ethnic: ["S", "M", "L", "XL", "XXL"],
  saree: ["Free Size"],
  denim: ["28", "30", "32", "34", "36"],
  oneSize: ["One Size"],
};

const SIZE_WEIGHTS: Record<string, number> = { XS: 0.6, S: 1, M: 1.6, L: 1.6, XL: 1, XXL: 0.6 };

/** Deterministically split a catalogue total across sizes (bell-ish curve). */
export function splitStock(total: number, sizes: string[]): Record<string, number> {
  if (!sizes.length) return {};
  const w = sizes.map((s) => SIZE_WEIGHTS[s] ?? 1);
  const sum = w.reduce((a, b) => a + b, 0);
  const out: Record<string, number> = {};
  let assigned = 0;
  sizes.forEach((s, i) => {
    const n = Math.floor((total * w[i]) / sum);
    out[s] = n;
    assigned += n;
  });
  const mid = sizes[Math.floor(sizes.length / 2)];
  out[mid] += total - assigned;
  return out;
}

function fromSeed(p: SeedProduct): AdminProduct {
  const sizes = p.sizes.length ? p.sizes : ["One Size"];
  return {
    sku: p.sku,
    name: p.name,
    slug: p.slug,
    description: p.description,
    category: p.category,
    collection: p.collection ?? "",
    fabric: p.material,
    colour: p.color,
    colours: [],
    sizes,
    stockBySize: splitStock(p.stock, sizes),
    price: p.price,
    compareAt: p.mrp,
    images: [...p.imageIds],
    status: "active",
    badge: p.badge ?? "",
    origin: "catalogue",
    edited: false,
  };
}

type ProductStore = { records: Record<string, AdminProduct> };

function store(): ProductStore {
  return readStore<ProductStore>("products", { records: {} });
}

export function totalStock(p: Pick<AdminProduct, "stockBySize">) {
  return Object.values(p.stockBySize).reduce((a, b) => a + (Number(b) || 0), 0);
}

export function listProducts(): AdminProduct[] {
  const { records } = store();
  const seeded = seedProducts.map((p) => records[p.sku] ?? fromSeed(p));
  const seedSkus = new Set(seedProducts.map((p) => p.sku));
  const created = Object.values(records)
    .filter((p) => !seedSkus.has(p.sku))
    .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
  return [...created, ...seeded];
}

export function getProduct(sku: string): AdminProduct | undefined {
  return listProducts().find((p) => p.sku === sku);
}

export function categoryName(slug: string) {
  return categories.find((c) => c.slug === slug)?.name ?? slug;
}

export function fabricOptions(products = listProducts()) {
  return [...new Set(products.map((p) => p.fabric))].sort();
}

export function sizeOptions(products = listProducts()) {
  const order = ["XS", "S", "M", "L", "XL", "XXL", "Free Size", "One Size"];
  return [...new Set(products.flatMap((p) => p.sizes))].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia >= 0 && ib >= 0) return ia - ib;
    if (ia >= 0) return -1;
    if (ib >= 0) return 1;
    return a.localeCompare(b, undefined, { numeric: true });
  });
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const CATEGORY_PREFIX: Record<string, string> = {
  tees: "TEE",
  hoodies: "HOD",
  outerwear: "OUT",
  denim: "DEN",
  dresses: "DRS",
  "co-ords": "CRD",
  lehengas: "LEH",
  sarees: "SAR",
  suits: "SUT",
  accessories: "ACC",
};

export function nextSku(category: string, products = listProducts()) {
  const prefix = `CH-${CATEGORY_PREFIX[category] ?? "NEW"}-`;
  const max = products
    .map((p) => (p.sku.startsWith(prefix) ? Number(p.sku.slice(prefix.length)) : 0))
    .filter(Number.isFinite)
    .reduce((a, b) => Math.max(a, b), 0);
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

export type ProductInput = Omit<AdminProduct, "origin" | "edited" | "updatedAt">;

export function validateProduct(input: ProductInput, opts: { isNew: boolean; originalSku?: string }) {
  const errors: Record<string, string> = {};
  const all = listProducts();
  if (!/^[A-Z0-9-]{4,24}$/.test(input.sku)) errors.sku = "Use 4–24 uppercase letters, numbers or dashes";
  else if ((opts.isNew || input.sku !== opts.originalSku) && all.some((p) => p.sku === input.sku)) errors.sku = "SKU already exists";
  if (input.name.trim().length < 3) errors.name = "Name is required";
  if (!/^[a-z0-9-]{3,80}$/.test(input.slug)) errors.slug = "Lowercase letters, numbers and dashes";
  else if (all.some((p) => p.slug === input.slug && p.sku !== (opts.originalSku ?? input.sku))) errors.slug = "Slug already used";
  if (!categories.some((c) => c.slug === input.category)) errors.category = "Pick a category";
  if (!input.fabric.trim()) errors.fabric = "Fabric is required";
  if (!input.colour.trim()) errors.colour = "Colour is required";
  if (!input.sizes.length) errors.sizes = "Add at least one size";
  if (!(input.price > 0)) errors.price = "Price must be above 0";
  if (input.compareAt && input.compareAt < input.price) errors.compareAt = "Compare-at must be ≥ price (or 0)";
  if (!input.images.length) errors.images = "Add at least one image";
  else if (!input.images.every((i) => /^photo-[\w-]+$/.test(i) || /^px:\d+$/.test(i) || /^https:\/\//.test(i)))
    errors.images = "Images must be photo-… (Unsplash), px:<id> (Pexels) or https:// URLs";
  if (Object.values(input.stockBySize).some((n) => !Number.isInteger(n) || n < 0)) errors.stock = "Stock must be whole numbers ≥ 0";
  return errors;
}

export function saveProduct(input: ProductInput, originalSku?: string) {
  const s = store();
  const isSeed = seedProducts.some((p) => p.sku === input.sku);
  if (originalSku && originalSku !== input.sku) delete s.records[originalSku];
  s.records[input.sku] = {
    ...input,
    origin: isSeed ? "catalogue" : "admin",
    edited: true,
    updatedAt: new Date().toISOString(),
  };
  writeStore("products", s);
  return s.records[input.sku];
}

export function setProductStatus(sku: string, status: ProductStatus) {
  const p = getProduct(sku);
  if (!p) return null;
  return saveProduct({ ...p, status });
}

export function setStockBySize(sku: string, stockBySize: Record<string, number>) {
  const p = getProduct(sku);
  if (!p) return null;
  return saveProduct({ ...p, stockBySize: { ...p.stockBySize, ...stockBySize } });
}

export function duplicateProduct(sku: string) {
  const p = getProduct(sku);
  if (!p) return null;
  const all = listProducts();
  const newSku = nextSku(p.category, all);
  let slug = `${p.slug}-copy`;
  let i = 2;
  while (all.some((x) => x.slug === slug)) slug = `${p.slug}-copy-${i++}`;
  return saveProduct({
    ...p,
    sku: newSku,
    slug,
    name: `${p.name} (COPY)`,
    status: "draft",
    stockBySize: Object.fromEntries(p.sizes.map((s) => [s, 0])),
  });
}

/** Restore a catalogue product to its committed values (drops local edits). Admin-created products are untouched. */
export function revertProduct(sku: string) {
  const s = store();
  if (!seedProducts.some((p) => p.sku === sku)) return false;
  delete s.records[sku];
  writeStore("products", s);
  return true;
}
