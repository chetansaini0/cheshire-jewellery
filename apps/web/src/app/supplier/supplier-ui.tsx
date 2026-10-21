"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  DEMO_SUPPLIER_LOGIN,
  getPayouts,
  getSupplier,
  getSupplierOrders,
  getReturns,
  updateSupplierOrderStatus,
} from "@cheshire/commerce";
import { catalog } from "@/lib/catalog";
import { formatINR } from "@cheshire/utils";
import type { SupplierOrderStatus } from "@cheshire/types";

const nav = [
  { href: "/supplier", label: "Overview" },
  { href: "/supplier/products", label: "Products" },
  { href: "/supplier/orders", label: "Orders" },
  { href: "/supplier/payouts", label: "Payouts" },
  { href: "/supplier/apply", label: "Join" },
];

function useSupplierSession() {
  const [email] = useState(() => {
    if (typeof window === "undefined") return DEMO_SUPPLIER_LOGIN.email;
    return window.sessionStorage.getItem("cheshire-supplier-email") || DEMO_SUPPLIER_LOGIN.email;
  });
  return getSupplier(email);
}

export function SupplierShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const supplier = useSupplierSession();
  return (
    <div className="min-h-screen bg-ivory text-ink">
      <div className="border-b border-gold/30 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <div>
            <p className="font-serif text-xl tracking-[0.18em] text-gold-deep">CHESHIRE</p>
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted">Supplier atelier</p>
          </div>
          <p className="text-xs text-muted">{supplier?.brandName || "Pending house"}</p>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-4 overflow-x-auto px-4 pb-3 text-[11px] tracking-[0.16em] uppercase sm:px-6">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "text-gold-deep" : "text-muted hover:text-ink"}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="font-serif text-4xl">{title}</h1>
        {children}
      </div>
    </div>
  );
}

export default function SupplierHome() {
  const supplier = useSupplierSession();
  const orders = getSupplierOrders(supplier?.id);
  const payouts = getPayouts(supplier?.id);
  const products = catalog.filter((p) => p.brandSlug === supplier?.slug || p.sku.startsWith("CH-HALO") || p.sku.startsWith("CH-MP"));
  const sales = orders.reduce((s, o) => s + o.supplierAmount, 0);
  const pending = payouts.filter((p) => p.status === "pending").reduce((s, p) => s + p.netAmount, 0);

  return (
    <SupplierShell title="Overview">
      <p className="mt-2 text-sm text-muted">
        Status: {supplier?.status.replaceAll("_", " ")}. Only approved houses can publish live.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Sales", formatINR(sales)],
          ["Orders", String(orders.length)],
          ["Live products", String(products.length)],
          ["Pending payout", formatINR(pending)],
        ].map(([label, value]) => (
          <div key={label} className="border border-line bg-white p-4">
            <p className="text-[10px] tracking-[0.16em] uppercase text-muted">{label}</p>
            <p className="mt-2 text-2xl">{value}</p>
          </div>
        ))}
      </div>
      <section className="mt-10">
        <h2 className="text-sm tracking-[0.16em] uppercase">Recent orders</h2>
        <ul className="mt-4 divide-y divide-line border-y border-line bg-white">
          {orders.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <span>{o.orderNumber}</span>
              <span className="text-muted">{o.status}</span>
              <span>{formatINR(o.supplierAmount)}</span>
            </li>
          ))}
        </ul>
      </section>
    </SupplierShell>
  );
}

export function SupplierProducts() {
  const supplier = useSupplierSession();
  const products = useMemo(
    () =>
      catalog.filter(
        (p) => p.brandSlug === supplier?.slug || p.productType === "marketplace" || p.productType === "dropship"
      ).filter((p) => p.brandSlug === supplier?.slug || (supplier?.id === "sup-atelier-noir" && (p.sku.startsWith("CH-HALO") || p.sku.startsWith("CH-MP"))) || (supplier?.id === "sup-lumen-metals" && (p.sku.startsWith("CH-QLINK") || p.sku.startsWith("CH-DS")))),
    [supplier?.id, supplier?.slug]
  );

  return (
    <SupplierShell title="Products">
      <p className="mt-2 text-sm text-muted">Draft → submitted → live. Cheshire reviews photography and copy before publish.</p>
      <div className="mt-8 overflow-x-auto border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-[10px] uppercase tracking-[0.14em] text-muted">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Retail</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-line/70">
                <td className="px-4 py-3">{p.sku}</td>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{formatINR(p.price)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">{p.stock > 0 ? "Live" : "Out of stock"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SupplierShell>
  );
}

export function SupplierOrdersPage() {
  const supplier = useSupplierSession();
  const router = useRouter();
  const orders = getSupplierOrders(supplier?.id);

  return (
    <SupplierShell title="Orders">
      <div className="mt-8 space-y-4">
        {orders.map((o) => (
          <article key={o.id} className="border border-line bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm tracking-[0.14em] uppercase">{o.orderNumber}</h2>
              <span className="text-xs uppercase text-muted">{o.status}</span>
            </div>
            <p className="mt-2 text-sm text-muted">
              {o.customer.fullName} · {o.customer.city} {o.customer.pincode}
            </p>
            <ul className="mt-3 text-sm">
              {o.items.map((item) => (
                <li key={item.sku}>
                  {item.sku} · {item.name} × {item.quantity}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm">Payout {formatINR(o.supplierAmount)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(["confirmed", "processing", "packed", "shipped", "delivered"] as SupplierOrderStatus[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  className="border border-line px-3 py-1 text-[10px] uppercase tracking-[0.12em]"
                  onClick={() => {
                    if (supplier) updateSupplierOrderStatus(o.id, supplier.id, status);
                    router.refresh();
                  }}
                >
                  {status.replaceAll("_", " ")}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </SupplierShell>
  );
}

export function SupplierPayoutsPage() {
  const supplier = useSupplierSession();
  const payouts = getPayouts(supplier?.id);
  const returns = getReturns(supplier?.id);
  return (
    <SupplierShell title="Payouts">
      <p className="mt-2 max-w-xl text-sm text-muted">
        Gross sale − Cheshire commission − refunds/adjustments = your payout.
      </p>
      <div className="mt-8 overflow-x-auto border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-[10px] uppercase tracking-[0.14em] text-muted">
            <tr>
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3">Gross</th>
              <th className="px-4 py-3">Commission</th>
              <th className="px-4 py-3">Refunds</th>
              <th className="px-4 py-3">Net</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((p) => (
              <tr key={p.id} className="border-b border-line/70">
                <td className="px-4 py-3">{p.periodLabel}</td>
                <td className="px-4 py-3">{formatINR(p.grossSale)}</td>
                <td className="px-4 py-3">{formatINR(p.commission)}</td>
                <td className="px-4 py-3">{formatINR(p.refunds)}</td>
                <td className="px-4 py-3">{formatINR(p.netAmount)}</td>
                <td className="px-4 py-3">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {returns.length ? (
        <p className="mt-6 text-sm text-muted">{returns.length} return request in inspection.</p>
      ) : null}
    </SupplierShell>
  );
}
