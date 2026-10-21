import Link from "next/link";
import { notFound } from "next/navigation";
import { formatINR } from "@cheshire/utils";
import {
  COMPLIANCE_LABELS,
  complianceScore,
  getImportedProducts,
  getIntegration,
  getSyncLogs,
} from "@cheshire/integrations";
import {
  actionActivate,
  actionCompliance,
  actionImportTest,
  actionPause,
  actionSyncInventory,
  actionSyncPrices,
  actionTestConnection,
} from "@/lib/integration-actions";
import { ActionButton } from "@/components/ActionButton";

export default async function SupplierIntegrationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = getIntegration(id);
  if (!row) notFound();
  const products = getImportedProducts(row.supplierId);
  const logs = getSyncLogs(row.supplierId).slice(0, 8);
  const score = complianceScore(row.compliance);

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.16em] text-muted">
        <Link href="/integrations">Supplier hub</Link> / {row.supplierName}
      </p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{row.supplierName}</h1>
          <p className="mt-1 text-sm text-muted">
            {row.integrationType} · {row.providerId} · credentials {row.hasCredentials ? "stored (encrypted)" : "not set"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionButton label="Test connection" run={() => actionTestConnection(row.id)} />
          <ActionButton label="Sync inventory" run={() => actionSyncInventory(row.id)} tone="quiet" />
          <ActionButton label="Sync prices" run={() => actionSyncPrices(row.id)} tone="quiet" />
          <ActionButton label="Import 1 test product" run={() => actionImportTest(row.id)} />
          <Link href={`/suppliers/${row.supplierId}/products/import`} className="border border-line px-3 py-1.5 text-xs uppercase tracking-[0.14em]">
            Import
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Connection", value: row.integrationStatus.replaceAll("_", " ") },
          { label: "Operations", value: row.operationalStatus.replaceAll("_", " ") },
          { label: "Last successful sync", value: row.lastSuccessfulSync ? new Date(row.lastSuccessfulSync).toLocaleString("en-IN") : "—" },
          { label: "Last failed sync", value: row.lastFailedSync ? new Date(row.lastFailedSync).toLocaleString("en-IN") : "—" },
          { label: "Products synced", value: String(row.productsSynced) },
          { label: "Inventory synced", value: String(row.inventorySynced) },
          { label: "Orders synced", value: String(row.ordersSynced) },
          { label: "Readiness", value: score.label },
        ].map((c) => (
          <div key={c.label} className="border border-line bg-white p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">{c.label}</p>
            <p className="mt-2 text-lg">{c.value}</p>
          </div>
        ))}
      </div>

      {row.lastHealthMessage ? (
        <p className="mt-4 border border-line bg-white px-4 py-3 text-sm">{row.lastHealthMessage}</p>
      ) : null}

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-medium">Capabilities</h2>
          <ul className="mt-4 divide-y divide-line border border-line bg-white text-sm">
            {["PRODUCT_SYNC", "INVENTORY_SYNC", "PRICE_SYNC", "ORDER_SUBMISSION", "ORDER_STATUS_SYNC", "TRACKING_SYNC", "CANCELLATION", "WEBHOOKS"].map((cap) => (
              <li key={cap} className="flex justify-between px-4 py-2">
                <span>{cap.replaceAll("_", " ")}</span>
                <span>{row.capabilities.includes(cap as never) ? "On" : "Manual only"}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-medium">Branding / dropship</h2>
          <ul className="mt-4 divide-y divide-line border border-line bg-white text-sm">
            <li className="flex justify-between px-4 py-2"><span>Blind shipping</span><span>{row.branding.blindShipping ? "Yes" : "No"}</span></li>
            <li className="flex justify-between px-4 py-2"><span>White-label packaging</span><span>{row.branding.whiteLabelPackaging ? "Yes" : "No"}</span></li>
            <li className="flex justify-between px-4 py-2"><span>Custom invoice</span><span>{row.branding.customInvoice ? "Yes" : "No"}</span></li>
            <li className="flex justify-between px-4 py-2"><span>Cheshire branding</span><span>{row.branding.cheshireBranding}</span></li>
          </ul>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Compliance checklist · {score.ready ? "Ready" : "Not ready"}</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {(Object.keys(COMPLIANCE_LABELS) as Array<keyof typeof COMPLIANCE_LABELS>).map((key) => (
            <li key={key} className="flex items-center justify-between border border-line bg-white px-4 py-2 text-sm">
              <span>{COMPLIANCE_LABELS[key]}</span>
              <ActionButton
                tone="quiet"
                label={row.compliance[key] ? "Done" : "Confirm"}
                run={() => actionCompliance(row.id, { [key]: !row.compliance[key] })}
              />
            </li>
          ))}
        </ul>
        <div className="mt-4 flex gap-2">
          <ActionButton label="Activate for sales" run={() => actionActivate(row.id)} />
          <ActionButton label={row.pauseNewOrders ? "Resume" : "Pause new orders"} tone="quiet" run={() => actionPause(row.supplierId, !row.pauseNewOrders)} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Imported products</h2>
        <div className="mt-4 overflow-x-auto border border-line bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Supplier cost</th>
                <th className="px-4 py-3">Sell</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Rights</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-line/70">
                  <td className="px-4 py-3">{p.sku}</td>
                  <td className="px-4 py-3">{p.title}</td>
                  <td className="px-4 py-3">{formatINR(p.supplierCost)}</td>
                  <td className="px-4 py-3">{formatINR(p.customerPrice)}</td>
                  <td className="px-4 py-3">{p.inventory.available}</td>
                  <td className="px-4 py-3 text-xs">
                    img {p.imageUsagePermission} · copy {p.contentPermissionStatus}
                    {p.imageUsagePermission !== "APPROVED" ? <span className="block text-gold-deep">Image usage permission has not been verified.</span> : null}
                  </td>
                  <td className="px-4 py-3">{p.lifecycle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Recent syncs</h2>
        <ul className="mt-4 divide-y divide-line border border-line bg-white text-sm">
          {logs.map((log) => (
            <li key={log.id} className="flex justify-between px-4 py-3">
              <span>
                {log.kind} · {log.status}
              </span>
              <span className="text-muted">{log.durationMs ?? 0}ms · {log.created} created</span>
            </li>
          ))}
          {!logs.length ? <li className="px-4 py-3 text-muted">No jobs yet.</li> : null}
        </ul>
      </section>
    </div>
  );
}
