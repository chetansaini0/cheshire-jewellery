import Link from "next/link";
import { brand, categories } from "@cheshire/config";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "New In", href: "/new-in" },
      { label: "Women", href: "/women" },
      { label: "Men", href: "/men" },
      ...categories.filter((c) => ["sarees", "kurtas", "hoodies", "accessories"].includes(c.slug)).map((c) => ({ label: c.name, href: c.href })),
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
    <footer className="mt-24 border-t border-line bg-card text-ink">
      <div className="mx-auto grid max-w-site gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_2fr] lg:px-10">
        <div>
          <p className="font-serif text-4xl font-medium">
            Roots. <span className="italic text-gold">Remixed.</span>
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">{brand.philosophy}</p>
          <p className="mt-6 text-xs uppercase tracking-[0.16em] text-ink/80">{brand.supportEmail}</p>
          <div className="mt-6 flex gap-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-ink">Instagram</a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-ink">YouTube</a>
            <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-ink">X</a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">{col.title}</p>
              <ul className="mt-4 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="text-sm text-ink/75 transition hover:text-gold">
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
        <p className="select-none text-center font-serif text-[17vw] font-semibold leading-[0.85] tracking-[0.12em] text-ink/[0.04]" aria-hidden>
          CHESHIRE
        </p>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-site flex-col gap-2 px-4 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <p>© {new Date().getFullYear()} CHESHIRE Clothing. All rights reserved.</p>
          <p className="font-serif text-base italic text-gold">{brand.secondaryTagline}</p>
        </div>
      </div>
    </footer>
  );
}
