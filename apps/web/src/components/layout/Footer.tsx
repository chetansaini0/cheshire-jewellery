import Link from "next/link";
import { brand, categories } from "@cheshire/config";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "New In", href: "/shop?sort=newest" },
      { label: "Bestsellers", href: "/shop?sort=bestselling" },
      ...categories.slice(0, 5).map((c) => ({ label: c.name.charAt(0) + c.name.slice(1).toLowerCase(), href: c.href })),
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Stores", href: "/stores" },
      { label: "Journal", href: "/journal" },
      { label: "Lookbook", href: "/inspiration" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Support", href: "/support" },
      { label: "Shipping", href: "/policies/shipping" },
      { label: "Returns", href: "/policies/returns" },
      { label: "Track Order", href: "/account/orders" },
      { label: "Partners", href: "/partners" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/policies/privacy" },
      { label: "Terms", href: "/policies/terms" },
      { label: "Refunds", href: "/policies/refunds" },
      { label: "Affiliate", href: "/policies/affiliate-disclosure" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-ivory">
      <div className="mx-auto grid max-w-site gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_2fr] lg:px-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold">{brand.tagline}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ivory/60">{brand.philosophy}</p>
          <p className="mt-6 text-xs uppercase tracking-[0.16em] text-ivory/80">{brand.supportEmail}</p>
          <div className="mt-6 flex gap-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-ivory/70">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-gold">Instagram</a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-gold">YouTube</a>
            <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-gold">X</a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory/50">{col.title}</p>
              <ul className="mt-4 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="text-sm text-ivory/80 transition hover:text-gold">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="overflow-hidden px-4 sm:px-6 lg:px-10">
        <p className="select-none text-center font-serif text-[24vw] uppercase leading-[0.8] text-ivory/[0.06]" aria-hidden>
          Cheshire
        </p>
      </div>
      <div className="border-t border-ivory/10">
        <div className="mx-auto flex max-w-site flex-col gap-2 px-4 py-6 text-xs text-ivory/50 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <p>© {new Date().getFullYear()} CHESHIRE Clothing. All rights reserved.</p>
          <p className="uppercase tracking-[0.14em] text-gold">Wear the moment.</p>
        </div>
      </div>
    </footer>
  );
}
