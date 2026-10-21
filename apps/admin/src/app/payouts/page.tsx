import { formatINR } from "@cheshire/utils";
import { getPayouts } from "@cheshire/commerce";

export default function AdminPayoutsPage() {
  const rows = getPayouts();
  return (
    <div>
      <h1 className="text-2xl font-semibold">Payouts</h1>
      <div className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-4 py-3">Supplier</th>
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3">Gross</th>
              <th className="px-4 py-3">Commission</th>
              <th className="px-4 py-3">Net</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-line/70">
                <td className="px-4 py-3">{p.supplierId}</td>
                <td className="px-4 py-3">{p.periodLabel}</td>
                <td className="px-4 py-3">{formatINR(p.grossSale)}</td>
                <td className="px-4 py-3">{formatINR(p.commission)}</td>
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
