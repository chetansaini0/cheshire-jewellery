import Link from "next/link";
import { categories } from "@cheshire/database/catalog";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/ui";
import { listCollections } from "@/lib/collections";
import { listProducts, nextSku, type AdminProduct } from "@/lib/products";
import { ProductForm } from "../ProductForm";

export const metadata = { title: "New product" };

export default function NewProductPage() {
  const all = listProducts();
  const suggested = Object.fromEntries(categories.map((c) => [c.slug, nextSku(c.slug, all)]));
  const blank: AdminProduct = {
    sku: suggested["lehengas"],
    name: "",
    slug: "",
    description: "",
    category: "lehengas",
    collection: "festive-edit",
    fabric: "",
    colour: "",
    colours: [],
    sizes: ["S", "M", "L", "XL", "XXL"],
    stockBySize: { S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
    price: 0,
    compareAt: 0,
    images: [],
    status: "draft",
    badge: "NEW",
    origin: "admin",
    edited: false,
  };
  return (
    <div>
      <Link href="/products" className="mb-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted hover:text-ink">
        <Icon name="chevronLeft" className="h-3.5 w-3.5" /> Products
      </Link>
      <PageHeader eyebrow="Catalogue" title="New product" subtitle="Saved as a draft by default. New products live in the local admin store until a database is connected." />
      <ProductForm
        product={blank}
        isNew
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        collections={listCollections().map((c) => ({ slug: c.slug, name: c.name }))}
        suggestedSku={suggested}
      />
    </div>
  );
}
