import { formatINR } from "@cheshire/utils";
import { getSupplierOrders } from "@cheshire/commerce";

export default function AdminOrdersPage() {
  const orders = getSupplierOrders();
  return (
    <div>
      <h1 className="text-2xl font-semibold">Orders</h1>
      <p className="mt-1 text-sm text-muted">Parent Cheshire orders split into supplier fulfilment.</p>
      <div className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">House</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Supplier amount</th>
              <th className="px-4 py-3">Cheshire</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-line/70">
                <td className="px-4 py-3">{o.orderNumber}</td>
                <td className="px-4 py-3">{o.supplierName}</td>
                <td className="px-4 py-3">{o.status}</td>
                <td className="px-4 py-3">{formatINR(o.supplierAmount)}</td>
                <td className="px-4 py-3">{formatINR(o.commissionAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
