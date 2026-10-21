"use client";

import { useState } from "react";
import Link from "next/link";

export default function AccountPage() {
  const [mode, setMode] = useState<"otp" | "email">("otp");
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto max-w-lg px-4 py-14">
      <h1 className="font-serif text-4xl">Account</h1>
      <p className="mt-3 text-sm text-muted">OTP, email, Google, and Apple auth ready.</p>

      <div className="mt-8 flex gap-3 text-[11px] tracking-[0.14em] uppercase">
        <button type="button" onClick={() => setMode("otp")} className={mode === "otp" ? "underline" : ""}>
          OTP
        </button>
        <button type="button" onClick={() => setMode("email")} className={mode === "email" ? "underline" : ""}>
          Email
        </button>
      </div>

      <form
        className="mt-6 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
      >
        {mode === "otp" ? (
          <input
            required
            placeholder="Phone or email"
            className="w-full border border-line bg-transparent px-3 py-3"
          />
        ) : (
          <>
            <input required type="email" placeholder="Email" className="w-full border border-line bg-transparent px-3 py-3" />
            <input required type="password" placeholder="Password" className="w-full border border-line bg-transparent px-3 py-3" />
          </>
        )}
        {sent && mode === "otp" ? (
          <input required placeholder="Enter OTP" className="w-full border border-line bg-transparent px-3 py-3" />
        ) : null}
        <button type="submit" className="w-full bg-gold py-3 text-[11px] tracking-[0.16em] uppercase text-ink hover:bg-gold-deep hover:text-ivory">
          {mode === "otp" && !sent ? "Send OTP" : "Continue"}
        </button>
      </form>

      <div className="mt-4 grid gap-2">
        <button type="button" className="border border-line py-3 text-sm">
          Continue with Google
        </button>
        <button type="button" className="border border-line py-3 text-sm">
          Continue with Apple
        </button>
      </div>

      <div className="mt-10 grid gap-2 text-sm">
        {[
          ["Profile", "/account"],
          ["Orders", "/account/orders"],
          ["Wishlist", "/wishlist"],
          ["Addresses", "/account"],
          ["Coupons", "/account"],
          ["Rewards / Cheshire Club", "/account/rewards"],
          ["Notifications", "/account"],
          ["Returns", "/support"],
          ["Support", "/support"],
          ["Delete account", "/policies/privacy"],
        ].map(([label, href]) => (
          <Link key={label} href={href} className="border-b border-line py-3">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
