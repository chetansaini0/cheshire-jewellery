import type { CommerceEventType } from "@cheshire/types";

export type CommerceEvent = {
  id: string;
  type: CommerceEventType;
  payload: Record<string, unknown>;
  processed: boolean;
  createdAt: string;
};

type Handler = (event: CommerceEvent) => void | Promise<void>;

const handlers = new Map<CommerceEventType, Handler[]>();

export function onCommerceEvent(type: CommerceEventType, handler: Handler) {
  const list = handlers.get(type) ?? [];
  list.push(handler);
  handlers.set(type, list);
  return () => {
    handlers.set(
      type,
      (handlers.get(type) ?? []).filter((h) => h !== handler)
    );
  };
}

export function createCommerceEvent(
  type: CommerceEventType,
  payload: Record<string, unknown>
): CommerceEvent {
  return {
    id: `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    payload,
    processed: false,
    createdAt: new Date().toISOString(),
  };
}

export async function emitCommerceEvent(event: CommerceEvent) {
  const list = handlers.get(event.type) ?? [];
  for (const handler of list) {
    await handler(event);
  }
  event.processed = true;
  return event;
}

/** Dev/default channel. Swap for email/SMS/WhatsApp/webhook adapters later. */
export function logNotification(channel: "email" | "sms" | "whatsapp" | "webhook", to: string, body: string) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[cheshire:${channel}] ${to} — ${body}`);
  }
}
