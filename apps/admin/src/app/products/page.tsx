import { formatINR } from "@cheshire/utils";
import { seedProducts } from "@cheshire/database/catalog";

export default function AdminProductsPage() {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Products</h1>
        <button type="button" className="bg-ink px-4 py-2 text-xs uppercase tracking-[0.14em] text-ivory">
          Add product
        </button>
      </div>
      <div className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">MRP</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {seedProducts.map((p) => (
              <tr key={p.sku} className="border-b border-line/70">
                <td className="px-4 py-3">{p.sku}</td>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3 capitalize">{p.category}</td>
                <td className="px-4 py-3">{formatINR(p.price)}</td>
                <td className="px-4 py-3">{formatINR(p.mrp)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">{p.badge || "Live"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
