"use client";

import { useMemo, useState } from "react";

const stores = [
  {
    name: "CHESHIRE Bandra",
    address: "14 Linking Road, Bandra West",
    city: "Mumbai",
    phone: "+91 22 4000 1101",
    hours: "11:00 AM – 9:00 PM",
  },
  {
    name: "CHESHIRE Khan Market",
    address: "32 Khan Market",
    city: "New Delhi",
    phone: "+91 11 4000 2202",
    hours: "11:00 AM – 9:00 PM",
  },
  {
    name: "CHESHIRE Indiranagar",
    address: "100 Feet Road, Indiranagar",
    city: "Bengaluru",
    phone: "+91 80 4000 3303",
    hours: "11:00 AM – 9:30 PM",
  },
];

export default function StoresPage() {
  const [city, setCity] = useState("All");
  const cities = ["All", ...Array.from(new Set(stores.map((s) => s.city)))];
  const filtered = useMemo(
    () => (city === "All" ? stores : stores.filter((s) => s.city === city)),
    [city]
  );

  return (
    <div className="mx-auto max-w-site px-4 py-12 sm:px-6 lg:px-10">
      <h1 className="font-serif text-4xl md:text-5xl">Store locator</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        {cities.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCity(c)}
            className={`border px-4 py-2 text-[11px] tracking-[0.14em] uppercase ${
              city === c ? "border-gold bg-gold text-ink" : "border-line"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {filtered.map((s) => (
          <article key={s.name} className="border border-line p-6">
            <h2 className="font-serif text-2xl">{s.name}</h2>
            <p className="mt-3 text-sm text-muted">{s.address}</p>
            <p className="mt-1 text-sm text-muted">{s.city}</p>
            <p className="mt-3 text-sm">{s.phone}</p>
            <p className="mt-1 text-sm text-muted">{s.hours}</p>
            <a
              className="mt-4 inline-block text-xs uppercase tracking-[0.14em] underline"
              href={`https://maps.google.com/?q=${encodeURIComponent(s.address + " " + s.city)}`}
              target="_blank"
              rel="noreferrer"
            >
              Directions
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
