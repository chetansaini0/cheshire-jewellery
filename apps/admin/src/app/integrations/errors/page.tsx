import { getAlerts, getFulfillments } from "@cheshire/integrations";
import { actionManualSubmit, actionResolveAlert, actionRetry } from "@/lib/integration-actions";
import { ActionButton } from "@/components/ActionButton";

export default function IntegrationErrorsPage() {
  const alerts = getAlerts(false);
  const failed = getFulfillments().filter(
    (f) => f.status === "SUPPLIER_SUBMISSION_FAILED" || f.status === "SUPPLIER_ACTION_REQUIRED"
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold">Integration errors</h1>
      <p className="mt-1 text-sm text-muted">
        Paid customer orders are never discarded. Retry or forward the fulfillment sheet.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-medium">Alerts</h2>
        <ul className="mt-4 divide-y divide-line border border-line bg-white text-sm">
          {alerts.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium">
                  {a.severity} · {a.supplierName}
                </p>
                <p className="text-muted">{a.message}</p>
                <p className="text-xs text-muted">
                  {a.code} · retries {a.retryCount} · {a.resolution}
                </p>
              </div>
              <div className="flex gap-2">
                {a.orderId ? <ActionButton label="Retry" run={() => actionRetry(failed.find((f) => f.cheshireOrderNumber === a.orderId)?.id || "")} /> : null}
                <ActionButton tone="quiet" label="Resolve" run={() => actionResolveAlert(a.id, "resolved")} />
                <ActionButton tone="quiet" label="Ignore" run={() => actionResolveAlert(a.id, "ignored")} />
              </div>
            </li>
          ))}
          {!alerts.length ? <li className="px-4 py-6 text-muted">No integration errors.</li> : null}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Fulfillment needing action</h2>
        <ul className="mt-4 divide-y divide-line border border-line bg-white text-sm">
          {failed.map((f) => (
            <li key={f.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p>
                  {f.cheshireOrderNumber} · {f.supplierName}
                </p>
                <p className="text-muted">{f.status}</p>
              </div>
              <div className="flex gap-2">
                <ActionButton label="Retry supplier" run={() => actionRetry(f.id)} />
                <ActionButton tone="quiet" label="Mark submitted manually" run={() => actionManualSubmit(f.id)} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
