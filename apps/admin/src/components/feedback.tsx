"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Icon } from "./Icon";

/* ───────────── Toasts ───────────── */

type ToastTone = "success" | "error" | "info";
type Toast = { id: number; tone: ToastTone; message: string };
type ConfirmOptions = { title: string; body?: ReactNode; confirmLabel?: string; tone?: "danger" | "default" };

type FeedbackCtx = {
  toast: (message: string, tone?: ToastTone) => void;
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
};

const Ctx = createContext<FeedbackCtx | null>(null);

export function useToast() {
  const c = useContext(Ctx);
  return c?.toast ?? (() => undefined);
}

export function useConfirm() {
  const c = useContext(Ctx);
  return c?.confirm ?? (async (o: ConfirmOptions) => window.confirm(o.title));
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dialog, setDialog] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);
  const seq = useRef(0);
  const confirmBtn = useRef<HTMLButtonElement>(null);

  const toast = useCallback((message: string, tone: ToastTone = "success") => {
    const id = ++seq.current;
    setToasts((t) => [...t.slice(-3), { id, tone, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === "error" ? 7000 : 4000);
  }, []);

  const confirm = useCallback((opts: ConfirmOptions) => new Promise<boolean>((resolve) => setDialog({ ...opts, resolve })), []);

  const close = (v: boolean) => {
    dialog?.resolve(v);
    setDialog(null);
  };

  useEffect(() => {
    if (!dialog) return;
    confirmBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialog]);

  return (
    <Ctx.Provider value={{ toast, confirm }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-lg border px-4 py-3 text-sm shadow-lg ${
              t.tone === "error"
                ? "border-red-500/40 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100"
                : t.tone === "info"
                  ? "border-line bg-surface text-ink"
                  : "border-emerald-500/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
            }`}
          >
            <Icon name={t.tone === "error" ? "alert" : t.tone === "info" ? "info" : "check"} className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="flex-1">{t.message}</span>
            <button type="button" onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))} aria-label="Dismiss" className="opacity-60 hover:opacity-100">
              <Icon name="x" className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      {dialog ? (
        <div className="fixed inset-0 z-[70] grid place-items-center p-4">
          <button type="button" aria-label="Cancel" className="absolute inset-0 bg-black/50" onClick={() => close(false)} />
          <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" className="card relative w-full max-w-md p-6 shadow-2xl">
            <h2 id="confirm-title" className="font-display text-2xl uppercase tracking-wide">
              {dialog.title}
            </h2>
            {dialog.body ? <div className="mt-2 text-sm text-muted">{dialog.body}</div> : null}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => close(false)}>
                Cancel
              </button>
              <button ref={confirmBtn} type="button" className={dialog.tone === "danger" ? "btn-danger" : "btn-primary"} onClick={() => close(true)}>
                {dialog.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Ctx.Provider>
  );
}

/* ───────────── Form helpers ───────────── */

type ActionResult = { ok?: boolean; message?: string } | undefined;

/** Shows a toast whenever a server action returns a new result. */
export function useResultToast(state: ActionResult) {
  const toast = useToast();
  const last = useRef(state);
  useEffect(() => {
    if (state === last.current) return;
    last.current = state;
    if (state?.message) toast(state.message, state.ok ? "success" : "error");
  }, [state, toast]);
}

/** Warns before closing the tab or following a link away while `dirty` is true. */
export function useLeaveGuard(dirty: boolean) {
  const confirm = useConfirm();
  const leaving = useRef(false);
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (leaving.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    const onClick = async (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      e.preventDefault();
      e.stopPropagation();
      const leave = await confirm({
        title: "Leave without saving?",
        body: "You have changes on this page that haven't been saved yet. If you leave now they'll be lost.",
        confirmLabel: "Leave page",
        tone: "danger",
      });
      if (leave) {
        leaving.current = true;
        window.location.assign(href);
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty, confirm]);
}

/**
 * Tracks unsaved edits in a form (any input/change marks it dirty), guards navigation while dirty,
 * and submits with Ctrl/⌘+S. A successful save (`savedState.ok`) marks it clean again.
 */
export function useUnsavedChanges(formRef: RefObject<HTMLFormElement | null>, savedState?: ActionResult) {
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (savedState?.ok) setDirty(false);
  }, [savedState]);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const mark = (e: Event) => {
      if ((e.target as HTMLElement | null)?.closest?.("[data-no-dirty]")) return;
      setDirty(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        form.requestSubmit();
      }
    };
    // Buttons inside the form that change state (size presets, reorder, status toggles) count as edits.
    const onClick = (e: MouseEvent) => {
      const b = (e.target as HTMLElement | null)?.closest?.('button[type="button"]');
      if (b && !b.closest("[data-no-dirty]")) setDirty(true);
    };
    form.addEventListener("input", mark);
    form.addEventListener("change", mark);
    form.addEventListener("keydown", onKey);
    form.addEventListener("click", onClick);
    return () => {
      form.removeEventListener("click", onClick);
      form.removeEventListener("input", mark);
      form.removeEventListener("change", mark);
      form.removeEventListener("keydown", onKey);
    };
  }, [formRef]);

  useLeaveGuard(dirty);
  return { dirty, markClean: () => setDirty(false), markDirty: () => setDirty(true) };
}

/** Small "Unsaved changes" pill + keyboard hint for a form's save bar. */
export function SaveHint({ dirty }: { dirty: boolean }) {
  return (
    <p className="flex items-center justify-between gap-2 text-[11px] text-muted">
      {dirty ? (
        <span className="inline-flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-300">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Unsaved changes
        </span>
      ) : (
        <span>All changes saved</span>
      )}
      <span className="hidden sm:inline">
        <kbd className="rounded border border-line px-1">Ctrl</kbd> + <kbd className="rounded border border-line px-1">S</kbd> to save
      </span>
    </p>
  );
}

/* ───────────── Field hint / tooltip ───────────── */

export function Hint({ children, label = "More info" }: { children: ReactNode; label?: string }) {
  return (
    <span className="group relative ml-1 inline-flex align-middle" data-no-dirty>
      <button type="button" className="text-muted hover:text-ink focus:text-ink focus:outline-none" aria-label={label}>
        <Icon name="info" className="h-3.5 w-3.5" />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-60 max-w-[70vw] -translate-x-1/2 rounded-md bg-[#0A0A0A] px-3 py-2 text-[11px] font-normal normal-case leading-snug tracking-normal text-white shadow-lg group-hover:block group-focus-within:block"
      >
        {children}
      </span>
    </span>
  );
}

/* ───────────── Confirmed action button ───────────── */

export function ConfirmButton({
  run,
  children,
  className = "btn-ghost",
  confirm: confirmOpts,
  title,
  ariaLabel,
}: {
  run: () => Promise<ActionResult | void>;
  children: ReactNode;
  className?: string;
  confirm?: ConfirmOptions;
  title?: string;
  ariaLabel?: string;
}) {
  const [pending, setPending] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();
  return (
    <button
      type="button"
      className={className}
      disabled={pending}
      title={title}
      aria-label={ariaLabel}
      onClick={async () => {
        if (confirmOpts && !(await confirm(confirmOpts))) return;
        setPending(true);
        try {
          const r = await run();
          if (r && r.message) toast(r.message, r.ok === false ? "error" : "success");
        } catch (e) {
          // next/navigation redirects surface as thrown errors; let them through.
          if (e && typeof e === "object" && "digest" in e && String((e as { digest?: string }).digest).startsWith("NEXT_REDIRECT")) throw e;
          toast(e instanceof Error ? e.message : "Something went wrong", "error");
        } finally {
          setPending(false);
        }
      }}
    >
      {pending ? "Working…" : children}
    </button>
  );
}
