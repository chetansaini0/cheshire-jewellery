import { brand } from "@cheshire/config";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-[11px] tracking-[0.22em] uppercase text-muted">About</p>
      <h1 className="mt-3 font-serif text-5xl md:text-6xl">CHESHIRE</h1>
      <p className="mt-6 text-lg leading-relaxed">{brand.tagline}</p>
      <p className="mt-6 text-sm leading-relaxed text-muted">
        Contemporary aesthetic jewellery for people who treat jewellery as part of their identity.
        Premium. Mysterious. Elegant. Artistic. Modern. Confident. Minimal. Fashion-forward.
        Gen-Z friendly. Slightly rebellious.
      </p>
      <p className="mt-6 text-sm leading-relaxed text-muted">
        CHESHIRE feels more like a premium fashion label than a traditional jewellery store —
        desire, style, quality, trust, personality, and a premium experience in every click.
      </p>
    </div>
  );
}
