export function AnnouncementBar() {
  return (
    <div className="relative z-50 border-b border-line bg-ivory px-4 py-2 text-center text-[10.5px] font-medium uppercase tracking-[0.18em] text-muted">
      Free shipping over ₹999 <span className="mx-2 text-gold">·</span> 7-day easy returns
      <span className="hidden sm:inline">
        <span className="mx-2 text-gold">·</span> Designed in India
      </span>
    </div>
  );
}
