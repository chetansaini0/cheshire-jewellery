"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { brand, nav } from "@cheshire/config";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useUI } from "@/components/providers/UIProvider";
import { useCartTotals, useCommerceStore } from "@/store/commerce";

function Icon({ d, label }: { d: string; label: string }) {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <title>{label}</title>
      <path d={d} />
    </svg>
  );
}

const icons = {
  search: "M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-3.5-3.5",
  user: "M20 21v-1a5 5 0 00-5-5H9a5 5 0 00-5 5v1M12 11a4 4 0 100-8 4 4 0 000 8z",
  heart: "M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 000-7.8z",
  bag: "M6 7h12l1 14H5L6 7zM9 7V6a3 3 0 016 0v1",
};

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { toggleCart, toggleSearch } = useUI();
  const { count } = useCartTotals();
  const wishlistCount = useCommerceStore((s) => s.wishlistIds.length);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname?.startsWith(href + "/"));

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-[background-color,box-shadow] duration-300 ${
        scrolled ? "border-line bg-ivory/90 shadow-soft backdrop-blur-md" : "border-line bg-ivory"
      }`}
    >
      <div className="mx-auto grid h-16 max-w-site grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:h-[76px] lg:px-10">
        <div className="flex items-center">
          <button
            type="button"
            className="-ml-1 p-1 lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <Icon d={menuOpen ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h10"} label="Menu" />
          </button>
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {nav.primary.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`relative py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition hover:text-gold ${
                  isActive(item.href) ? "text-ink after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-gold" : "text-ink/75"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <BrandLogo priority />

        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <button type="button" onClick={toggleSearch} aria-label="Search" className="p-2 transition hover:text-gold">
            <Icon d={icons.search} label="Search" />
          </button>
          <Link href="/account" aria-label="Account" className="hidden p-2 transition hover:text-gold sm:inline-flex">
            <Icon d={icons.user} label="Account" />
          </Link>
          <Link href="/wishlist" aria-label={`Saved items${wishlistCount ? `, ${wishlistCount}` : ""}`} className="relative hidden p-2 transition hover:text-gold sm:inline-flex">
            <Icon d={icons.heart} label="Saved" />
            {wishlistCount ? <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-gold" /> : null}
          </Link>
          <button type="button" onClick={toggleCart} aria-label={`Bag, ${count} items`} className="relative p-2 transition hover:text-gold">
            <Icon d={icons.bag} label="Bag" />
            {count ? (
              <span className="absolute -right-0.5 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[9px] font-bold text-white">{count}</span>
            ) : null}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav id="mobile-nav" className="border-t border-line bg-ivory px-5 pb-8 pt-2 lg:hidden" aria-label="Mobile primary">
          {nav.primary.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center justify-between border-b border-line py-4 font-serif text-3xl font-medium">
              {item.label}
              <span className="text-base text-gold">→</span>
            </Link>
          ))}
          <div className="mt-6 flex gap-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            <Link href="/account">Account</Link>
            <Link href="/wishlist">Saved</Link>
            <Link href="/support">Help</Link>
          </div>
          <p className="mt-8 font-serif text-xl italic text-gold">{brand.tagline}</p>
        </nav>
      ) : null}
    </header>
  );
}
