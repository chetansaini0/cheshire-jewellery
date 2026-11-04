import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { Thumb } from "@/components/Thumb";
import { DemoTag, PageHeader, Panel, Pill } from "@/components/ui";
import { dateTime, inr } from "@/lib/format";
import { getOrder, nextStatuses, statusTone, type OrderStatus } from "@/lib/orders";
import { categoryName } from "@/lib/products";
import { StatusUpdater } from "./StatusUpdater";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Order #${id}` };
}

const FLOW: OrderStatus[] = ["placed", "confirmed", "packed", "shipped", "delivered"];

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = getOrder(id);
  if (!order) notFound();
  const reached = new Set(order.events.map((e) => e.status));
  const terminal = order.status === "cancelled" || order.status === "returned";

  return (
    <div>
      <Link href="/orders" className="mb-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted hover:text-ink">
        <Icon name="chevronLeft" className="h-3.5 w-3.5" /> Orders
      </Link>
      <PageHeader
        eyebrow={`Placed ${dateTime(order.createdAt)} IST`}
        title={`Order #${order.id}`}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <Pill tone={statusTone[order.status]}>{order.status}</Pill>
            <Pill tone={order.paymentStatus === "paid" ? "green" : order.paymentStatus === "refunded" ? "red" : "amber"}>
              {order.payment} · {order.paymentStatus}
            </Pill>
            <DemoTag />
          </span>
        }
      />

      <div className="card mb-6 p-5">
        <ol className="grid grid-cols-5 gap-2">
          {FLOW.map((s, i) => {
            const done = reached.has(s);
            return (
              <li key={s} className="flex flex-col items-center text-center">
                <div className="flex w-full items-center">
                  <span className={`h-0.5 flex-1 ${i === 0 ? "opacity-0" : done ? "bg-ink" : "bg-line"}`} />
                  <span className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${done ? "bg-gold text-white ring-2 ring-ink" : "bg-ink/5 text-muted"}`}>
                    {done ? "✓" : i + 1}
                  </span>
                  <span className={`h-0.5 flex-1 ${i === FLOW.length - 1 ? "opacity-0" : reached.has(FLOW[i + 1]) ? "bg-ink" : "bg-line"}`} />
                </div>
                <span className={`mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] ${done ? "" : "text-muted"}`}>{s}</span>
              </li>
            );
          })}
        </ol>
        {terminal ? <p className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-center text-sm text-red-700 dark:text-red-300">This order was {order.status}.</p> : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Panel title={`Items (${order.lines.length})`} bodyClassName="divide-y divide-line">
            {order.lines.map((l) => (
              <div key={l.sku} className="flex items-center gap-4 px-5 py-4">
                <Thumb id={l.image} alt={l.name} className="h-20 w-16" w={160} />
                <div className="min-w-0 flex-1">
                  <Link href={`/products/${l.sku}`} className="font-semibold hover:underline">
                    {l.name}
                  </Link>
                  <p className="text-xs text-muted">
                    {l.sku} · {categoryName(l.category)} · Size <strong className="text-ink">{l.size}</strong>
                  </p>
                </div>
                <div className="text-right text-sm tabular-nums">
                  <p>
                    {inr(l.price)} × {l.qty}
                  </p>
                  <p className="font-semibold">{inr(l.price * l.qty)}</p>
                </div>
              </div>
            ))}
            <dl className="space-y-1.5 px-5 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular-nums">{inr(order.subtotal)}</dd>
              </div>
              {order.discount ? (
                <div className="flex justify-between">
                  <dt className="text-muted">Discount {order.couponCode ? <code className="ml-1 rounded bg-gold-soft px-1 text-xs text-gold-deep">{order.couponCode}</code> : null}</dt>
                  <dd className="tabular-nums text-emerald-600">−{inr(order.discount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd className="tabular-nums">{order.shipping ? inr(order.shipping) : "Free"}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{inr(order.total)}</dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Timeline">
            <ol className="relative ml-2 border-l border-line">
              {[...order.events].reverse().map((e, i) => (
                <li key={`${e.status}-${e.at}-${i}`} className="mb-5 ml-5 last:mb-0">
                  <span className={`absolute -left-[7px] mt-1 h-3.5 w-3.5 rounded-full ring-4 ring-surface ${i === 0 ? "bg-gold ring-offset-0" : "bg-ink/30"}`} />
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone={statusTone[e.status]}>{e.status}</Pill>
                    <span className="text-xs text-muted">{dateTime(e.at)} IST</span>
                    {e.by ? <span className="text-xs text-muted">· {e.by}</span> : null}
                  </div>
                  {e.note ? <p className="mt-1 text-sm">{e.note}</p> : null}
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <aside className="space-y-6">
          <Panel title="Update status">
            <StatusUpdater id={order.id} current={order.status} options={nextStatuses(order.status)} />
          </Panel>
          <Panel title="Customer">
            <Link href={`/customers?q=${encodeURIComponent(order.customer.email)}`} className="font-semibold hover:underline">
              {order.customer.name}
            </Link>
            <p className="text-sm text-muted">{order.customer.email}</p>
            <p className="text-sm text-muted">{order.customer.phone}</p>
            <h3 className="label mt-4">Ship to</h3>
            <p className="text-sm">
              {order.customer.city}, {order.customer.state} {order.customer.pincode}
            </p>
            {order.awb ? (
              <>
                <h3 className="label mt-4">AWB</h3>
                <p className="font-mono text-sm">{order.awb}</p>
              </>
            ) : null}
          </Panel>
        </aside>
      </div>
    </div>
  );
}
