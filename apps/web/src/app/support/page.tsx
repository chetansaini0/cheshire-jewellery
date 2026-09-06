const faqs = [
  {
    q: "What is your shipping policy?",
    a: "Orders over ₹999 ship free across India. Standard delivery is 3–6 business days.",
  },
  {
    q: "How do returns work?",
    a: "Unused products can be returned within 7 days in original packaging.",
  },
  {
    q: "How do I track my order?",
    a: "Open Account → Orders for live status and courier tracking.",
  },
];

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl">Support</h1>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {[
          ["WhatsApp", "https://wa.me/919876543210"],
          ["Email", "mailto:care@cheshire.com"],
          ["Live Chat", "#"],
          ["Raise a ticket", "#ticket"],
        ].map(([label, href]) => (
          <a key={label} href={href} className="border border-line px-4 py-4 text-sm">
            {label}
          </a>
        ))}
      </div>
      <h2 className="mt-12 text-sm tracking-[0.16em] uppercase">FAQ</h2>
      <div className="mt-4 divide-y divide-line border-y border-line">
        {faqs.map((f) => (
          <details key={f.q} className="py-4">
            <summary className="cursor-pointer text-sm">{f.q}</summary>
            <p className="mt-2 text-sm text-muted">{f.a}</p>
          </details>
        ))}
      </div>
      <form id="ticket" className="mt-10 space-y-3">
        <h2 className="text-sm tracking-[0.16em] uppercase">Support ticket</h2>
        <input placeholder="Subject" className="w-full border border-line bg-transparent px-3 py-3" />
        <textarea placeholder="How can we help?" rows={4} className="w-full border border-line bg-transparent px-3 py-3" />
        <button type="button" className="bg-ink px-6 py-3 text-[11px] tracking-[0.16em] uppercase text-ivory">
          Submit ticket
        </button>
      </form>
    </div>
  );
}
