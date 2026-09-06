"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { CategorySlug, Mood, SortOption } from "@cheshire/types";
import { getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";

const categoryTabs = ["all", "rings", "necklaces", "earrings", "bracelets", "anklets", "sets"] as const;
const sorts: { value: SortOption; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "bestselling", label: "Bestselling" },
  { value: "top_rated", label: "Top Rated" },
  { value: "price_asc", label: "Price Low → High" },
  { value: "price_desc", label: "Price High → Low" },
];

export function ShopClient({
  initialCategory,
}: {
  initialCategory?: CategorySlug | "all";
}) {
  const params = useSearchParams();
  const [mobileFilters, setMobileFilters] = useState(false);
  const [priceMax, setPriceMax] = useState<number | undefined>();
  const [materials, setMaterials] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>((params.get("sort") as SortOption) || "recommended");
  const category = (initialCategory || params.get("category") || "all") as CategorySlug | "all";
  const mood = params.get("mood")?.toUpperCase() as Mood | undefined;
  const q = params.get("q") || undefined;

  const result = useMemo(
    () =>
      getProducts({
        category,
        sort,
        q,
        priceMax,
        material: materials,
        style: mood ? [mood] : undefined,
        pageSize: 32,
      }),
    [category, sort, q, priceMax, materials, mood]
  );

  return (
    <div className="mx-auto max-w-site px-4 py-10 sm:px-6 lg:px-10">
      <div className="flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-muted">Catalogue</p>
          <h1 className="mt-2 font-serif text-4xl md:text-6xl">Shop</h1>
        </div>
        <p className="text-sm text-muted">{result.total} pieces</p>
      </div>

      <div className="mt-6 flex gap-3 overflow-x-auto no-scrollbar">
        {categoryTabs.map((c) => (
          <a
            key={c}
            href={c === "all" ? "/shop" : `/shop/${c}`}
            className={`whitespace-nowrap border px-4 py-2 text-[11px] tracking-[0.16em] uppercase ${
              category === c ? "border-ink bg-ink text-ivory" : "border-line"
            }`}
          >
            {c}
          </a>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <Filters
            priceMax={priceMax}
            setPriceMax={setPriceMax}
            materials={materials}
            setMaterials={setMaterials}
            sort={sort}
            setSort={setSort}
          />
        </aside>

        <div>
          <div className="mb-6 flex items-center justify-between lg:justify-end">
            <button
              type="button"
              className="border border-ink px-4 py-2 text-[11px] tracking-[0.16em] uppercase lg:hidden"
              onClick={() => setMobileFilters(true)}
            >
              Filters
            </button>
            <label className="hidden items-center gap-2 text-sm lg:flex">
              Sort
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="border border-line bg-ivory px-3 py-2"
              >
                {sorts.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5">
            {result.data.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>

      {mobileFilters ? (
        <div className="fixed inset-0 z-50 flex items-end bg-ink/40 lg:hidden">
          <div className="max-h-[85vh] w-full overflow-y-auto bg-ivory p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm tracking-[0.16em] uppercase">Filters</p>
              <button type="button" onClick={() => setMobileFilters(false)}>
                Close
              </button>
            </div>
            <Filters
              priceMax={priceMax}
              setPriceMax={setPriceMax}
              materials={materials}
              setMaterials={setMaterials}
              sort={sort}
              setSort={setSort}
            />
            <button
              type="button"
              className="mt-6 w-full bg-ink py-3 text-[11px] tracking-[0.16em] uppercase text-ivory"
              onClick={() => setMobileFilters(false)}
            >
              Show {result.total} results
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Filters({
  priceMax,
  setPriceMax,
  materials,
  setMaterials,
  sort,
  setSort,
}: {
  priceMax?: number;
  setPriceMax: (n?: number) => void;
  materials: string[];
  setMaterials: (m: string[]) => void;
  sort: SortOption;
  setSort: (s: SortOption) => void;
}) {
  const materialOptions = ["Sterling Silver", "Black", "Brass", "Steel"];
  return (
    <div className="space-y-8">
      <div className="lg:hidden">
        <p className="text-[11px] tracking-[0.16em] uppercase">Sort</p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="mt-2 w-full border border-line bg-ivory px-3 py-2"
        >
          {sorts.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <p className="text-[11px] tracking-[0.16em] uppercase">Price</p>
        <div className="mt-3 space-y-2 text-sm">
          {[
            { label: "All", value: undefined },
            { label: "Under ₹999", value: 999 },
            { label: "Under ₹1999", value: 1999 },
            { label: "Under ₹4999", value: 4999 },
          ].map((o) => (
            <label key={o.label} className="flex items-center gap-2">
              <input
                type="radio"
                name="price"
                checked={priceMax === o.value}
                onChange={() => setPriceMax(o.value)}
              />
              {o.label}
            </label>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[11px] tracking-[0.16em] uppercase">Material</p>
        <div className="mt-3 space-y-2 text-sm">
          {materialOptions.map((m) => {
            const checked = materials.includes(m);
            return (
              <label key={m} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    setMaterials(
                      checked ? materials.filter((x) => x !== m) : [...materials, m]
                    )
                  }
                />
                {m}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
