"use client";

import { useState } from "react";

export function ClubSignup() {
  const [done, setDone] = useState(false);
  return (
    <section className="mx-auto max-w-site px-4 py-20 sm:px-6 lg:px-10">
      <div className="grid gap-8 border-y border-ink py-12 md:grid-cols-2 md:items-end">
        <h2 className="font-serif text-5xl uppercase leading-[0.88] md:text-7xl">
          Get the drop<br />before it drops.
        </h2>
        <div>
          <p className="text-sm text-muted">Early access, members-only pricing and 10% off your first order.</p>
          {done ? (
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em]">You&apos;re on the list ✦</p>
          ) : (
            <form
              className="mt-5 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                setDone(true);
              }}
            >
              <input
                type="email"
                required
                placeholder="Email address"
                aria-label="Email address"
                className="min-w-0 flex-1 rounded-full border border-ink bg-transparent px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-gold"
              />
              <button type="submit" className="rounded-full bg-ink px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory">
                Join
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
