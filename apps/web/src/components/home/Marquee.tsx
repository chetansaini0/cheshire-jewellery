type MarqueeProps = {
  items: string[];
  className?: string;
  speed?: "slow" | "fast";
  separator?: string;
};

/** CSS-only infinite ticker. No JS, respects reduced motion. */
export function Marquee({ items, className = "", speed = "slow", separator = "✦" }: MarqueeProps) {
  const row = (
    <div className="flex shrink-0 items-center gap-8 pr-8" aria-hidden>
      {items.map((t, i) => (
        <span key={i} className="flex items-center gap-8 whitespace-nowrap">
          {t}
          <span className="text-gold">{separator}</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`flex overflow-hidden ${className}`} role="marquee" aria-label={items.join(", ")}>
      <div className={`flex ${speed === "fast" ? "animate-marquee-fast" : "animate-marquee"}`}>
        {row}
        {row}
        {row}
        {row}
      </div>
    </div>
  );
}
