import Link from "next/link";

export function StylistTeaser() {
  return (
    <section className="border-y border-gold/35 bg-gold/10 px-4 py-20 text-ink sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-site flex-col items-start justify-between gap-8 md:flex-row md:items-end">
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-muted">AI-ready experience</p>
          <h2 className="mt-3 font-serif text-4xl text-gold-deep md:text-6xl">CHESHIRE STYLIST</h2>
          <div className="divider-gold mt-4" />
          <p className="mt-4 max-w-md text-sm text-muted">
            Tell us the moment, the mood, and the budget. We’ll build a look.
          </p>
        </div>
        <Link href="/stylist" className="btn-gold shadow-gold" data-cursor="shop">
          Start styling
        </Link>
      </div>
    </section>
  );
}
