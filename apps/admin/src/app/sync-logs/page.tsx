import { getSyncLogs } from "@cheshire/integrations";

export default function SyncLogsPage() {
  const logs = getSyncLogs();
  return (
    <div>
      <h1 className="text-2xl font-semibold">Sync logs</h1>
      <p className="mt-1 text-sm text-muted">Background jobs never run inside a customer page request.</p>
      <div className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-4 py-3">Supplier</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Processed</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3">Skipped</th>
              <th className="px-4 py-3">Duration</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-line/70">
                <td className="px-4 py-3">{log.supplierName}</td>
                <td className="px-4 py-3">{log.kind}</td>
                <td className="px-4 py-3">{log.status}</td>
                <td className="px-4 py-3">{log.processed}</td>
                <td className="px-4 py-3">{log.created}</td>
                <td className="px-4 py-3">{log.updated}</td>
                <td className="px-4 py-3">{log.skipped}</td>
                <td className="px-4 py-3">{log.durationMs ?? "—"}ms</td>
              </tr>
            ))}
            {!logs.length ? (
              <tr>
                <td className="px-4 py-6 text-muted" colSpan={8}>
                  No sync jobs yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
