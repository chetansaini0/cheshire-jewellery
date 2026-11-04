"use client";

import Link from "next/link";
import { useActionState, useRef } from "react";
import { Hint, SaveHint, useResultToast, useUnsavedChanges } from "@/components/feedback";
import { saveCollectionAction, type FormState } from "@/lib/actions";
import type { AdminCollection } from "@/lib/collections";

export function CollectionForm({ collection }: { collection?: AdminCollection }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveCollectionAction, {});
  const formRef = useRef<HTMLFormElement>(null);
  useResultToast(state);
  const { dirty } = useUnsavedChanges(formRef, state);
  const err = state.errors ?? {};
  return (
    <form ref={formRef} action={action} className="card space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em]">{collection ? `Edit ${collection.name}` : "New collection"}</h2>
        {collection ? (
          <Link href="/collections" className="text-xs text-muted hover:text-ink">
            + New instead
          </Link>
        ) : null}
      </div>
      <input type="hidden" name="originalSlug" value={collection?.slug ?? ""} />
      <div>
        <label className="label" htmlFor="c-name">Name</label>
        <input id="c-name" name="name" defaultValue={collection?.name} className="input" required />
        {err.name ? <p className="mt-1 text-xs text-red-600">{err.name}</p> : null}
      </div>
      <div>
        <label className="label" htmlFor="c-slug">Web address<Hint>The last part of the page link, e.g. cheshire.in/collections/<b>festive-edit</b>. Filled in from the name if left empty, and can&apos;t be changed later.</Hint></label>
        <input id="c-slug" name="slug" defaultValue={collection?.slug} disabled={Boolean(collection)} className="input font-mono text-xs" placeholder="Filled in automatically" />
        {err.slug ? <p className="mt-1 text-xs text-red-600">{err.slug}</p> : null}
      </div>
      <div>
        <label className="label" htmlFor="c-desc">Description</label>
        <textarea id="c-desc" name="description" defaultValue={collection?.description} rows={3} className="input" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="c-sort">Position<Hint>Lower numbers show first. 1 = top of the list.</Hint></label>
          <input id="c-sort" name="sortOrder" type="number" min={1} defaultValue={collection?.sortOrder} className="input" />
        </div>
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={collection?.featured} className="h-4 w-4 accent-[#A6844A]" /> Feature on homepage
        </label>
      </div>
      <button className="btn-gold w-full" disabled={pending}>
        {pending ? "Saving…" : collection ? "Save collection" : "Create collection"}
      </button>
      <SaveHint dirty={dirty} />
    </form>
  );
}
