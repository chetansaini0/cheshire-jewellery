import Link from "next/link";
import { DEMO_SUPPLIER_LOGIN, getSupplier, getSupplierOrders } from "@cheshire/commerce";
import { formatINR } from "@cheshire/utils";

export default function SupplierOrdersPage() {
  const supplier = getSupplier(DEMO_SUPPLIER_LOGIN.email);
  const orders = supplier ? getSupplierOrders(supplier.id) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link href="/supplier" className="text-xs uppercase tracking-[0.14em] text-muted">
        Supplier
      </Link>
      <h1 className="mt-4 font-serif text-4xl">Orders</h1>
      <ul className="mt-8 space-y-4">
        {orders.map((o) => (
          <li key={o.id} className="border border-line p-4">
            <div className="flex justify-between gap-4">
              <div>
                <p className="text-sm">{o.orderNumber}</p>
                <p className="mt-1 text-xs text-muted">
                  {o.items.map((i) => `${i.sku} ×${i.quantity}`).join(", ")} · {o.customer.city} {o.customer.pincode}
                </p>
              </div>
              <p className="text-[11px] uppercase tracking-[0.12em]">{o.status}</p>
            </div>
            <p className="mt-2 text-sm">{formatINR(o.supplierAmount)} supplier amount</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
