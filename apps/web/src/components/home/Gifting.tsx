import Link from "next/link";
import { giftCategories } from "@cheshire/config";

export function Gifting() {
  return (
    <section className="mx-auto max-w-site px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
      <h2 className="max-w-2xl font-serif text-4xl md:text-5xl lg:text-6xl">
        GIVE THEM SOMETHING THEY&apos;LL KEEP.
      </h2>
      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {giftCategories.map((g) => (
          <Link
            key={g.slug}
            href={g.href}
            className="border border-gold/40 px-5 py-8 text-center text-[12px] tracking-[0.18em] uppercase transition hover:border-gold hover:bg-gold hover:text-ink"
            data-cursor="shop"
          >
            {g.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
