const benefits = [
  { n: "01", t: "DESIGNED TO STAND OUT" },
  { n: "02", t: "PREMIUM FINISH" },
  { n: "03", t: "EVERYDAY LUXURY" },
  { n: "04", t: "MADE FOR YOUR STYLE" },
];

export function WhyCheshire() {
  return (
    <section className="mx-auto max-w-site px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
      <h2 className="font-serif text-4xl md:text-5xl">Why CHESHIRE</h2>
      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {benefits.map((b) => (
          <div key={b.n} className="border-t border-ink pt-6">
            <p className="text-[11px] tracking-[0.2em] text-muted">{b.n}</p>
            <p className="mt-4 font-serif text-2xl leading-tight md:text-3xl">{b.t}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
