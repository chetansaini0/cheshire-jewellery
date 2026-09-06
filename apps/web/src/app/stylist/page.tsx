"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { stylistRecommend } from "@/lib/catalog";

const occasions = ["EVERYDAY", "DATE_NIGHT", "PARTY", "OFFICE", "WEDDING", "GIFT"] as const;
const styles = ["MINIMAL", "BOLD", "CLASSIC", "ROMANTIC", "EDGY"] as const;
const budgets = [
  { id: "UNDER_999", label: "UNDER ₹999" },
  { id: "999_1999", label: "₹999–₹1999" },
  { id: "1999_4999", label: "₹1999–₹4999" },
  { id: "5000_PLUS", label: "₹5000+" },
] as const;

export default function StylistPage() {
  const [step, setStep] = useState(0);
  const [occasion, setOccasion] = useState<(typeof occasions)[number]>("EVERYDAY");
  const [style, setStyle] = useState<(typeof styles)[number]>("MINIMAL");
  const [budget, setBudget] = useState<(typeof budgets)[number]["id"]>("999_1999");

  const result = useMemo(() => {
    if (step < 3) return null;
    return stylistRecommend({ occasion, style, budget });
  }, [step, occasion, style, budget]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="text-[11px] tracking-[0.22em] uppercase text-muted">CHESHIRE STYLIST</p>
      <h1 className="mt-3 font-serif text-5xl md:text-6xl">Find your look.</h1>
      <p className="mt-4 text-sm text-muted">
        Rule-based recommendations today. Swap in a live AI model later — same contract.
      </p>

      {step === 0 && (
        <Section title="What are you shopping for?">
          <ChipGrid options={[...occasions]} value={occasion} onChange={setOccasion} />
          <Next onClick={() => setStep(1)} />
        </Section>
      )}
      {step === 1 && (
        <Section title="What’s your style?">
          <ChipGrid options={[...styles]} value={style} onChange={setStyle} />
          <Next onClick={() => setStep(2)} />
        </Section>
      )}
      {step === 2 && (
        <Section title="What’s your budget?">
          <div className="mt-6 flex flex-wrap gap-2">
            {budgets.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBudget(b.id)}
                className={`border px-4 py-3 text-[11px] tracking-[0.14em] uppercase ${
                  budget === b.id ? "border-ink bg-ink text-ivory" : "border-line"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
          <Next label="Generate look" onClick={() => setStep(3)} />
        </Section>
      )}
      {step === 3 && result && (
        <div className="mt-10">
          <h2 className="font-serif text-3xl">{result.lookName}</h2>
          <p className="mt-3 text-sm text-muted">{result.rationale}</p>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
            {result.products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <button type="button" className="mt-8 underline" onClick={() => setStep(0)}>
            Start over
          </button>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-10">
      <h2 className="text-sm tracking-[0.16em] uppercase">{title}</h2>
      {children}
    </div>
  );
}

function ChipGrid<T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`border px-4 py-3 text-[11px] tracking-[0.14em] uppercase ${
            value === o ? "border-ink bg-ink text-ivory" : "border-line"
          }`}
        >
          {o.replace(/_/g, " ")}
        </button>
      ))}
    </div>
  );
}

function Next({ onClick, label = "Next" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-8 bg-ink px-6 py-3 text-[11px] tracking-[0.16em] uppercase text-ivory"
    >
      {label}
    </button>
  );
}
