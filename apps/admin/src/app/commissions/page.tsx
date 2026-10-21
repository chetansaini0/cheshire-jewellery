import { getCommissionRules } from "@cheshire/commerce";

export default function AdminCommissionsPage() {
  const rules = getCommissionRules();
  return (
    <div>
      <h1 className="text-2xl font-semibold">Commissions</h1>
      <p className="mt-1 text-sm text-muted">Resolution: product → collection → supplier → category → global. Change rules here, not in code.</p>
      <div className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-4 py-3">Rule</th>
              <th className="px-4 py-3">Scope</th>
              <th className="px-4 py-3">Percent</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Active</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id} className="border-b border-line/70">
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3">{r.scope}</td>
                <td className="px-4 py-3">{r.percent}%</td>
                <td className="px-4 py-3">{r.priority}</td>
                <td className="px-4 py-3">{r.isActive ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
