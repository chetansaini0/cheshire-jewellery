import { getReturns } from "@cheshire/commerce";

export default function AdminReturnsPage() {
  const rows = getReturns();
  return (
    <div>
      <h1 className="text-2xl font-semibold">Returns</h1>
      <ul className="mt-6 space-y-3">
        {rows.map((r) => (
          <li key={r.id} className="border border-line bg-white p-4 text-sm">
            <p>{r.orderNumber} · {r.kind} · {r.status}</p>
            <p className="mt-1 text-muted">{r.reason}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
