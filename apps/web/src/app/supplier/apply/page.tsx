"use client";

import { useState } from "react";
import { registerSupplier } from "@cheshire/commerce";
import { SupplierShell } from "../supplier-ui";

export default function SupplierApplyPage() {
  const [status, setStatus] = useState<string | null>(null);

  return (
    <SupplierShell title="Sell on CHESHIRE">
      <p className="mt-2 max-w-xl text-sm text-muted">
        Apply to list clothing on CHESHIRE. Houses stay pending until our team reviews business details.
      </p>
      <form
        className="mt-8 grid max-w-xl gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const row = registerSupplier({
            brandName: String(fd.get("brandName") || ""),
            ownerName: String(fd.get("ownerName") || ""),
            email: String(fd.get("email") || ""),
            phone: String(fd.get("phone") || ""),
            businessName: String(fd.get("businessName") || ""),
            gstNumber: String(fd.get("gst") || ""),
            addressLine1: String(fd.get("address") || ""),
            city: String(fd.get("city") || ""),
            state: String(fd.get("state") || ""),
            pincode: String(fd.get("pincode") || ""),
            bankAccountName: String(fd.get("bankName") || ""),
            bankIfsc: String(fd.get("ifsc") || ""),
            productCategories: String(fd.get("categories") || "").split(",").map((s) => s.trim()),
            shippingRegions: ["IN"],
            returnPolicy: String(fd.get("returns") || "7-day returns"),
            commissionPercent: 15,
            defaultShippingFee: 79,
            freeShippingThreshold: 999,
            deliveryMinDays: 4,
            deliveryMaxDays: 7,
            codAvailable: true,
          });
          setStatus(`${row.brandName} submitted — status ${row.status.replaceAll("_", " ")}`);
        }}
      >
        {[
          ["brandName", "Brand name"],
          ["ownerName", "Owner / contact"],
          ["email", "Email"],
          ["phone", "Phone"],
          ["businessName", "Business name"],
          ["gst", "GSTIN"],
          ["address", "Address"],
          ["city", "City"],
          ["state", "State"],
          ["pincode", "PIN"],
          ["bankName", "Account name"],
          ["ifsc", "IFSC"],
          ["categories", "Categories (comma separated)"],
          ["returns", "Return policy"],
        ].map(([name, placeholder]) => (
          <input
            key={name}
            name={name}
            required
            placeholder={placeholder}
            className="border border-line bg-transparent px-3 py-3"
          />
        ))}
        <button type="submit" className="bg-gold py-3 text-[11px] tracking-[0.16em] uppercase text-ink">
          Submit for review
        </button>
      </form>
      {status ? <p className="mt-4 text-sm">{status}</p> : null}
    </SupplierShell>
  );
}
