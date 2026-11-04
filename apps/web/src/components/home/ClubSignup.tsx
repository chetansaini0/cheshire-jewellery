"use client";

import { useState } from "react";
import { inputClass } from "@cheshire/ui";

export function ClubSignup() {
  const [done, setDone] = useState(false);
  return (
    <section className="mx-auto max-w-site px-4 py-20 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-2xl rounded-lg border border-line bg-card px-6 py-12 text-center shadow-soft sm:px-12">
        <p className="eyebrow">The Cheshire letter</p>
        <h2 className="mt-4 font-serif text-4xl font-medium leading-tight md:text-5xl">
          New pieces, <span className="italic text-gold">first.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted">Early access to new collections, styling notes and 10% off your first order.</p>
        {done ? (
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-gold">You&apos;re on the list. Thank you.</p>
        ) : (
          <form
            className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
            }}
          >
            <input type="email" required placeholder="Email address" aria-label="Email address" className={inputClass} />
            <button type="submit" className="btn-primary shrink-0">
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
