"use client";

import { useActionState, useEffect, useRef } from "react";
import type { AutomationEventName, Webhook } from "@cheshire/config/automation";
import { Hint, SaveHint, useResultToast, useUnsavedChanges } from "@/components/feedback";
import { saveWebhookAction, type FormState } from "@/lib/actions";

export function WebhookForm({
  webhook,
  events,
  disabled,
}: {
  webhook?: Webhook;
  events: Array<{ name: AutomationEventName; label: string; description: string }>;
  disabled?: boolean;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveWebhookAction, {});
  const formRef = useRef<HTMLFormElement>(null);
  useResultToast(state);
  const { dirty } = useUnsavedChanges(formRef, state);
  useEffect(() => {
    if (state.ok && !webhook) formRef.current?.reset();
  }, [state, webhook]);
  const err = state.errors ?? {};
  const e = (k: string) => (err[k] ? <p className="mt-1 text-xs text-red-600">{err[k]}</p> : null);

  return (
    <form ref={formRef} action={action} className="card space-y-4 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-[0.12em]">{webhook ? `Edit “${webhook.name}”` : "Add a webhook"}</h2>
      <input type="hidden" name="id" value={webhook?.id ?? ""} />
      <div>
        <label className="label" htmlFor="wh-name">Name</label>
        <input id="wh-name" name="name" defaultValue={webhook?.name} className={`input ${err.name ? "!border-red-500" : ""}`} placeholder="e.g. Zapier – low stock to WhatsApp" required />
        {e("name")}
      </div>
      <div>
        <label className="label" htmlFor="wh-url">
          Webhook URL<Hint>The address your automation tool gives you. Must start with https:// (http:// is allowed only for localhost while testing).</Hint>
        </label>
        <input id="wh-url" name="url" type="url" defaultValue={webhook?.url} className={`input font-mono text-xs ${err.url ? "!border-red-500" : ""}`} placeholder="https://hooks.zapier.com/hooks/catch/…" required />
        {e("url")}
      </div>
      <fieldset>
        <legend className="label">Send these events</legend>
        <div className="space-y-1.5">
          {events.map((ev) => (
            <label key={ev.name} className="flex cursor-pointer items-start gap-2.5 rounded-md border border-line p-2.5 text-sm has-[:checked]:border-ink">
              <input type="checkbox" name="events" value={ev.name} defaultChecked={webhook?.events.includes(ev.name)} className="mt-0.5 h-4 w-4 accent-[#A6844A]" />
              <span>
                <span className="font-medium">{ev.label}</span>
                <span className="block text-xs text-muted">{ev.description}</span>
              </span>
            </label>
          ))}
        </div>
        {e("events")}
      </fieldset>
      {webhook ? (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="enabled" defaultChecked={webhook.enabled} className="h-4 w-4 accent-[#A6844A]" /> Switched on
        </label>
      ) : null}
      <button className="btn-gold w-full py-3" disabled={pending || disabled}>
        {pending ? "Saving…" : webhook ? "Save webhook" : "Add webhook"}
      </button>
      <SaveHint dirty={dirty} />
    </form>
  );
}
