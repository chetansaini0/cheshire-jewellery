import { seedProducts } from "@cheshire/database/catalog";

export default function InventoryPage() {
  const rows = seedProducts.map((p) => ({ ...p, status: p.stock < 20 ? "LOW" : "OK" }));
  return (
    <div>
      <h1 className="text-2xl font-semibold">Inventory</h1>
      <div className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.sku} className="border-b border-line/70">
                <td className="px-4 py-3">{r.sku}</td>
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3">{r.stock}</td>
                <td className="px-4 py-3">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
