"use client";

import Link from "next/link";
import { useActionState, useMemo, useRef, useState } from "react";
import { Hint, SaveHint, useResultToast, useUnsavedChanges } from "@/components/feedback";
import { Icon } from "@/components/Icon";
import { Thumb } from "@/components/Thumb";
import { saveProductAction, type FormState } from "@/lib/actions";
import type { AdminProduct } from "@/lib/products";

const PRESETS: Record<string, string[]> = {
  "XS–XXL": ["XS", "S", "M", "L", "XL", "XXL"],
  "S–XXL (ethnic)": ["S", "M", "L", "XL", "XXL"],
  "Free Size (saree)": ["Free Size"],
  "Waist 28–36": ["28", "30", "32", "34", "36"],
  "One Size": ["One Size"],
};
const BADGES = ["", "NEW", "BESTSELLER", "TRENDING", "LIMITED", "SALE", "EXCLUSIVE"];

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function ProductForm({
  product,
  isNew,
  categories,
  collections,
  suggestedSku,
}: {
  product: AdminProduct;
  isNew: boolean;
  categories: Array<{ slug: string; name: string }>;
  collections: Array<{ slug: string; name: string }>;
  suggestedSku?: Record<string, string>;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProductAction, {});
  const formRef = useRef<HTMLFormElement>(null);
  useResultToast(state);
  const { dirty } = useUnsavedChanges(formRef, state);
  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [category, setCategory] = useState(product.category);
  const [sku, setSku] = useState(product.sku);
  const [sizes, setSizes] = useState<string[]>(product.sizes);
  const [stock, setStock] = useState<Record<string, number>>(product.stockBySize);
  const [newSize, setNewSize] = useState("");
  const [images, setImages] = useState(product.images.join("\n"));
  const [price, setPrice] = useState(product.price || 0);
  const [compareAt, setCompareAt] = useState(product.compareAt || 0);
  const [status, setStatus] = useState(product.status);
  const imageList = useMemo(() => images.split(/[\n,]/).map((s) => s.trim()).filter(Boolean), [images]);
  const total = sizes.reduce((s, z) => s + (Number(stock[z]) || 0), 0);
  const discount = compareAt > price && price > 0 ? Math.round(((compareAt - price) / compareAt) * 100) : 0;
  const err = state.errors ?? {};

  const toggleSize = (s: string) => setSizes((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  const moveImage = (i: number, dir: -1 | 1) => {
    const next = [...imageList];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setImages(next.join("\n"));
  };

  const field = (k: string) => (err[k] ? "!border-red-500 focus:!ring-red-500/30" : "");
  const errorText = (k: string) => (err[k] ? <p className="mt-1 text-xs text-red-600">{err[k]}</p> : null);

  return (
    <form ref={formRef} action={action} className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <input type="hidden" name="originalSku" value={isNew ? "" : product.sku} />
      {sizes.map((s) => (
        <input key={s} type="hidden" name="sizes" value={s} />
      ))}

      <div className="space-y-6">
        <section className="card p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em]">Basics</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="name">Product name</label>
              <input
                id="name"
                name="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
                className={`input uppercase ${field("name")}`}
                placeholder="e.g. EMERALD CHANDERI ANARKALI SET"
                required
              />
              {errorText("name")}
            </div>
            <div>
              <label className="label" htmlFor="sku">Product code (SKU)<Hint>Your own unique code for this item, used on orders and stock sheets. We suggest one based on the category.</Hint></label>
              <input id="sku" name="sku" value={sku} onChange={(e) => setSku(e.target.value.toUpperCase())} className={`input font-mono ${field("sku")}`} required />
              {errorText("sku")}
            </div>
            <div>
              <label className="label" htmlFor="slug">Web address<Hint>The end of the product page link, e.g. cheshire.in/products/<b>emerald-anarkali</b>. Filled in from the name.</Hint></label>
              <input
                id="slug"
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(slugify(e.target.value));
                  setSlugTouched(true);
                }}
                className={`input font-mono text-xs ${field("slug")}`}
              />
              {errorText("slug")}
            </div>
            <div>
              <label className="label" htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (isNew && suggestedSku?.[e.target.value]) setSku(suggestedSku[e.target.value]);
                  if (isNew && ["lehengas", "suits"].includes(e.target.value)) setSizes(PRESETS["S–XXL (ethnic)"]);
                  if (isNew && e.target.value === "sarees") setSizes(PRESETS["Free Size (saree)"]);
                }}
                className={`input ${field("category")}`}
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errorText("category")}
            </div>
            <div>
              <label className="label" htmlFor="collection">Collection<Hint>Optional group like “Festive Edit”. Manage these under Catalogue → Collections.</Hint></label>
              <select id="collection" name="collection" defaultValue={product.collection} className="input">
                <option value="">— None —</option>
                {collections.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="description">Description</label>
              <textarea id="description" name="description" defaultValue={product.description} rows={4} className="input" placeholder="Fabric, fit, what's included, care…" />
              {category === "sarees" ? <p className="mt-1 text-xs text-muted">Tip: mention blouse piece (unstitched, length) and saree length (5.5 m).</p> : null}
            </div>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em]">Fabric & colour</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="fabric">Fabric</label>
              <input id="fabric" name="fabric" defaultValue={product.fabric} className={`input ${field("fabric")}`} placeholder="e.g. Chanderi Silk" list="fabric-list" />
              <datalist id="fabric-list">
                {["Georgette", "Chiffon", "Chanderi Silk", "Banarasi Silk", "Cotton Silk", "Organza", "Velvet", "240 GSM Combed Cotton", "400 GSM Brushed Fleece", "14oz Rigid Denim", "Linen Blend"].map((f) => (
                  <option key={f} value={f} />
                ))}
              </datalist>
              {errorText("fabric")}
            </div>
            <div>
              <label className="label" htmlFor="colour">Primary colour</label>
              <input id="colour" name="colour" defaultValue={product.colour} className={`input ${field("colour")}`} placeholder="e.g. Emerald" />
              {errorText("colour")}
            </div>
            <div>
              <label className="label" htmlFor="colours">Other colours available<Hint>Comma separated, e.g. Black, Bottle Green.</Hint></label>
              <input id="colours" name="colours" defaultValue={product.colours.join(", ")} className="input" placeholder="Comma separated" />
            </div>
          </div>
        </section>

        <section className="card p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em]">Sizes & stock</h2>
            <span className="text-xs text-muted">
              Total <strong className="text-ink">{total}</strong> units
            </span>
          </div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {Object.entries(PRESETS).map(([label, list]) => (
              <button
                key={label}
                type="button"
                onClick={() => setSizes(list)}
                className="rounded-full border border-line px-2.5 py-1 text-[11px] font-semibold text-muted hover:border-ink hover:text-ink"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {sizes.map((s) => (
              <div key={s} className="rounded-lg border border-line p-2">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-semibold">{s}</span>
                  <button type="button" onClick={() => toggleSize(s)} className="text-muted hover:text-red-600" aria-label={`Remove size ${s}`}>
                    <Icon name="x" className="h-3.5 w-3.5" />
                  </button>
                </div>
                <input
                  type="number"
                  min={0}
                  step={1}
                  name={`stock_${s}`}
                  value={stock[s] ?? 0}
                  onChange={(e) => setStock((cur) => ({ ...cur, [s]: Number(e.target.value) }))}
                  className={`input px-2 py-1.5 tabular-nums ${(stock[s] ?? 0) === 0 ? "!border-red-400" : (stock[s] ?? 0) <= 3 ? "!border-amber-400" : ""}`}
                  aria-label={`Stock for size ${s}`}
                />
              </div>
            ))}
            <div className="flex items-end gap-1 rounded-lg border border-dashed border-line p-2">
              <input
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (newSize.trim() && !sizes.includes(newSize.trim())) setSizes([...sizes, newSize.trim()]);
                    setNewSize("");
                  }
                }}
                placeholder="Add size"
                className="input px-2 py-1.5"
                aria-label="New size"
              />
              <button
                type="button"
                className="btn-ghost px-2"
                aria-label="Add size"
                onClick={() => {
                  if (newSize.trim() && !sizes.includes(newSize.trim())) setSizes([...sizes, newSize.trim()]);
                  setNewSize("");
                }}
              >
                <Icon name="plus" />
              </button>
            </div>
          </div>
          {errorText("sizes")}
          {errorText("stock")}
        </section>

        <section className="card p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em]">Photos</h2>
          <label className="label" htmlFor="images">One photo per line. Paste an https:// image link (or a catalogue id like <code>photo-…</code> / <code>px:123</code>). The first photo is the cover.</label>
          <textarea id="images" name="images" value={images} onChange={(e) => setImages(e.target.value)} rows={3} className={`input font-mono text-xs ${field("images")}`} />
          {errorText("images")}
          <div className="mt-3 flex flex-wrap gap-3">
            {imageList.map((id, i) => (
              <div key={`${id}-${i}`} className="group relative">
                <Thumb id={id} alt={`Image ${i + 1}`} className="h-36 w-28" w={300} />
                {i === 0 ? <span className="absolute left-1 top-1 rounded bg-lime px-1.5 py-0.5 text-[9px] font-bold uppercase text-black">Cover</span> : null}
                <div className="absolute inset-x-1 bottom-1 hidden justify-between group-hover:flex">
                  <button type="button" onClick={() => moveImage(i, -1)} className="rounded bg-black/70 p-1 text-white" aria-label="Move left">
                    <Icon name="chevronLeft" className="h-3 w-3" />
                  </button>
                  <button type="button" onClick={() => moveImage(i, 1)} className="rounded bg-black/70 p-1 text-white" aria-label="Move right">
                    <Icon name="chevronRight" className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        <section className="card p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em]">Visibility</h2>
          <input type="hidden" name="status" value={status} />
          <div className="grid grid-cols-2 gap-2">
            {(["active", "draft"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                aria-pressed={status === s}
                className={`rounded-md border px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${status === s ? "border-ink bg-ink text-bg" : "border-line text-muted"}`}
              >
                {s === "active" ? "Live on store" : "Hidden (draft)"}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted">{status === "active" ? "Shoppers can see and buy this product." : "Only you can see this. Publish when it's ready."}</p>
          <label className="label mt-4" htmlFor="badge">Label on product card<Hint>A small tag shown on the photo, like NEW or BESTSELLER.</Hint></label>
          <select id="badge" name="badge" defaultValue={product.badge} className="input">
            {BADGES.map((b) => (
              <option key={b} value={b}>
                {b || "— None —"}
              </option>
            ))}
          </select>
        </section>

        <section className="card p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em]">Price (₹)</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="price">Selling price<Hint>What the shopper pays, in rupees.</Hint></label>
              <input id="price" name="price" type="number" min={1} value={price || ""} onChange={(e) => setPrice(Number(e.target.value))} className={`input tabular-nums ${field("price")}`} />
              {errorText("price")}
            </div>
            <div>
              <label className="label" htmlFor="compareAt">Original price (MRP)<Hint>Optional. If higher than the selling price, the store shows it crossed out with a “% off” tag.</Hint></label>
              <input id="compareAt" name="compareAt" type="number" min={0} value={compareAt || ""} onChange={(e) => setCompareAt(Number(e.target.value))} className={`input tabular-nums ${field("compareAt")}`} />
              {errorText("compareAt")}
            </div>
          </div>
          <p className="mt-2 text-xs text-muted">{discount ? `Shows as ${discount}% off on the storefront card.` : "No discount shown."}</p>
        </section>

        <section className="card overflow-hidden">
          <div className="relative aspect-[3/4] bg-ink/5">
            {imageList[0] ? <Thumb id={imageList[0]} alt={name} className="h-full w-full !rounded-none" w={600} /> : null}
            {discount ? <span className="absolute left-3 top-3 bg-lime px-2 py-1 text-[10px] font-bold uppercase text-black">-{discount}%</span> : null}
            {status === "draft" ? <span className="absolute right-3 top-3 bg-black px-2 py-1 text-[10px] font-bold uppercase text-white">Draft</span> : null}
          </div>
          <div className="p-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Card preview</p>
            <p className="mt-1 font-display text-lg uppercase leading-tight">{name || "Product name"}</p>
            <p className="mt-1 text-sm">
              <strong>₹{(price || 0).toLocaleString("en-IN")}</strong>
              {compareAt > price ? <span className="ml-2 text-muted line-through">₹{compareAt.toLocaleString("en-IN")}</span> : null}
            </p>
          </div>
        </section>

        <div className="card sticky bottom-4 flex flex-col gap-2 p-4">
          {state.message && !state.ok ? (
            <p className="text-sm text-red-600" role="alert">
              {state.message}
            </p>
          ) : null}
          <SaveHint dirty={dirty} />
          <button type="submit" className="btn-lime w-full py-3" disabled={pending}>
            {pending ? "Saving…" : isNew ? "Create product" : "Save changes"}
          </button>
          <Link href="/products" className="btn-ghost w-full">
            Cancel
          </Link>
        </div>
      </aside>
    </form>
  );
}
