import Link from "next/link";
import { DEMO_SUPPLIER_LOGIN, getSupplier, getSupplierOrders, getPayouts } from "@cheshire/commerce";
import { formatINR } from "@cheshire/utils";

export default function SupplierHome() {
  const supplier = getSupplier(DEMO_SUPPLIER_LOGIN.email);
  const orders = supplier ? getSupplierOrders(supplier.id) : [];
  const payouts = supplier ? getPayouts(supplier.id) : [];
  const pending = payouts.filter((p) => p.status === "pending").reduce((s, p) => s + p.netAmount, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-[11px] tracking-[0.2em] uppercase text-muted">Supplier desk</p>
      <h1 className="mt-2 font-serif text-4xl">{supplier?.brandName || "Supplier"}</h1>
      <p className="mt-2 text-sm text-muted">{DEMO_SUPPLIER_LOGIN.hint}</p>
      {supplier?.status !== "approved" ? (
        <p className="mt-6 border border-line p-4 text-sm">Account is {supplier?.status}. Only approved labels can publish.</p>
      ) : null}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Open orders", value: String(orders.filter((o) => o.status === "pending" || o.status === "processing").length) },
          { label: "Pending payout", value: formatINR(pending) },
          { label: "Status", value: supplier?.status || "—" },
        ].map((c) => (
          <div key={c.label} className="border border-line p-4">
            <p className="text-[10px] tracking-[0.14em] uppercase text-muted">{c.label}</p>
            <p className="mt-2 text-xl">{c.value}</p>
          </div>
        ))}
      </div>
      <nav className="mt-10 flex flex-wrap gap-4 text-sm">
        <Link href="/supplier/products" className="underline">Products</Link>
        <Link href="/supplier/orders" className="underline">Orders</Link>
        <Link href="/supplier/payouts" className="underline">Payouts</Link>
        <Link href="/partners" className="underline">Apply</Link>
      </nav>
    </div>
  );
}
