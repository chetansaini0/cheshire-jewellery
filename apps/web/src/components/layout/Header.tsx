"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { nav } from "@cheshire/config";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useUI } from "@/components/providers/UIProvider";
import { useCartTotals, useCommerceStore } from "@/store/commerce";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { toggleCart, toggleSearch } = useUI();
  const { count } = useCartTotals();
  const wishlistCount = useCommerceStore((s) => s.wishlistIds.length);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
        scrolled ? "border-ink/10 bg-ivory/90 backdrop-blur-md" : "border-transparent bg-ivory"
      }`}
    >
      <div className="mx-auto grid h-16 max-w-site grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:h-[4.5rem] lg:px-10">
        <div className="flex items-center gap-6">
          <button
            type="button"
            className="text-[11px] font-semibold uppercase tracking-nav xl:hidden"
            aria-expanded={menuOpen}
            aria-label="Menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
          <nav className="hidden items-center gap-6 xl:flex" aria-label="Primary">
            {nav.primary.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                className="text-[11px] font-semibold uppercase tracking-nav text-ink/80 transition hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <BrandLogo priority />

        <div className="flex items-center justify-end gap-3 text-[11px] font-semibold uppercase tracking-nav sm:gap-6">
          <button type="button" onClick={toggleSearch} aria-label="Search" className="hover:opacity-60">
            <span className="hidden sm:inline">Search</span>
            <svg className="h-4 w-4 sm:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>
          <Link href="/account" className="hidden hover:opacity-60 sm:inline">
            Account
          </Link>
          <Link href="/wishlist" className="hidden hover:opacity-60 sm:inline">
            Saved{wishlistCount ? ` (${wishlistCount})` : ""}
          </Link>
          <button
            type="button"
            onClick={toggleCart}
            aria-label={`Bag, ${count} items`}
            className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-ivory"
          >
            Bag <span className="rounded-full bg-gold px-1.5 text-ink">{count}</span>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav className="border-t border-ink/10 bg-ivory px-4 pb-6 pt-2 xl:hidden" aria-label="Mobile primary">
          {nav.primary.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="block border-b border-line py-3 font-serif text-3xl uppercase"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-4 flex gap-6 text-[11px] font-semibold uppercase tracking-nav">
            <Link href="/account" onClick={() => setMenuOpen(false)}>Account</Link>
            <Link href="/wishlist" onClick={() => setMenuOpen(false)}>Saved</Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
