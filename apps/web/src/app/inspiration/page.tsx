import type { Metadata } from "next";
import { PinterestBoard } from "@/components/home/PinterestBoard";
import { ProductCard } from "@/components/product/ProductCard";
import { getBestsellers, getByMood } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Inspiration board · aesthetic jewellery looks",
  description:
    "Pinterest-style jewellery moodboard for CHESHIRE — minimal, bold, romantic, dark, and statement looks to shop.",
};

export default function InspirationPage() {
  const examples = [
    { title: "Minimal everyday", products: getByMood("MINIMAL", 4) },
    { title: "Dark & bold", products: getByMood("DARK", 4) },
    { title: "Romantic light", products: getByMood("ROMANTIC", 4) },
  ];
  const bestsellers = getBestsellers(4);

  return (
    <div>
      <div className="mx-auto max-w-site px-4 pt-12 sm:px-6 lg:px-10">
        <p className="text-[11px] tracking-[0.22em] uppercase text-muted">CHESHIRE lookbook</p>
        <h1 className="mt-3 font-serif text-5xl md:text-6xl">Inspiration</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
          A Pinterest-inspired board of how our pieces live on skin — layered chains, quiet rings,
          statement earrings, and noir metals. Tap any pin to shop the mood.
        </p>
      </div>

      <PinterestBoard
        title="THE BOARD"
        subtitle="Save the energy. Shop the pieces. Build your own look."
      />

      <div className="mx-auto max-w-site space-y-16 px-4 pb-20 sm:px-6 lg:px-10">
        {examples.map((section) => (
          <section key={section.title}>
            <h2 className="font-serif text-3xl md:text-4xl">{section.title}</h2>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {section.products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ))}

        <section>
          <h2 className="font-serif text-3xl md:text-4xl">Everyone wants these</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {bestsellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
