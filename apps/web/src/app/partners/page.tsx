"use client";

import { useState } from "react";
import Link from "next/link";
import { registerSupplier } from "@cheshire/commerce";

export default function PartnersPage() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="text-[11px] tracking-[0.22em] uppercase text-muted">Atelier partners</p>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl">Join the CHESHIRE edit</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        We work with a small number of independent clothing labels. Applications are reviewed before any product goes live.
        Approved partners manage catalogue, orders, and payouts in the supplier desk.
      </p>
      <p className="mt-3 text-sm text-muted">
        Already approved?{" "}
        <Link href="/supplier" className="underline">
          Open supplier desk
        </Link>
      </p>

      {done ? (
        <p className="mt-10 border border-line p-6 text-sm">
          Application received. Status: Pending approval. We will write to the email you shared.
        </p>
      ) : (
        <form
          className="mt-10 grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            const fd = new FormData(e.currentTarget);
            try {
              registerSupplier({
                brandName: String(fd.get("brandName") || ""),
                ownerName: String(fd.get("ownerName") || ""),
                email: String(fd.get("email") || ""),
                phone: String(fd.get("phone") || ""),
                businessName: String(fd.get("businessName") || ""),
                gstNumber: String(fd.get("gstin") || ""),
                addressLine1: String(fd.get("address") || ""),
                city: String(fd.get("city") || ""),
                state: String(fd.get("state") || ""),
                pincode: String(fd.get("pincode") || ""),
                bankAccountName: String(fd.get("bank") || ""),
                bankIfsc: "",
                productCategories: String(fd.get("categories") || "")
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
                shippingRegions: ["IN"],
                returnPolicy: String(fd.get("returns") || "7-day unused returns"),
                commissionPercent: 15,
                defaultShippingFee: 79,
                freeShippingThreshold: 999,
                deliveryMinDays: 4,
                deliveryMaxDays: 7,
                codAvailable: true,
              });
              setDone(true);
            } catch {
              setError("Could not submit application.");
            }
          }}
        >
          <input required name="brandName" placeholder="Brand name" className="border border-line bg-transparent px-3 py-3" />
          <input required name="ownerName" placeholder="Owner / contact name" className="border border-line bg-transparent px-3 py-3" />
          <input required name="email" type="email" placeholder="Email" className="border border-line bg-transparent px-3 py-3" />
          <input required name="phone" placeholder="Phone" className="border border-line bg-transparent px-3 py-3" />
          <input required name="businessName" placeholder="Legal business name" className="border border-line bg-transparent px-3 py-3" />
          <input name="gstin" placeholder="GSTIN (if applicable)" className="border border-line bg-transparent px-3 py-3" />
          <input required name="address" placeholder="Address" className="border border-line bg-transparent px-3 py-3" />
          <div className="grid gap-4 sm:grid-cols-3">
            <input required name="city" placeholder="City" className="border border-line bg-transparent px-3 py-3" />
            <input required name="state" placeholder="State" className="border border-line bg-transparent px-3 py-3" />
            <input required name="pincode" placeholder="PIN" className="border border-line bg-transparent px-3 py-3" />
          </div>
          <input name="bank" placeholder="Bank account name" className="border border-line bg-transparent px-3 py-3" />
          <input name="categories" placeholder="Categories (tees, denim…)" className="border border-line bg-transparent px-3 py-3" />
          <textarea name="returns" placeholder="Return policy" className="min-h-24 border border-line bg-transparent px-3 py-3" />
          {error ? <p className="text-sm text-sale">{error}</p> : null}
          <button type="submit" className="bg-gold py-3 text-[11px] tracking-[0.16em] uppercase text-ink hover:bg-gold-deep hover:text-ivory">
            Submit for review
          </button>
        </form>
      )}
    </div>
  );
}
