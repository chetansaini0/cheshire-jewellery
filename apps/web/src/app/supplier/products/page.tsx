import Link from "next/link";
import { DEMO_SUPPLIER_LOGIN, getProductInternal, getSupplier, productInternals } from "@cheshire/commerce";
import { catalog } from "@/lib/catalog";
import { formatINR } from "@cheshire/utils";

export default function SupplierProductsPage() {
  const supplier = getSupplier(DEMO_SUPPLIER_LOGIN.email);
  const skus = productInternals.filter((p) => p.supplierId === supplier?.id).map((p) => p.sku);
  const products = catalog.filter((p) => skus.includes(p.sku));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link href="/supplier" className="text-xs uppercase tracking-[0.14em] text-muted">
        Supplier
      </Link>
      <h1 className="mt-4 font-serif text-4xl">Products</h1>
      <p className="mt-2 text-sm text-muted">Drafts stay private until Cheshire admin approves them to live.</p>
      <div className="mt-8 overflow-x-auto border border-line">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Type</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-line/70">
                <td className="px-4 py-3">{p.sku}</td>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{formatINR(p.price)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">{getProductInternal(p.sku)?.productType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
