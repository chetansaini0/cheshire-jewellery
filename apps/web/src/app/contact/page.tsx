import { brand } from "@cheshire/config";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="text-[11px] tracking-[0.22em] uppercase text-muted">Contact</p>
      <h1 className="mt-3 font-serif text-4xl">Care</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Orders, returns, and the edit: {brand.supportEmail}
      </p>
      <p className="mt-3 text-sm text-muted">Label & supplier applications: use Partners. We reply after review.</p>
    </div>
  );
}
