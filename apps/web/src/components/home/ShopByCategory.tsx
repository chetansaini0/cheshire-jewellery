import Image from "next/image";
import Link from "next/link";
import { categories, categoryGroups } from "@cheshire/config";
import { productImage } from "@cheshire/database/catalog";
import { SectionHeading } from "@cheshire/ui";

const groupArt: Record<string, { image: string; href: string }> = {
  ethnic: { image: "px:29585830", href: "/shop/sarees" },
  casual: { image: "photo-1556821840-3a63f95609a7", href: "/shop/hoodies" },
  accessories: { image: "photo-1521369909029-2afed882baee", href: "/shop/accessories" },
};

export function ShopByCategory() {
  return (
    <section className="mx-auto max-w-site px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
      <SectionHeading eyebrow="Shop by category" title="Ethnic, casual, and everything between" align="center" className="max-w-2xl" />
      <div className="mt-12 grid gap-4 md:grid-cols-3 md:gap-5">
        {categoryGroups.map((g) => {
          const art = groupArt[g.slug];
          const subs = categories.filter((c) => c.group === g.slug);
          return (
            <div key={g.slug} className="group">
              <Link href={art.href} className="relative block aspect-[4/5] overflow-hidden rounded-md bg-card">
                <Image
                  src={productImage(art.image, 900)}
                  alt={g.name}
                  fill
                  sizes="(max-width:768px) 100vw, 33vw"
                  className="object-cover transition duration-[1200ms] ease-luxe group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/0 to-transparent" />
                <div className="absolute inset-x-5 bottom-5 text-ivory">
                  <p className="font-serif text-4xl font-medium">{g.name}</p>
                  <p className="mt-1 text-sm text-ivory/80">{g.description}</p>
                </div>
              </Link>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                {subs.map((c) => (
                  <Link key={c.slug} href={c.href} className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted transition hover:text-gold">
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
