import Link from "next/link";
import { LiveTag, PageHeader, Pill } from "@/components/ui";
import { listCollections } from "@/lib/collections";
import { listProducts } from "@/lib/products";
import { Thumb } from "@/components/Thumb";
import { CollectionForm } from "./CollectionForm";

export const metadata = { title: "Collections" };

export default async function CollectionsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const cols = listCollections();
  const products = listProducts();
  const editing = cols.find((c) => c.slug === edit);
  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Collections"
        subtitle="Curated edits shown on the storefront at /collections/<slug>. Assign products from the product editor. Admin edits are saved locally; the storefront still reads the committed list."
        actions={<LiveTag />}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-4 sm:grid-cols-2">
          {cols.map((c) => {
            const items = products.filter((p) => p.collection === c.slug).slice(0, 4);
            return (
              <article key={c.slug} className={`card overflow-hidden ${edit === c.slug ? "ring-2 ring-ink" : ""}`}>
                <div className="grid grid-cols-4 gap-0.5 bg-line">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Thumb key={i} id={items[i]?.images[0]} alt="" className="aspect-[3/4] h-auto w-full !rounded-none" w={160} />
                  ))}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl uppercase tracking-wide">{c.name}</h2>
                    {c.featured ? <Pill tone="lime">featured</Pill> : null}
                    {c.origin === "admin" ? <Pill tone="blue">new</Pill> : null}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{c.description || "—"}</p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-muted">
                      {c.productCount} products{c.draftCount ? ` · ${c.draftCount} draft` : ""} · /{c.slug}
                    </span>
                    <span className="flex gap-3">
                      <Link href={`/products?q=${encodeURIComponent(c.slug)}`} className="font-semibold hover:underline">
                        Products
                      </Link>
                      <Link href={`/collections?edit=${c.slug}`} className="font-semibold text-lime-ink hover:underline">
                        Edit
                      </Link>
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <aside className="xl:sticky xl:top-24 xl:self-start">
          <CollectionForm key={editing?.slug ?? "new"} collection={editing} />
        </aside>
      </div>
    </div>
  );
}
