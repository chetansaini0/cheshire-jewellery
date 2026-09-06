import Link from "next/link";

export function StylistTeaser() {
  return (
    <section className="border-t border-line bg-ink px-4 py-20 text-ivory sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-site flex-col items-start justify-between gap-8 md:flex-row md:items-end">
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-metal">AI-ready experience</p>
          <h2 className="mt-3 font-serif text-4xl md:text-6xl">CHESHIRE STYLIST</h2>
          <p className="mt-4 max-w-md text-sm text-ivory/70">
            Tell us the moment, the mood, and the budget. We’ll build a look.
          </p>
        </div>
        <Link
          href="/stylist"
          className="bg-ivory px-7 py-3 text-[11px] tracking-[0.18em] uppercase text-ink"
          data-cursor="shop"
        >
          Start styling
        </Link>
      </div>
    </section>
  );
}
