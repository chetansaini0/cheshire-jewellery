"use client";

import { useActionState, useRef } from "react";
import { useConfirm, useResultToast } from "@/components/feedback";
import { updateOrderStatusAction, type FormState } from "@/lib/actions";
import type { OrderStatus } from "@/lib/orders";

export function StatusUpdater({ id, current, options }: { id: string; current: OrderStatus; options: OrderStatus[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateOrderStatusAction, {});
  const formRef = useRef<HTMLFormElement>(null);
  const confirmed = useRef(false);
  const confirm = useConfirm();
  useResultToast(state);
  if (!options.length) return <p className="text-sm text-muted">No further status changes for a {current} order.</p>;
  return (
    <form
      ref={formRef}
      action={action}
      className="space-y-3"
      onSubmit={async (e) => {
        const next = new FormData(e.currentTarget).get("status");
        if (confirmed.current || (next !== "cancelled" && next !== "returned")) {
          confirmed.current = false;
          return;
        }
        e.preventDefault();
        const ok = await confirm({
          title: next === "cancelled" ? "Cancel this order?" : "Mark as returned?",
          body: "This can't be undone from the admin. The customer timeline will show this change.",
          confirmLabel: next === "cancelled" ? "Cancel order" : "Mark returned",
          tone: "danger",
        });
        if (ok) {
          confirmed.current = true;
          formRef.current?.requestSubmit();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <div>
        <label className="label" htmlFor="status">Move to</label>
        <select id="status" name="status" className="input capitalize" defaultValue={options[0]}>
          {options.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="note">Note for the timeline (optional)</label>
        <input id="note" name="note" className="input" placeholder="e.g. Shipped via Delhivery Surface" />
      </div>
      <button className="btn-primary w-full" disabled={pending}>
        {pending ? "Updating…" : "Update status"}
      </button>
    </form>
  );
}
