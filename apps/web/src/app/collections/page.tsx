import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { collections } from "@cheshire/database/catalog";
import { catalog } from "@/lib/catalog";
import { SectionHeading } from "@cheshire/ui";

export const metadata: Metadata = {
  title: "Collections",
  description: "CHESHIRE collections: Roots Remixed, the Festive Edit and everyday staples. Fusion wear for a Gen Z India.",
  alternates: { canonical: "/collections" },
};

const FEATURED_FIRST = ["roots-remixed", "festive-edit"];

export default function CollectionsPage() {
  const rank = (slug: string) => (FEATURED_FIRST.includes(slug) ? FEATURED_FIRST.indexOf(slug) : FEATURED_FIRST.length);
  const sorted = [...collections].sort((a, b) => rank(a.slug) - rank(b.slug));
  return (
    <div className="mx-auto max-w-site px-4 py-12 sm:px-6 md:py-16 lg:px-10">
      <SectionHeading
        eyebrow="Collections"
        title={
          <>
            Stories you can <span className="italic text-gold">wear</span>
          </>
        }
        description="Each edit pairs something rooted with something everyday. Start anywhere."
      />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {sorted.map((c, i) => {
          const items = catalog.filter((p) => p.collection === c.slug);
          const cover = items[0]?.images[0];
          return (
            <Link
              key={c.slug}
              href={`/collections/${c.slug}`}
              className={`group overflow-hidden rounded-md border border-line bg-card shadow-soft transition hover:shadow-lift ${i < 2 ? "lg:col-span-2" : ""}`}
            >
              <div className={`relative overflow-hidden bg-line ${i < 2 ? "aspect-[16/10]" : "aspect-[4/5]"}`}>
                {cover ? (
                  <Image
                    src={cover.url}
                    alt={c.name}
                    fill
                    sizes="(min-width:1024px) 50vw, (min-width:640px) 50vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                ) : null}
              </div>
              <div className="flex items-end justify-between gap-4 p-5">
                <div>
                  <h2 className="font-serif text-2xl font-medium md:text-3xl">{c.name}</h2>
                  <p className="mt-1 text-sm text-muted">{c.description}</p>
                </div>
                <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{items.length} pieces</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
