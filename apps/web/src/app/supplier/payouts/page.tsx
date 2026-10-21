import Link from "next/link";
import { DEMO_SUPPLIER_LOGIN, getPayouts, getSupplier } from "@cheshire/commerce";
import { formatINR } from "@cheshire/utils";

export default function SupplierPayoutsPage() {
  const supplier = getSupplier(DEMO_SUPPLIER_LOGIN.email);
  const payouts = supplier ? getPayouts(supplier.id) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link href="/supplier" className="text-xs uppercase tracking-[0.14em] text-muted">
        Supplier
      </Link>
      <h1 className="mt-4 font-serif text-4xl">Payouts</h1>
      <p className="mt-2 text-sm text-muted">Gross sale − Cheshire commission − refunds/adjustments = your payout.</p>
      <div className="mt-8 overflow-x-auto border border-line">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3">Gross</th>
              <th className="px-4 py-3">Commission</th>
              <th className="px-4 py-3">Refunds</th>
              <th className="px-4 py-3">Payout</th>
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
    </div>
  );
}
