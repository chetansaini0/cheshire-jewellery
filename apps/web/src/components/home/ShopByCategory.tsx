import Image from "next/image";
import Link from "next/link";
import { categories } from "@cheshire/config";
import { categoryMeta } from "@/lib/catalog";

export function ShopByCategory() {
  return (
    <section className="mx-auto max-w-site px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
      <div className="flex items-end justify-between gap-6">
        <h2 className="section-title">Shop by<br className="sm:hidden" /> category</h2>
        <Link href="/shop" className="link-arrow">View all</Link>
      </div>
      <div className="no-scrollbar -mx-4 mt-8 flex snap-x gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-5 md:gap-4 md:overflow-visible md:px-0">
        {categories.map((cat) => {
          const meta = categoryMeta.find((c) => c.slug === cat.slug);
          return (
            <Link key={cat.slug} href={cat.href} className="group relative block w-[42vw] shrink-0 snap-start md:w-auto">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-line">
                {meta?.imageUrl ? (
                  <Image
                    src={meta.imageUrl}
                    alt={cat.name}
                    fill
                    className="object-cover transition duration-700 ease-luxe group-hover:scale-105"
                    sizes="(max-width:768px) 42vw, 20vw"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                <p className="absolute bottom-3 left-3 font-serif text-xl uppercase text-ivory md:text-2xl">{cat.name}</p>
                <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-ivory text-ink opacity-0 transition group-hover:opacity-100">↗</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
