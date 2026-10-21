const points = [
  { n: "01", title: "Heavyweight fabric", body: "220–400 GSM cottons that hold their shape." },
  { n: "02", title: "Drops, not seasons", body: "Small batches every Friday. When it's gone, it's gone." },
  { n: "03", title: "Fit-first sizing", body: "Unisex S–XL with honest size guides." },
  { n: "04", title: "Easy returns", body: "7-day returns and free size exchanges." },
];

export function WhyCheshire() {
  return (
    <section className="mx-auto max-w-site px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
      <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {points.map((p) => (
          <div key={p.n} className="bg-ivory p-6 md:p-8">
            <p className="font-serif text-4xl text-ink/20">{p.n}</p>
            <p className="mt-4 text-sm font-bold uppercase tracking-[0.12em]">{p.title}</p>
            <p className="mt-2 text-sm text-muted">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
