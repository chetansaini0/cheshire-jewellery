"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { nav } from "@cheshire/config";
import { useUI } from "@/components/providers/UIProvider";
import { useCartTotals, useCommerceStore } from "@/store/commerce";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
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
      className={`sticky top-0 z-40 border-b transition-all duration-500 ease-luxe ${
        scrolled
          ? "border-line/80 bg-ivory/90 backdrop-blur-md"
          : "border-transparent bg-ivory"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-site items-center justify-between px-4 sm:px-6 lg:h-[4.5rem] lg:px-10">
        <nav className="hidden items-center gap-5 xl:flex" aria-label="Primary">
          {nav.primary.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="text-[11px] tracking-nav uppercase text-ink/80 transition-colors hover:text-ink"
              data-cursor="view"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 font-serif text-2xl tracking-[0.2em] sm:text-3xl"
          aria-label="CHESHIRE home"
        >
          CHESHIRE
        </Link>

        <div className="ml-auto flex items-center gap-4 sm:gap-5">
          <button
            type="button"
            onClick={toggleSearch}
            className="text-[11px] tracking-nav uppercase"
            aria-label="Search"
            data-cursor="view"
          >
            Search
          </button>
          <Link href="/account" className="hidden text-[11px] tracking-nav uppercase sm:inline" data-cursor="view">
            Account
          </Link>
          <Link href="/wishlist" className="text-[11px] tracking-nav uppercase" data-cursor="view">
            Wishlist{wishlistCount ? `(${wishlistCount})` : ""}
          </Link>
          <button
            type="button"
            onClick={toggleCart}
            className="text-[11px] tracking-nav uppercase"
            aria-label={`Cart, ${count} items`}
            data-cursor="view"
          >
            Cart{count ? `(${count})` : ""}
          </button>
        </div>
      </div>

      <nav
        className="flex gap-4 overflow-x-auto border-t border-line px-4 py-2 no-scrollbar xl:hidden"
        aria-label="Mobile primary"
      >
        {nav.primary.slice(0, 6).map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="whitespace-nowrap text-[10px] tracking-nav uppercase text-muted"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
