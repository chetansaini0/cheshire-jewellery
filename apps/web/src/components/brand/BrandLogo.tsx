import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  linked?: boolean;
  variant?: "compact" | "full" | "mark";
  className?: string;
  priority?: boolean;
};

const sizes = {
  compact: "text-[26px] sm:text-[30px] tracking-[0.22em]",
  full: "text-6xl sm:text-7xl tracking-[0.2em]",
  mark: "text-2xl",
} as const;

/** Wordmark set in Cormorant Garamond (semibold, wide tracking). */
export function BrandLogo({ href = "/", linked = true, variant = "compact", className = "" }: BrandLogoProps) {
  const mark = (
    <span className={`font-serif font-semibold leading-none text-ink ${sizes[variant]} ${className}`}>
      {variant === "mark" ? "C" : "CHESHIRE"}
    </span>
  );
  if (!linked || !href) return mark;
  return (
    <Link href={href} aria-label="CHESHIRE home" className="inline-flex items-center">
      {mark}
    </Link>
  );
}
