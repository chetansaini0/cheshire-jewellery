"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { isActive, navGroups } from "./nav";
import { logoutAction } from "@/lib/auth-actions";

const STOREFRONT_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function AdminShell({ children, readOnly = false, authEnabled = false }: { children: React.ReactNode; readOnly?: boolean; authEnabled?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCollapsed(localStorage.getItem("ch-admin-collapsed") === "1");
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      localStorage.setItem("ch-admin-collapsed", c ? "0" : "1");
      return !c;
    });
  };

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("ch-admin-theme", next ? "dark" : "light");
  };

  const renderSidebar = (collapsed: boolean) => (
    <nav className="flex h-full flex-col">
      <div className={`flex h-16 items-center border-b border-white/10 ${collapsed ? "justify-center px-2" : "justify-between px-5"}`}>
        <Link href="/" className="flex items-center gap-2 text-[#F4F3EF]">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-lime font-display text-lg leading-none text-[#0A0A0A]">C</span>
          {!collapsed ? (
            <span className="leading-none">
              <span className="block font-display text-xl tracking-wide">CHESHIRE</span>
              <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.3em] text-lime">Ops / Admin</span>
            </span>
          ) : null}
        </Link>
      </div>
      <div className="no-scrollbar flex-1 overflow-y-auto px-2 py-4">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-4">
            {!collapsed ? (
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">{group.title}</p>
            ) : (
              <div className="mx-3 mb-2 border-t border-white/10" />
            )}
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex items-center gap-3 rounded-md py-2 text-sm transition ${
                    collapsed ? "justify-center px-2" : "px-3"
                  } ${active ? "bg-lime font-semibold text-[#0A0A0A]" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
                >
                  <Icon name={item.icon} className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed ? <span className="truncate">{item.label}</span> : null}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
      <div className="hidden border-t border-white/10 p-2 lg:block">
        <button
          type="button"
          onClick={toggleCollapsed}
          className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-xs uppercase tracking-[0.16em] text-white/60 hover:bg-white/5 hover:text-white"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Icon name={collapsed ? "chevronRight" : "chevronLeft"} />
          {!collapsed ? "Collapse" : null}
        </button>
      </div>
    </nav>
  );

  if (pathname === "/login") return <>{children}</>;

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden bg-[#0A0A0A] transition-[width] duration-200 lg:block ${collapsed ? "w-[72px]" : "w-[248px]"}`}
      >
        {renderSidebar(collapsed)}
      </aside>
      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[260px] bg-[#0A0A0A]">{renderSidebar(false)}</aside>
        </div>
      ) : null}

      <div className={`transition-[padding] duration-200 ${collapsed ? "lg:pl-[72px]" : "lg:pl-[248px]"}`}>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-bg/85 px-4 backdrop-blur sm:px-6">
          <button type="button" className="btn-ghost px-2.5 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Icon name="menu" />
          </button>
          <form
            className="relative max-w-xl flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              const q = searchRef.current?.value.trim();
              if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
            }}
          >
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              ref={searchRef}
              type="search"
              name="q"
              placeholder="Search products, SKUs, orders, customers…"
              className="input h-10 pl-9 pr-14"
              aria-label="Search admin"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-line px-1.5 py-0.5 text-[10px] text-muted sm:block">
              Ctrl K
            </kbd>
          </form>
          <div className="ml-auto flex items-center gap-2">
            <a href={STOREFRONT_URL} target="_blank" rel="noreferrer" className="btn-ghost hidden sm:inline-flex">
              <Icon name="external" /> Store
            </a>
            <button type="button" onClick={toggleTheme} className="btn-ghost px-2.5" aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
              <Icon name={dark ? "sun" : "moon"} />
            </button>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-xs font-semibold text-bg" title="Chetan Saini">
              CS
            </span>
            {authEnabled ? (
              <form action={logoutAction}>
                <button type="submit" className="btn-ghost px-2.5" aria-label="Sign out" title="Sign out">
                  <Icon name="logout" />
                </button>
              </form>
            ) : null}
          </div>
        </header>
        {readOnly ? (
          <div className="border-b border-amber-500/30 bg-amber-400/10 px-4 py-2 text-center text-xs text-amber-900 sm:px-6 dark:text-amber-200" role="note">
            <strong>View-only online.</strong> You can look around, but saving is only available locally until a database is connected.
          </div>
        ) : null}
        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
