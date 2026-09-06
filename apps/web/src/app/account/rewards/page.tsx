export default function RewardsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl">Cheshire Club</h1>
      <p className="mt-3 text-sm text-muted">Earn points. Unlock drops. Stay early.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="border border-line p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Points</p>
          <p className="mt-2 font-serif text-4xl">1,240</p>
        </div>
        <div className="border border-line p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Tier</p>
          <p className="mt-2 font-serif text-4xl">Gold</p>
        </div>
        <div className="border border-line p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Next tier</p>
          <p className="mt-2 font-serif text-4xl">260</p>
        </div>
      </div>
      <ul className="mt-10 space-y-3 text-sm text-muted">
        <li>Purchases · Reviews · Referrals · Birthdays · App checkouts · Social engagement</li>
        <li>Rewards · Coupons · Early access · Exclusive drops · Free shipping · Birthday gifts</li>
        <li>Admin-configurable reward rules via CMS</li>
      </ul>
    </div>
  );
}
