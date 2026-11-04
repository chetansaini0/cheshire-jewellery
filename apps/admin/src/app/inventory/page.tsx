import Link from "next/link";
import { categories } from "@cheshire/database/catalog";
import { Thumb } from "@/components/Thumb";
import { Kpi, LiveTag, PageHeader, Pill } from "@/components/ui";
import { compactInr, num } from "@/lib/format";
import { listProducts, totalStock } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import { StockRow } from "./StockRow";

export const metadata = { title: "Inventory" };

export default async function InventoryPage({ searchParams }: { searchParams: Promise<{ filter?: string; category?: string }> }) {
  const sp = await searchParams;
  const { lowStockThreshold } = getSettings();
  const products = listProducts();
  const sizeLow = Math.max(1, Math.round(lowStockThreshold / 3));
  const rows = products
    .map((p) => ({ p, total: totalStock(p), lowSizes: Object.values(p.stockBySize).filter((n) => n <= sizeLow).length }))
    .filter((r) => !sp.category || r.p.category === sp.category)
    .filter((r) => (sp.filter === "low" ? r.total <= lowStockThreshold || r.lowSizes > 0 : sp.filter === "out" ? r.total === 0 : true))
    .sort((a, b) => a.total - b.total);
  const units = products.reduce((s, p) => s + totalStock(p), 0);
  const value = products.reduce((s, p) => s + totalStock(p) * p.price, 0);
  const tab = (f?: string) => `/inventory?${new URLSearchParams({ ...(f ? { filter: f } : {}), ...(sp.category ? { category: sp.category } : {}) })}`;

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Inventory"
        subtitle={`Stock by size. Sizes at ≤${sizeLow} units are flagged; products at ≤${lowStockThreshold} total are low (change in Settings). Edit counts inline and save per row.`}
        actions={<LiveTag />}
      />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Units on hand" value={num(units)} tag={<LiveTag />} />
        <Kpi label="Stock value" value={compactInr(value)} hint="at selling price" tag={<LiveTag />} />
        <Kpi label="Low stock" value={num(products.filter((p) => totalStock(p) <= lowStockThreshold && totalStock(p) > 0).length)} tone="warn" href="/inventory?filter=low" />
        <Kpi label="Sold out" value={num(products.filter((p) => totalStock(p) === 0).length)} href="/inventory?filter=out" />
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {[
          { f: undefined, label: "All" },
          { f: "low", label: "Low / size gaps" },
          { f: "out", label: "Sold out" },
        ].map((t) => (
          <Link key={t.label} href={tab(t.f)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${sp.filter === t.f ? "border-ink bg-ink text-bg" : "border-line bg-surface text-muted hover:text-ink"}`}>
            {t.label}
          </Link>
        ))}
        <form action="/inventory" className="ml-auto">
          {sp.filter ? <input type="hidden" name="filter" value={sp.filter} /> : null}
          <select name="category" defaultValue={sp.category ?? ""} className="input w-44" aria-label="Category">
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <button className="btn-ghost ml-2">Apply</button>
        </form>
      </div>
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-line">
            <tr>
              <th className="th">Product</th>
              <th className="th">Stock by size</th>
              <th className="th text-right">Total</th>
              <th className="th">Health</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map(({ p, total, lowSizes }) => (
              <tr key={p.sku} className="hover:bg-ink/[0.03]">
                <td className="td">
                  <Link href={`/products/${p.sku}`} className="flex items-center gap-3">
                    <Thumb id={p.images[0]} alt={p.name} className="h-12 w-10" w={80} />
                    <span>
                      <span className="block max-w-[240px] truncate font-semibold hover:underline">{p.name}</span>
                      <span className="block font-mono text-[11px] text-muted">
                        {p.sku}
                        {!p.edited ? " · split from catalogue total" : ""}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="td">
                  <StockRow sku={p.sku} sizes={p.sizes} stock={p.stockBySize} lowAt={sizeLow} />
                </td>
                <td className="td text-right font-semibold tabular-nums">{total}</td>
                <td className="td">
                  {total === 0 ? <Pill tone="red">sold out</Pill> : total <= lowStockThreshold ? <Pill tone="amber">low</Pill> : lowSizes ? <Pill tone="amber">{lowSizes} size gap(s)</Pill> : <Pill tone="green">healthy</Pill>}
                </td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center">
                  <p className="font-display text-xl uppercase tracking-wide">Nothing here</p>
                  <p className="mt-1 text-sm text-muted">
                    No products match this view. Everything may be well stocked. <Link href="/inventory" className="font-semibold text-ink underline underline-offset-2">Clear filters</Link>
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
