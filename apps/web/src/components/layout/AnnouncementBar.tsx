"use client";

import Link from "next/link";

export function AnnouncementBar() {
  return (
    <div className="relative z-50 bg-ink text-ivory">
      <div className="mx-auto flex h-9 max-w-site items-center justify-center px-4">
        <p className="text-[10px] tracking-[0.22em] uppercase sm:text-[11px]">
          FREE SHIPPING ON ORDERS OVER ₹999
        </p>
        <Link
          href="/account"
          className="absolute right-4 hidden text-[10px] tracking-[0.16em] uppercase text-metal hover:text-ivory sm:block"
        >
          Cheshire Club
        </Link>
      </div>
    </div>
  );
}
