"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Icon } from "@/components/Icon";
import { Thumb } from "@/components/Thumb";
import { Pill } from "@/components/ui";
import { duplicateProductAction, setProductStatusAction, type FormState } from "@/lib/actions";
import { useConfirm, useToast } from "@/components/feedback";

export type ProductRow = {
  sku: string;
  name: string;
  category: string;
  collection: string;
  fabric: string;
  colour: string;
  sizes: string[];
  stockBySize: Record<string, number>;
  stock: number;
  price: number;
  compareAt: number;
  image?: string;
  status: "active" | "draft";
  origin: "catalogue" | "admin";
  edited: boolean;
};

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

type SortKey = "name" | "price" | "stock" | "sku";

export function ProductTable({
  rows,
  categories,
  fabrics,
  sizes,
  lowStockThreshold,
  initialCategory,
  initialQuery,
}: {
  rows: ProductRow[];
  categories: Array<{ slug: string; name: string; count: number }>;
  fabrics: string[];
  sizes: string[];
  lowStockThreshold: number;
  initialCategory: string;
  initialQuery: string;
}) {
  const [q, setQ] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [fabric, setFabric] = useState("");
  const [size, setSize] = useState("");
  const [status, setStatus] = useState("");
  const [stock, setStock] = useState("");
  const [sort, setSort] = useState<{ key: SortKey | null; dir: 1 | -1 }>({ key: null, dir: 1 });
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const fabricNeedle = fabric.toLowerCase();
    return rows
      .filter((r) => !category || r.category === category)
      .filter((r) => !fabric || r.fabric.toLowerCase().includes(fabricNeedle))
      .filter((r) => !size || r.sizes.includes(size))
      .filter((r) => !status || r.status === status)
      .filter((r) => (stock === "low" ? r.stock > 0 && r.stock <= lowStockThreshold : stock === "out" ? r.stock === 0 : true))
      .filter((r) => !needle || `${r.sku} ${r.name} ${r.fabric} ${r.colour} ${r.collection}`.toLowerCase().includes(needle))
      .sort((a, b) => {
        if (!sort.key) return 0;
        const av = a[sort.key];
        const bv = b[sort.key];
        return (typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv))) * sort.dir;
      });
  }, [rows, q, category, fabric, size, status, stock, sort, lowStockThreshold]);

  const fabricGroups = useMemo(() => {
    const keys = ["Cotton", "Silk", "Georgette", "Chiffon", "Chanderi", "Banarasi", "Denim", "Linen", "Fleece", "Wool", "Leather", "Satin", "Crepe", "Velvet", "Organza", "Nylon", "Polyester", "Terry", "Viscose", "Modal", "Muslin", "Net", "Canvas"];
    const present = keys.filter((k) => fabrics.some((f) => f.toLowerCase().includes(k.toLowerCase())));
    return present.length ? present : fabrics;
  }, [fabrics]);

  const sortBy = (key: SortKey) => setSort((s) => (s.key === key && s.dir === -1 ? { key: null, dir: 1 } : { key, dir: s.key === key ? -1 : 1 }));
  const arrow = (key: SortKey) => (sort.key === key ? (sort.dir === 1 ? " ↑" : " ↓") : "");
  const reset = () => {
    setQ("");
    setCategory("");
    setFabric("");
    setSize("");
    setStatus("");
    setStock("");
  };
  const toast = useToast();
  const confirm = useConfirm();
  const act = (sku: string, fn: () => Promise<FormState>) => {
    setBusy(sku);
    start(async () => {
      const r = await fn();
      if (r?.message) toast(r.message, r.ok ? "success" : "error");
      setBusy(null);
    });
  };

  return (
    <div>
      <div className="no-scrollbar -mx-1 mb-4 flex gap-2 overflow-x-auto px-1">
        <button type="button" onClick={() => setCategory("")} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${!category ? "border-ink bg-ink text-bg" : "border-line bg-surface text-muted hover:text-ink"}`}>
          All <span className="opacity-60">{rows.length}</span>
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setCategory(c.slug === category ? "" : c.slug)}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${category === c.slug ? "border-ink bg-ink text-bg" : "border-line bg-surface text-muted hover:text-ink"}`}
          >
            {c.name} <span className="opacity-60">{c.count}</span>
          </button>
        ))}
      </div>

      <div className="card mb-4 grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
        <div className="relative">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, SKU, fabric, colour…" className="input pl-9" aria-label="Search products" />
        </div>
        <select value={fabric} onChange={(e) => setFabric(e.target.value)} className="input" aria-label="Fabric">
          <option value="">All fabrics</option>
          {fabricGroups.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <select value={size} onChange={(e) => setSize(e.target.value)} className="input" aria-label="Size">
          <option value="">All sizes</option>
          {sizes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input" aria-label="Status">
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
        </select>
        <select value={stock} onChange={(e) => setStock(e.target.value)} className="input" aria-label="Stock">
          <option value="">Any stock</option>
          <option value="low">Low (≤{lowStockThreshold})</option>
          <option value="out">Sold out</option>
        </select>
        <button type="button" onClick={reset} className="btn-ghost">
          Reset
        </button>
      </div>

      <p className="mb-2 text-xs text-muted">
        Showing {filtered.length} of {rows.length}
        {pending ? " · saving…" : ""}
      </p>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-line">
            <tr>
              <th className="th">Product</th>
              <th className="th cursor-pointer select-none" onClick={() => sortBy("sku")}>
                SKU{arrow("sku")}
              </th>
              <th className="th">Fabric · Colour</th>
              <th className="th">Sizes · stock</th>
              <th className="th cursor-pointer select-none text-right" onClick={() => sortBy("price")}>
                Price{arrow("price")}
              </th>
              <th className="th cursor-pointer select-none text-right" onClick={() => sortBy("stock")}>
                Stock{arrow("stock")}
              </th>
              <th className="th">Status</th>
              <th className="th text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((r) => (
              <tr key={r.sku} className={`hover:bg-ink/[0.03] ${busy === r.sku ? "opacity-50" : ""}`}>
                <td className="td">
                  <Link href={`/products/${r.sku}`} className="flex items-center gap-3">
                    <Thumb id={r.image} alt={r.name} className="h-14 w-11" w={120} />
                    <span className="min-w-0">
                      <span className="block max-w-[260px] truncate font-semibold hover:underline">{r.name}</span>
                      <span className="block text-xs capitalize text-muted">
                        {r.category}
                        {r.collection ? ` · ${r.collection.replace(/-/g, " ")}` : ""}
                        {r.origin === "admin" ? " · new" : r.edited ? " · edited" : ""}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="td whitespace-nowrap font-mono text-xs">{r.sku}</td>
                <td className="td text-xs">
                  {r.fabric}
                  <div className="text-muted">{r.colour}</div>
                </td>
                <td className="td">
                  <div className="flex flex-wrap gap-1">
                    {r.sizes.map((s) => {
                      const n = r.stockBySize[s] ?? 0;
                      return (
                        <span
                          key={s}
                          title={`${s}: ${n} in stock`}
                          className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                            n === 0 ? "border-red-500/40 text-red-600 line-through dark:text-red-400" : n <= 3 ? "border-amber-500/50 text-amber-700 dark:text-amber-300" : "border-line text-muted"
                          }`}
                        >
                          {s} {n}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="td text-right tabular-nums">
                  <span className="font-semibold">{inr(r.price)}</span>
                  {r.compareAt > r.price ? <div className="text-xs text-muted line-through">{inr(r.compareAt)}</div> : null}
                </td>
                <td className="td text-right tabular-nums">
                  <span className={r.stock === 0 ? "font-semibold text-red-600" : r.stock <= lowStockThreshold ? "font-semibold text-amber-600" : ""}>{r.stock}</span>
                </td>
                <td className="td">
                  <Pill tone={r.status === "active" ? (r.stock === 0 ? "red" : "green") : "gray"}>{r.status === "active" ? (r.stock === 0 ? "sold out" : "active") : "draft"}</Pill>
                </td>
                <td className="td">
                  <div className="flex justify-end gap-1">
                    <Link href={`/products/${r.sku}`} className="btn-ghost px-2" title="Edit" aria-label={`Edit ${r.name}`}>
                      <Icon name="edit" />
                    </Link>
                    <button type="button" className="btn-ghost px-2" title="Duplicate as draft" aria-label={`Duplicate ${r.name}`} onClick={() => act(r.sku, () => duplicateProductAction(r.sku))}>
                      <Icon name="copy" />
                    </button>
                    <button
                      type="button"
                      className="btn-ghost px-2"
                      title={r.status === "active" ? "Hide from store (move to draft)" : "Publish to store"}
                      aria-label={r.status === "active" ? `Unpublish ${r.name}` : `Publish ${r.name}`}
                      onClick={async () => {
                        if (
                          r.status === "active" &&
                          !(await confirm({
                            title: "Hide this product?",
                            body: <>“{r.name}” will be moved to Draft and hidden from shoppers until you publish it again.</>,
                            confirmLabel: "Hide product",
                            tone: "danger",
                          }))
                        )
                          return;
                        act(r.sku, () => setProductStatusAction(r.sku, r.status === "active" ? "draft" : "active"));
                      }}
                    >
                      <Icon name={r.status === "active" ? "eyeOff" : "eye"} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <p className="font-display text-xl uppercase tracking-wide">No products found</p>
                  <p className="mt-1 text-sm text-muted">
                    Nothing matches these filters.{" "}
                    <button type="button" onClick={reset} className="font-semibold text-ink underline underline-offset-2">
                      Clear filters
                    </button>
                  </p>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
