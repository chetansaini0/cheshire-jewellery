import Link from "next/link";
import { moods } from "@cheshire/config";

export function ShopByMood() {
  return (
    <section className="border-y border-line bg-[#f3f0ea] py-20 lg:py-28">
      <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-10">
        <p className="text-[11px] tracking-[0.22em] uppercase text-muted">Original to CHESHIRE</p>
        <h2 className="mt-3 font-serif text-4xl md:text-6xl">Shop by mood</h2>
        <div className="mt-12 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
          {moods.map((mood) => (
            <Link
              key={mood.slug}
              href={`/shop?mood=${mood.slug}`}
              className="group bg-ivory p-8 transition hover:bg-gold hover:text-ink"
              data-cursor="view"
            >
              <p className="font-serif text-3xl tracking-wide">{mood.name}</p>
              <p className="mt-3 text-sm text-muted transition group-hover:text-ink/70">
                {mood.copy}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
