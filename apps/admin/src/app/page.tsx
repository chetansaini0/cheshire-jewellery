import { formatINR } from "@cheshire/utils";
import { adminDashboardMetrics, getAffiliateStats, getCommissionRules, getSuppliers } from "@cheshire/commerce";

export default function AdminDashboard() {
  const metrics = adminDashboardMetrics();
  const affiliate = getAffiliateStats();
  const suppliers = getSuppliers();
  const rules = getCommissionRules();

  const cards = [
    { label: "GMV", value: formatINR(metrics.gmv) },
    { label: "Cheshire revenue", value: formatINR(metrics.cheshireRevenue) },
    { label: "Supplier revenue", value: formatINR(metrics.supplierRevenue) },
    { label: "Affiliate revenue", value: formatINR(metrics.affiliateRevenue) },
    { label: "Orders", value: String(metrics.orders) },
    { label: "Customers", value: String(metrics.customers) },
    { label: "Approved suppliers", value: String(metrics.suppliers) },
    { label: "Pending orders", value: String(metrics.pendingOrders) },
    { label: "Pending payouts", value: formatINR(metrics.pendingPayouts) },
    { label: "Returns", value: String(metrics.returns) },
    { label: "Refunds", value: String(metrics.refunds) },
    { label: "Affiliate clicks", value: String(affiliate.clicks) },
  ];

  const revenueBars = [42, 55, 48, 62, 70, 66, 81];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Commerce control for the CHESHIRE destination</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="border border-line bg-white p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">{c.label}</p>
            <p className="mt-2 text-2xl">{c.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-medium">Revenue over time</h2>
          <div className="mt-4 flex h-40 items-end gap-2 border border-line bg-white p-4">
            {revenueBars.map((n, i) => (
              <div key={i} className="flex-1 bg-gold/80" style={{ height: `${n}%` }} title={`Week ${i + 1}`} />
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-medium">Commission rules</h2>
          <ul className="mt-4 divide-y divide-line border border-line bg-white text-sm">
            {rules.map((r) => (
              <li key={r.id} className="flex justify-between px-4 py-3">
                <span>
                  {r.name} · {r.scope}
                </span>
                <span>{r.percent}%</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Supplier houses</h2>
        <div className="mt-4 overflow-x-auto border border-line bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Commission</th>
                <th className="px-4 py-3">City</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} className="border-b border-line/70">
                  <td className="px-4 py-3">{s.brandName}</td>
                  <td className="px-4 py-3">{s.status.replaceAll("_", " ")}</td>
                  <td className="px-4 py-3">{s.commissionPercent}%</td>
                  <td className="px-4 py-3">{s.city}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
