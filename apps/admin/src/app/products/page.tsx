import Link from "next/link";
import { categories } from "@cheshire/database/catalog";
import { categoryGroup } from "@cheshire/config";
import { Icon } from "@/components/Icon";
import { LiveTag, PageHeader } from "@/components/ui";
import { ProductTable, type ProductRow } from "./ProductTable";
import { fabricOptions, listProducts, sizeOptions, totalStock } from "@/lib/products";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Products" };

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string }> }) {
  const sp = await searchParams;
  const products = listProducts();
  const settings = getSettings();
  const rows: ProductRow[] = products.map((p) => ({
    sku: p.sku,
    name: p.name,
    category: p.category,
    collection: p.collection,
    fabric: p.fabric,
    colour: p.colour,
    sizes: p.sizes,
    stockBySize: p.stockBySize,
    stock: totalStock(p),
    price: p.price,
    compareAt: p.compareAt,
    image: p.images[0],
    status: p.status,
    origin: p.origin,
    edited: p.edited,
  }));
  const counts = Object.fromEntries(categories.map((c) => [c.slug, products.filter((p) => p.category === c.slug).length]));
  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Products"
        subtitle={
          <>
            {products.length} products across {categories.length} categories. Edits are saved to the local admin store (
            <code>.data/admin/products.json</code>) and layered over the committed catalogue.
          </>
        }
        actions={
          <>
            <LiveTag />
            <Link href="/products/new" className="btn-gold">
              <Icon name="plus" /> Add product
            </Link>
          </>
        }
      />
      <ProductTable
        rows={rows}
        categories={categories.map((c) => ({ slug: c.slug, name: c.name, count: counts[c.slug] ?? 0, group: categoryGroup(c.slug) }))}
        fabrics={fabricOptions(products)}
        sizes={sizeOptions(products)}
        lowStockThreshold={settings.lowStockThreshold}
        initialCategory={sp.category ?? ""}
        initialQuery={sp.q ?? ""}
      />
    </div>
  );
}
