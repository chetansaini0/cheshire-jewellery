import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  linked?: boolean;
  variant?: "compact" | "full" | "mark";
  className?: string;
  priority?: boolean;
};

const sizes = {
  compact: "text-2xl sm:text-3xl",
  full: "text-6xl sm:text-7xl",
  mark: "text-2xl",
} as const;

export function BrandLogo({ href = "/", linked = true, variant = "compact", className = "" }: BrandLogoProps) {
  const mark = (
    <span className={`font-serif uppercase leading-none tracking-tight ${sizes[variant]} ${className}`}>
      {variant === "mark" ? "C" : "Cheshire"}
      {variant !== "mark" ? <sup className="ml-0.5 align-super text-[0.35em]">®</sup> : null}
    </span>
  );
  if (!linked || !href) return mark;
  return (
    <Link href={href} aria-label="CHESHIRE home" className="inline-flex items-center">
      {mark}
    </Link>
  );
}
