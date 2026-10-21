import Link from "next/link";
import { getSuppliers } from "@cheshire/commerce";
import { getIntegrations } from "@cheshire/integrations";

export default function AdminSuppliersPage() {
  const rows = getSuppliers();
  const integrations = getIntegrations();
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Suppliers</h1>
          <p className="mt-1 text-sm text-muted">Approve, reject, request changes, or suspend. Only approved labels can publish.</p>
        </div>
        <Link href="/integrations/wizard" className="border border-gold px-3 py-2 text-xs uppercase tracking-[0.14em] text-gold-deep">
          Connect house
        </Link>
      </div>
      <div className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">GST</th>
              <th className="px-4 py-3">Commission</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Integration</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const integration = integrations.find((i) => i.supplierId === s.id);
              return (
                <tr key={s.id} className="border-b border-line/70">
                  <td className="px-4 py-3">{s.brandName}</td>
                  <td className="px-4 py-3">{s.ownerName}</td>
                  <td className="px-4 py-3">{s.gstNumber || "—"}</td>
                  <td className="px-4 py-3">{s.commissionPercent}%</td>
                  <td className="px-4 py-3">{s.status.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3">
                    {integration ? (
                      <Link href={`/suppliers/${s.id}/integration`} className="text-gold-deep">
                        {integration.integrationStatus.replaceAll("_", " ")}
                      </Link>
                    ) : (
                      <Link href="/integrations/wizard" className="text-muted">
                        Not configured
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
