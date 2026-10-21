"use client";

import { useMemo, useState, useTransition } from "react";
import {
  actionCsv,
  actionImportSelected,
  actionPreview,
  actionPublish,
  actionSetPermissions,
} from "@/lib/integration-actions";

type PreviewRow = {
  supplierProductId: string;
  sku: string;
  title: string;
  image?: string;
  supplierCost: number;
  stock: number;
  category: string;
  customerPrice: number;
  commission: number;
  duplicate: boolean;
  imageWarning: boolean;
};

export function ImportDesk({ integrationId }: { integrationId: string }) {
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [csv, setCsv] = useState("name,sku,price,stock,category,image\n");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const chosen = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);

  return (
    <div className="mt-8 space-y-8">
      <div className="flex flex-wrap gap-2">
        <button
          className="border border-gold px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-gold-deep"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const result = await actionPreview(integrationId);
              setRows(result.items as PreviewRow[]);
              setMessage(result.error);
            })
          }
        >
          Preview import
        </button>
        <button
          className="border border-line px-3 py-1.5 text-xs uppercase tracking-[0.14em]"
          disabled={pending || !chosen.length}
          onClick={() =>
            start(async () => {
              const result = await actionImportSelected(integrationId, chosen);
              setMessage(JSON.stringify({ created: result.created, updated: result.updated, skipped: result.skipped }));
            })
          }
        >
          Import selected
        </button>
      </div>

      <div className="overflow-x-auto border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-3 py-3"></th>
              <th className="px-3 py-3">Product</th>
              <th className="px-3 py-3">SKU</th>
              <th className="px-3 py-3">Cost</th>
              <th className="px-3 py-3">Sell</th>
              <th className="px-3 py-3">Stock</th>
              <th className="px-3 py-3">Category</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.supplierProductId} className="border-b border-line/70">
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={Boolean(selected[row.supplierProductId])}
                    onChange={(e) => setSelected((s) => ({ ...s, [row.supplierProductId]: e.target.checked }))}
                  />
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    {row.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={row.image} alt="" className="h-12 w-12 object-cover" />
                    ) : (
                      <span className="h-12 w-12 bg-ivory" />
                    )}
                    <div>
                      <p>{row.title}</p>
                      {row.imageWarning ? (
                        <p className="text-[11px] text-gold-deep">Image usage permission has not been verified.</p>
                      ) : null}
                      {row.duplicate ? <p className="text-[11px] text-muted">Already imported — will update</p> : null}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">{row.sku}</td>
                <td className="px-3 py-3">₹{row.supplierCost}</td>
                <td className="px-3 py-3">₹{row.customerPrice}</td>
                <td className="px-3 py-3">{row.stock}</td>
                <td className="px-3 py-3">{row.category}</td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td className="px-3 py-6 text-muted" colSpan={7}>
                  Preview a catalogue before importing. Nothing goes live until rights and moderation pass.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <section>
        <h2 className="text-lg font-medium">CSV / Excel-style upload</h2>
        <p className="mt-1 text-sm text-muted">Columns: name, sku, price, stock, category, image, description. Still enters moderation.</p>
        <textarea
          className="mt-3 w-full border border-line bg-white p-3 font-mono text-xs"
          rows={6}
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
        />
        <button
          className="mt-3 border border-line px-3 py-1.5 text-xs uppercase tracking-[0.14em]"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const result = await actionCsv(integrationId, csv);
              setMessage(JSON.stringify(result));
            })
          }
        >
          Validate and import CSV
        </button>
      </section>

      {message ? <p className="text-sm text-muted">{message}</p> : null}

      <RightsNote
        onApprove={(id) => start(() => { void actionSetPermissions(id, "APPROVED", "APPROVED"); })}
        onPublish={(id) => start(() => { void actionPublish(id); })}
      />
    </div>
  );
}

function RightsNote({ onApprove, onPublish }: { onApprove: (id: string) => void; onPublish: (id: string) => void }) {
  const [id, setId] = useState("");
  return (
    <section className="border border-line bg-white p-4">
      <h2 className="text-lg font-medium">Rights + publish</h2>
      <p className="mt-1 text-sm text-muted">Paste an imported product id after import. Images stay private until permission is APPROVED.</p>
      <input className="mt-3 w-full border border-line px-3 py-2 text-sm" placeholder="Product id" value={id} onChange={(e) => setId(e.target.value)} />
      <div className="mt-3 flex gap-2">
        <button className="border border-gold px-3 py-1.5 text-xs uppercase tracking-[0.14em]" onClick={() => onApprove(id)}>
          Approve image + copy
        </button>
        <button className="border border-line px-3 py-1.5 text-xs uppercase tracking-[0.14em]" onClick={() => onPublish(id)}>
          Publish live
        </button>
      </div>
    </section>
  );
}
