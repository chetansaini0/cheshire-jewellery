"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CategoryGroupSlug, Product } from "@cheshire/types";
import { categoryGroups } from "@cheshire/config";
import { ProductCard } from "./ProductCard";

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
] as const;

/** Editorial listing used by /new-in, /women and /men: group chips (Ethnic / Casual / Accessories) + sort. */
export function ProductListing({
  eyebrow,
  title,
  intro,
  products,
  related,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro: string;
  products: Product[];
  related?: Array<{ label: string; href: string }>;
}) {
  const [group, setGroup] = useState<CategoryGroupSlug | "all">("all");
  const [sort, setSort] = useState<(typeof SORTS)[number]["value"]>("featured");
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: products.length };
    for (const p of products) c[p.group ?? "casual"] = (c[p.group ?? "casual"] ?? 0) + 1;
    return c;
  }, [products]);
  const shown = useMemo(() => {
    const list = group === "all" ? products : products.filter((p) => p.group === group);
    if (sort === "price_asc") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") return [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, group, sort]);

  const chips: Array<{ slug: CategoryGroupSlug | "all"; name: string }> = [{ slug: "all", name: "All" }, ...categoryGroups];

  return (
    <div className="mx-auto max-w-site px-4 pb-10 sm:px-6 lg:px-10">
      <header className="border-b border-line py-12 text-center md:py-16">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 font-serif text-5xl font-medium leading-none md:text-7xl">{title}</h1>
        <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-muted">{intro}</p>
        {related?.length ? (
          <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2">
            {related.map((r) => (
              <Link key={r.href} href={r.href} className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted transition hover:text-gold">
                {r.label}
              </Link>
            ))}
          </div>
        ) : null}
      </header>

      <div className="sticky top-16 z-20 -mx-4 flex items-center justify-between gap-4 border-b border-line bg-ivory/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-[76px] lg:-mx-10 lg:px-10">
        <div className="no-scrollbar flex gap-2 overflow-x-auto" role="tablist" aria-label="Filter by category group">
          {chips
            .filter((c) => c.slug === "all" || counts[c.slug])
            .map((c) => (
              <button
                key={c.slug}
                type="button"
                role="tab"
                aria-selected={group === c.slug}
                onClick={() => setGroup(c.slug)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
                  group === c.slug ? "border-ink bg-ink text-ivory" : "border-line bg-card text-muted hover:border-ink hover:text-ink"
                }`}
              >
                {c.name} <span className="opacity-60">{counts[c.slug] ?? 0}</span>
              </button>
            ))}
        </div>
        <label className="flex shrink-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          <span className="hidden sm:inline">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-sm border border-line bg-card px-2 py-1.5 text-[11px] font-semibold normal-case tracking-normal text-ink outline-none focus:border-gold"
            aria-label="Sort products"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {shown.length ? (
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4">
          {shown.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="py-24 text-center text-muted">Nothing here yet. Try another category.</p>
      )}
    </div>
  );
}
