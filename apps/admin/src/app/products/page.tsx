import { formatINR } from "@cheshire/utils";
import { seedProducts } from "@cheshire/database/catalog";
import { getProductInternal } from "@cheshire/commerce";
import { getImportedProducts } from "@cheshire/integrations";

export default function AdminProductsPage() {
  const imported = getImportedProducts();
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Products</h1>
        <p className="text-xs uppercase tracking-[0.14em] text-muted">Live · submitted · draft · imported</p>
      </div>
      {imported.length ? (
        <section className="mt-6">
          <h2 className="text-lg font-medium">Imported (moderation)</h2>
          <div className="mt-3 overflow-x-auto border border-line bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-muted">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Lifecycle</th>
                  <th className="px-4 py-3">Rights</th>
                </tr>
              </thead>
              <tbody>
                {imported.map((p) => (
                  <tr key={p.id} className="border-b border-line/70">
                    <td className="px-4 py-3">{p.sku}</td>
                    <td className="px-4 py-3">{p.title}</td>
                    <td className="px-4 py-3">{p.supplierProductId}</td>
                    <td className="px-4 py-3">{p.lifecycle}</td>
                    <td className="px-4 py-3 text-xs">
                      {p.imageUsagePermission}/{p.contentPermissionStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
      <div className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {seedProducts.map((p) => {
              const internal = getProductInternal(p.sku);
              return (
                <tr key={p.sku} className="border-b border-line/70">
                  <td className="px-4 py-3">{p.sku}</td>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3">{p.productType || internal?.productType || "dropship"}</td>
                  <td className="px-4 py-3">{formatINR(p.price)}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">{p.stock > 0 ? "Live" : "Out of stock"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
