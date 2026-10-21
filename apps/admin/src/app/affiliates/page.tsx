import { getAffiliatePartners, getAffiliateStats } from "@cheshire/commerce";
import { formatINR } from "@cheshire/utils";

export default function AdminAffiliatesPage() {
  const partners = getAffiliatePartners();
  const stats = getAffiliateStats();
  return (
    <div>
      <h1 className="text-2xl font-semibold">Affiliate partners</h1>
      <p className="mt-2 text-sm text-muted">
        {stats.clicks} clicks · {stats.conversions} conversions · {formatINR(stats.estimatedCommission)} estimated commission
      </p>
      <div className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-4 py-3">Partner</th>
              <th className="px-4 py-3">Network</th>
              <th className="px-4 py-3">Default commission</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p.id} className="border-b border-line/70">
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{p.network}</td>
                <td className="px-4 py-3">{p.defaultCommission}%</td>
                <td className="px-4 py-3">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
