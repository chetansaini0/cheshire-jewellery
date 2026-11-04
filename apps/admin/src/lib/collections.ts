import { collections as catalogueCollections } from "@cheshire/database/catalog";
import { listProducts } from "./products";
import { readStore, writeStore } from "./store";

export type AdminCollection = {
  slug: string;
  name: string;
  description: string;
  featured: boolean;
  sortOrder: number;
  origin: "catalogue" | "admin";
};

type CollectionStore = { records: Record<string, AdminCollection> };

export function listCollections(): Array<AdminCollection & { productCount: number; draftCount: number }> {
  const { records } = readStore<CollectionStore>("collections", { records: {} });
  const base: AdminCollection[] = catalogueCollections.map((c, i) => ({
    slug: c.slug,
    name: c.name,
    description: c.description,
    featured: c.slug === "festive-edit",
    sortOrder: i + 1,
    origin: "catalogue",
  }));
  const merged = new Map(base.map((c) => [c.slug, records[c.slug] ?? c]));
  for (const r of Object.values(records)) if (!merged.has(r.slug)) merged.set(r.slug, r);
  const products = listProducts();
  return [...merged.values()]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => ({
      ...c,
      productCount: products.filter((p) => p.collection === c.slug).length,
      draftCount: products.filter((p) => p.collection === c.slug && p.status === "draft").length,
    }));
}

export function saveCollection(c: AdminCollection) {
  const s = readStore<CollectionStore>("collections", { records: {} });
  s.records[c.slug] = c;
  writeStore("collections", s);
}
