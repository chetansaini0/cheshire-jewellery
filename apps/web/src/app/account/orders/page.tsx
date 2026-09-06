const timeline = [
  "ORDER PLACED",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "OUT FOR DELIVERY",
  "DELIVERED",
];

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl">Orders</h1>
      <div className="mt-8 border border-line p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm">Order CH2609061042</p>
            <p className="mt-1 text-xs text-muted">Estimated delivery · 3–5 days</p>
            <p className="mt-1 text-xs text-muted">Tracking · DEMO123456 · Delhivery</p>
          </div>
          <p className="text-[11px] tracking-[0.14em] uppercase">Shipped</p>
        </div>
        <ol className="mt-8 space-y-3">
          {timeline.map((step, i) => (
            <li key={step} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] ${
                  i <= 3 ? "border-ink bg-ink text-ivory" : "border-line text-muted"
                }`}
              >
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <div className="mt-6 flex flex-wrap gap-3 text-xs">
          <button type="button" className="underline">
            Cancel
          </button>
          <button type="button" className="underline">
            Return
          </button>
          <button type="button" className="underline">
            Exchange
          </button>
        </div>
      </div>
    </div>
  );
}
