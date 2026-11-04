import Link from "next/link";
import { AUTOMATION_EVENTS, listDeliveries, listRecentEvents, listWebhooks, SAMPLE_PAYLOADS } from "@cheshire/config/automation";
import { Icon } from "@/components/Icon";
import { EmptyState, Notice, PageHeader, Panel, Pill } from "@/components/ui";
import { dateTime } from "@/lib/format";
import { isReadOnlyDataStore } from "@/lib/store";
import { WebhookForm } from "./WebhookForm";
import { WebhookActions, SecretField } from "./WebhookActions";

export const metadata = { title: "Automations" };

const label = (name: string) => AUTOMATION_EVENTS.find((e) => e.name === name)?.label ?? name;

export default async function AutomationsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const hooks = listWebhooks();
  const deliveries = listDeliveries().slice(0, 30);
  const events = listRecentEvents().slice(0, 10);
  const editing = hooks.find((h) => h.id === edit);
  const readOnly = isReadOnlyDataStore();

  return (
    <div>
      <PageHeader
        eyebrow="System"
        title="Automations"
        subtitle={
          <>
            Send store events (new product, low stock, order status…) to tools like <strong>Zapier, Make, n8n, Google Apps Script</strong> or your own
            server. Paste the tool&apos;s “webhook URL” below and pick which events it should receive.
          </>
        }
      />
      {readOnly ? (
        <Notice tone="warn">
          Automations run only where the admin can save data. On this online (Vercel) copy, saving is only available locally until a database is connected,
          so webhooks can&apos;t be added or triggered here yet.
        </Notice>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        <div className="min-w-0 space-y-6">
          <Panel title="Your webhooks" action={<span className="text-xs text-muted">{hooks.length} connected</span>} bodyClassName="">
            {hooks.length ? (
              <ul className="divide-y divide-line">
                {hooks.map((h) => (
                  <li key={h.id} className="space-y-3 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 font-semibold">
                          {h.name} <Pill tone={h.enabled ? "green" : "gray"}>{h.enabled ? "on" : "paused"}</Pill>
                        </p>
                        <p className="mt-0.5 break-all font-mono text-xs text-muted">{h.url}</p>
                      </div>
                      <WebhookActions id={h.id} name={h.name} enabled={h.enabled} events={h.events} />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {h.events.map((e) => (
                        <Pill key={e} tone="blue">
                          {label(e)}
                        </Pill>
                      ))}
                    </div>
                    <SecretField secret={h.secret} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-5">
                <EmptyState title="No automations yet">
                  <p>Add your first webhook with the form on the right.</p>
                  <p className="mt-1">
                    Example: in Zapier choose <em>Webhooks by Zapier → Catch Hook</em>, copy the URL it gives you, paste it here and tick <em>Stock running low</em>.
                  </p>
                </EmptyState>
              </div>
            )}
          </Panel>

          <Panel title="Recent deliveries" action={<span className="text-xs text-muted">Latest 30 · times in IST</span>} bodyClassName="overflow-x-auto">
            {deliveries.length ? (
              <table className="min-w-full text-sm">
                <thead className="border-b border-line">
                  <tr>
                    <th className="th">When</th>
                    <th className="th">Webhook</th>
                    <th className="th">Event</th>
                    <th className="th">Result</th>
                    <th className="th text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {deliveries.map((d) => (
                    <tr key={d.id}>
                      <td className="td whitespace-nowrap text-xs text-muted">{dateTime(d.at)}</td>
                      <td className="td">{d.webhookName}</td>
                      <td className="td">
                        {label(d.event)} {d.test ? <span className="text-[10px] uppercase tracking-[0.14em] text-muted">· test</span> : null}
                      </td>
                      <td className="td">
                        <Pill tone={d.ok ? "green" : "red"}>{d.ok ? `delivered ${d.status}` : "failed"}</Pill>
                        {d.error && !d.ok ? <div className="mt-1 max-w-xs text-xs text-red-600">{d.error}</div> : null}
                      </td>
                      <td className="td text-right text-xs tabular-nums text-muted">{d.durationMs} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-5">
                <EmptyState title="Nothing sent yet">Deliveries show up here after you press “Send test” or an event happens (e.g. you save a product).</EmptyState>
              </div>
            )}
          </Panel>

          <Panel title="Events you can use" bodyClassName="divide-y divide-line">
            {AUTOMATION_EVENTS.map((e) => (
              <details key={e.name} className="group px-5 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                  <span>
                    <span className="font-semibold">{e.label}</span> <code className="ml-1 text-xs text-muted">{e.name}</code>
                    <span className="block text-xs text-muted">{e.description}</span>
                  </span>
                  <Icon name="chevronRight" className="h-4 w-4 shrink-0 text-muted transition group-open:rotate-90" />
                </summary>
                <pre className="mt-3 overflow-x-auto rounded-md bg-ink/5 p-3 text-xs">{JSON.stringify({ id: "evt_…", event: e.name, createdAt: "2026-11-02T10:00:00.000Z", source: "admin", data: SAMPLE_PAYLOADS[e.name] }, null, 2)}</pre>
              </details>
            ))}
          </Panel>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <WebhookForm key={editing?.id ?? "new"} webhook={editing} events={AUTOMATION_EVENTS} disabled={readOnly} />
          {editing ? (
            <Link href="/automations" className="btn-ghost w-full">
              Cancel editing
            </Link>
          ) : null}
          <Panel title="How it works">
            <ol className="list-decimal space-y-2 pl-4 text-sm text-muted">
              <li>When something happens in the admin, we send a <strong>POST</strong> request with a JSON body to each webhook that listens for it.</li>
              <li>
                Each request carries <code>x-cheshire-event</code>, <code>x-cheshire-timestamp</code> and <code>x-cheshire-signature</code> headers so your
                server can check it really came from your store (see the admin README).
              </li>
              <li>Requests time out after 5 seconds. Failures are listed under Recent deliveries and never block your save.</li>
            </ol>
          </Panel>
          {events.length ? (
            <Panel title="Latest events">
              <ul className="space-y-2 text-sm">
                {events.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-2">
                    <span className="truncate">{label(e.event)}</span>
                    <span className="shrink-0 text-xs text-muted">{dateTime(e.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
