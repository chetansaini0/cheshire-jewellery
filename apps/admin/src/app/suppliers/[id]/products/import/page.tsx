import Link from "next/link";
import { notFound } from "next/navigation";
import { getIntegration } from "@cheshire/integrations";
import { ImportDesk } from "./ImportDesk";

export default async function ImportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = getIntegration(id);
  if (!row) notFound();
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.16em] text-muted">
        <Link href={`/suppliers/${row.supplierId}/integration`}>{row.supplierName}</Link> / import
      </p>
      <h1 className="mt-3 text-2xl font-semibold">Import products</h1>
      <p className="mt-1 text-sm text-muted">
        Preview first. Imports enter moderation. Supplier images are not published until rights are approved.
      </p>
      <ImportDesk integrationId={row.id} />
    </div>
  );
}
