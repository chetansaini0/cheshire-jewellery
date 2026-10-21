import { Marquee } from "@/components/home/Marquee";

export function AnnouncementBar() {
  return (
    <div className="relative z-50 bg-ink py-2 text-ivory">
      <Marquee
        speed="fast"
        items={["Free shipping over ₹999", "New drop every Friday", "7-day easy returns", "Join the Cheshire Club — 10% off first order"]}
        className="text-[10px] font-semibold uppercase tracking-[0.2em] sm:text-[11px]"
      />
    </div>
  );
}
