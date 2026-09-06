import Link from "next/link";
import { brand } from "@cheshire/config";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "New In", href: "/shop?sort=newest" },
      { label: "Bestsellers", href: "/shop?sort=bestselling" },
      { label: "Rings", href: "/shop/rings" },
      { label: "Necklaces", href: "/shop/necklaces" },
      { label: "Earrings", href: "/shop/earrings" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Stores", href: "/stores" },
      { label: "Journal", href: "/journal" },
      { label: "Careers", href: "/about" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Support", href: "/support" },
      { label: "Shipping", href: "/policies/shipping" },
      { label: "Returns", href: "/policies/returns" },
      { label: "Track Order", href: "/account/orders" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/policies/privacy" },
      { label: "Terms", href: "/policies/terms" },
      { label: "Refunds", href: "/policies/refunds" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-ivory">
      <div className="mx-auto grid max-w-site gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_2fr] lg:px-10">
        <div>
          <p className="font-serif text-4xl tracking-[0.18em]">CHESHIRE</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            {brand.tagline}
          </p>
          <p className="mt-6 text-xs tracking-[0.16em] uppercase text-metal">
            care@cheshire.com
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-[11px] tracking-[0.2em] uppercase text-ink">{col.title}</p>
              <ul className="mt-4 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="text-sm text-muted transition hover:text-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-site flex-col gap-2 px-4 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <p>© {new Date().getFullYear()} CHESHIRE. All rights reserved.</p>
          <p className="tracking-[0.14em] uppercase">Luxury without trying too hard.</p>
        </div>
      </div>
    </footer>
  );
}
