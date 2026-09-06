"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUI } from "@/components/providers/UIProvider";
import { catalog } from "@/lib/catalog";
import { formatINR } from "@cheshire/utils";

const popular = ["silver ring", "minimal necklace", "gift under 2000", "black jewellery", "hoops"];

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useUI();
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const query = q.toLowerCase();
    return catalog
      .filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.tags.some((t) => t.includes(query)) ||
          p.moods.some((m) => m.toLowerCase().includes(query)) ||
          (query.includes("under") && p.price <= 2000)
      )
      .slice(0, 8);
  }, [q]);

  const commit = (term: string) => {
    setRecent((prev) => [term, ...prev.filter((t) => t !== term)].slice(0, 6));
  };

  return (
    <AnimatePresence>
      {searchOpen ? (
        <motion.div
          className="fixed inset-0 z-[60] bg-ivory"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal
          aria-label="Search"
        >
          <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
            <div className="flex items-center justify-between">
              <p className="text-[11px] tracking-[0.2em] uppercase text-muted">Search CHESHIRE</p>
              <button type="button" onClick={() => setSearchOpen(false)} className="text-sm">
                Close
              </button>
            </div>
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && q.trim()) commit(q.trim());
              }}
              placeholder="Try “minimal necklace” or “gift under 2000”"
              className="mt-6 w-full border-b border-ink bg-transparent py-4 font-serif text-3xl outline-none placeholder:text-metal md:text-5xl"
              aria-label="Search products"
            />

            {!q ? (
              <div className="mt-10 grid gap-8 md:grid-cols-2">
                <div>
                  <p className="text-[11px] tracking-[0.18em] uppercase text-muted">Popular</p>
                  <ul className="mt-3 space-y-2">
                    {popular.map((term) => (
                      <li key={term}>
                        <button
                          type="button"
                          className="text-left text-sm capitalize"
                          onClick={() => {
                            setQ(term);
                            commit(term);
                          }}
                        >
                          {term}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[11px] tracking-[0.18em] uppercase text-muted">Recent</p>
                  <ul className="mt-3 space-y-2">
                    {recent.length === 0 ? (
                      <li className="text-sm text-muted">Your recent searches appear here.</li>
                    ) : (
                      recent.map((term) => (
                        <li key={term}>
                          <button type="button" className="text-sm" onClick={() => setQ(term)}>
                            {term}
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            ) : (
              <ul className="mt-8 space-y-4">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/products/${p.slug}`}
                      onClick={() => {
                        commit(q);
                        setSearchOpen(false);
                      }}
                      className="flex items-center justify-between border-b border-line py-3"
                    >
                      <span>{p.name}</span>
                      <span className="text-sm text-muted">{formatINR(p.price)}</span>
                    </Link>
                  </li>
                ))}
                {!results.length ? (
                  <li className="text-sm text-muted">No pieces matched. Try a mood or category.</li>
                ) : null}
                <li>
                  <Link
                    href={`/shop?q=${encodeURIComponent(q)}`}
                    onClick={() => setSearchOpen(false)}
                    className="inline-block pt-2 text-[11px] tracking-[0.16em] uppercase underline"
                  >
                    View all results
                  </Link>
                </li>
              </ul>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
