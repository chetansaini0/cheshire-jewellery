import { brand } from "@cheshire/config";
import { BrandLogo } from "@/components/brand/BrandLogo";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-[11px] tracking-[0.22em] uppercase text-muted">About</p>
      <div className="mt-6">
        <BrandLogo variant="full" linked={false} />
      </div>
      <h1 className="mt-8 font-serif text-5xl uppercase md:text-7xl">Made to be lived in.</h1>
      <div className="divider-gold mt-4" />
      <p className="mt-6 text-lg leading-relaxed text-gold-deep">{brand.tagline}</p>
      <p className="mt-4 text-sm leading-relaxed text-muted">{brand.philosophy}</p>
      <p className="mt-6 text-sm leading-relaxed text-muted">
        CHESHIRE is a clothing label for people who get dressed on purpose. Heavyweight tees, baggy denim,
        track sets and sharp outerwear — designed in India, released in small weekly drops.
      </p>
      <p className="mt-6 text-sm leading-relaxed text-muted">
        Most of what we sell is made for us. A few partner labels are stocked alongside, always clearly marked.
        We do not claim to manufacture every item in the edit.
      </p>
    </div>
  );
}
