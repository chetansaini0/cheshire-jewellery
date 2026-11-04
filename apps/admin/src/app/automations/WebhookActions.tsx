"use client";

import { useState } from "react";
import type { AutomationEventName } from "@cheshire/config/automation";
import Link from "next/link";
import { ConfirmButton, useToast } from "@/components/feedback";
import { Icon } from "@/components/Icon";
import { deleteWebhookAction, testWebhookAction, toggleWebhookAction } from "@/lib/actions";

export function WebhookActions({ id, name, enabled, events }: { id: string; name: string; enabled: boolean; events: AutomationEventName[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <ConfirmButton className="btn-primary px-3 py-1.5" run={testWebhookAction.bind(null, id, events[0])} title="Send a sample event to this URL now">
        <Icon name="send" /> Send test
      </ConfirmButton>
      <Link href={`/automations?edit=${id}`} className="btn-ghost px-3 py-1.5">
        Edit
      </Link>
      <ConfirmButton
        className="btn-ghost px-3 py-1.5"
        run={toggleWebhookAction.bind(null, id, !enabled)}
        confirm={enabled ? { title: `Pause “${name}”?`, body: "It stops receiving events until you turn it back on.", confirmLabel: "Pause" } : undefined}
      >
        {enabled ? "Pause" : "Turn on"}
      </ConfirmButton>
      <ConfirmButton
        className="btn-danger px-3 py-1.5"
        run={deleteWebhookAction.bind(null, id)}
        ariaLabel={`Delete ${name}`}
        confirm={{ title: `Delete “${name}”?`, body: "Events will no longer be sent to this URL. Its delivery history stays in the log.", confirmLabel: "Delete webhook", tone: "danger" }}
      >
        <Icon name="trash" />
      </ConfirmButton>
    </div>
  );
}

export function SecretField({ secret }: { secret: string }) {
  const [show, setShow] = useState(false);
  const toast = useToast();
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
      <span className="font-semibold uppercase tracking-[0.12em]">Signing secret</span>
      <code className="rounded bg-ink/5 px-2 py-1 font-mono">{show ? secret : `${secret.slice(0, 10)}${"•".repeat(16)}`}</code>
      <button type="button" className="underline-offset-2 hover:text-ink hover:underline" onClick={() => setShow((v) => !v)}>
        {show ? "Hide" : "Show"}
      </button>
      <button
        type="button"
        className="underline-offset-2 hover:text-ink hover:underline"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(secret);
            toast("Secret copied");
          } catch {
            toast("Couldn't copy. Select it and copy manually.", "error");
          }
        }}
      >
        Copy
      </button>
    </div>
  );
}
