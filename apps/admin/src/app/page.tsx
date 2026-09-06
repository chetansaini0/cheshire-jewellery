import { formatINR } from "@cheshire/utils";
import { seedProducts } from "@cheshire/database/catalog";

export default function AdminDashboard() {
  const revenue = seedProducts.reduce(
    (s, p) => s + p.price * Math.max(1, Math.floor(p.reviewCount / 20)),
    0
  );
  const lowStock = seedProducts.filter((p) => p.stock < 20);

  const cards = [
    { label: "Revenue", value: formatINR(revenue) },
    { label: "Orders", value: "1,284" },
    { label: "Customers", value: "8,420" },
    { label: "Products", value: String(seedProducts.length) },
    { label: "Low inventory", value: String(lowStock.length) },
    { label: "Conversion", value: "2.8%" },
    { label: "AOV", value: formatINR(2140) },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Commerce overview for CHESHIRE</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="border border-line bg-white p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">{c.label}</p>
            <p className="mt-2 text-2xl">{c.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Top products</h2>
        <div className="mt-4 overflow-x-auto border border-line bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Rating</th>
              </tr>
            </thead>
            <tbody>
              {seedProducts
                .filter((p) => p.isBestseller)
                .slice(0, 8)
                .map((p) => (
                  <tr key={p.sku} className="border-b border-line/70">
                    <td className="px-4 py-3">{p.sku}</td>
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="px-4 py-3">{formatINR(p.price)}</td>
                    <td className="px-4 py-3">{p.stock}</td>
                    <td className="px-4 py-3">{p.rating}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
