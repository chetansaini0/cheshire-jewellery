export function TrustBadges() {
  const items = [
    { title: "Free size exchange", body: "Wrong fit? Swap it free within 7 days." },
    { title: "Tracked dispatch", body: "Ships in 24–48 hrs across India." },
    { title: "Easy returns", body: "Seven days, unworn, tags on." },
    { title: "Secure payments", body: "Razorpay. Cards never stored here." },
  ];
  return (
    <ul className="mt-8 grid grid-cols-2 gap-3">
      {items.map((item) => (
        <li key={item.title} className="rounded-xl border border-line px-3 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em]">{item.title}</p>
          <p className="mt-1 text-xs text-muted">{item.body}</p>
        </li>
      ))}
    </ul>
  );
}
