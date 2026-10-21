import Link from "next/link";
import { formatINR } from "@cheshire/utils";
import { businessSnapshot, getIntegrations, integrationDashboard, listProviders } from "@cheshire/integrations";
import { actionSandbox } from "@/lib/integration-actions";
import { ActionButton } from "@/components/ActionButton";

export default function IntegrationsHubPage() {
  const dash = integrationDashboard();
  const business = businessSnapshot();
  const rows = getIntegrations();
  const providers = listProviders();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Supplier hub</h1>
          <p className="mt-1 text-sm text-muted">
            Connect houses, import catalogues, and route fulfillment. Live APIs are never assumed.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/integrations/wizard" className="border border-gold px-3 py-2 text-xs uppercase tracking-[0.14em] text-gold-deep">
            Setup wizard
          </Link>
          <ActionButton label="Run sandbox scenario" run={actionSandbox} />
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Integrations", value: String(rows.length) },
          { label: "Imported products", value: String(dash.products) },
          { label: "Live on Cheshire", value: String(dash.liveProducts) },
          { label: "Open alerts", value: String(dash.openAlerts) },
          { label: "Supplier GMV", value: formatINR(business.gmv) },
          { label: "Cheshire revenue", value: formatINR(business.cheshireRevenue) },
          { label: "Avg margin", value: `${business.averageMargin}%` },
          { label: "Failed fulfillment", value: String(business.failedFulfillment) },
        ].map((c) => (
          <div key={c.label} className="border border-line bg-white p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">{c.label}</p>
            <p className="mt-2 text-2xl">{c.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Houses</h2>
        <div className="mt-4 overflow-x-auto border border-line bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Connection</th>
                <th className="px-4 py-3">Ops</th>
                <th className="px-4 py-3">Last sync</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-line/70">
                  <td className="px-4 py-3">{row.supplierName}</td>
                  <td className="px-4 py-3">{row.integrationType}</td>
                  <td className="px-4 py-3">{row.integrationStatus.replaceAll("_", " ")}</td>
                  <td className="px-4 py-3">{row.operationalStatus.replaceAll("_", " ")}</td>
                  <td className="px-4 py-3 text-xs text-muted">{row.lastSuccessfulSync ? new Date(row.lastSuccessfulSync).toLocaleString("en-IN") : "—"}</td>
                  <td className="px-4 py-3">
                    <Link href={`/suppliers/${row.supplierId}/integration`} className="text-gold-deep">
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Connector kit</h2>
        <p className="mt-1 text-sm text-muted">Pending adapters never report a live connection.</p>
        <ul className="mt-4 divide-y divide-line border border-line bg-white text-sm">
          {providers.map((p) => (
            <li key={p.providerId} className="flex justify-between px-4 py-3">
              <span>
                {p.displayName}
                <span className="ml-2 text-xs uppercase tracking-[0.12em] text-muted">{p.integrationType}</span>
              </span>
              <span className="text-xs uppercase tracking-[0.12em]">{p.live ? "Ready" : "Pending"}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
