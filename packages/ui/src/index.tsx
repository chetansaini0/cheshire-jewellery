import * as React from "react";
import { cn } from "@cheshire/utils";

export { tokens, type ColorToken } from "./tokens";

/*
 * Shared primitives for the storefront and admin. Styling uses the Tailwind preset in ../theme.cjs
 * (ivory / ink / gold / muted / line / card), so both apps must list packages/ui/src in `content`.
 */

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "gold";
  size?: "sm" | "md" | "lg";
};

export const buttonVariants = {
  primary: "bg-ink text-ivory hover:bg-charcoal",
  gold: "bg-gold text-white hover:bg-gold-deep",
  secondary: "bg-card text-ink border border-line hover:border-ink",
  ghost: "bg-transparent text-ink hover:bg-ink/5",
  outline: "border border-ink/30 text-ink hover:border-ink",
} as const;

export const buttonSizes = {
  sm: "h-9 px-4 text-[11px]",
  md: "h-11 px-6 text-xs",
  lg: "h-12 px-8 text-xs",
} as const;

export function buttonClass(variant: keyof typeof buttonVariants = "primary", size: keyof typeof buttonSizes = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-sm font-sans font-semibold uppercase tracking-[0.14em] transition-colors duration-300 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
    buttonVariants[variant],
    buttonSizes[size],
    className
  );
}

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function Badge({
  children,
  className,
  tone = "gold",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "gold" | "ink" | "light";
}) {
  const tones = {
    gold: "bg-ivory/95 text-gold-deep",
    ink: "bg-ink text-ivory",
    light: "bg-card text-ink border border-line",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.16em]",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Card({ children, className, as: Tag = "div" }: { children: React.ReactNode; className?: string; as?: "div" | "section" | "article" }) {
  return <Tag className={cn("rounded-lg border border-line bg-card shadow-soft", className)}>{children}</Tag>;
}

export const inputClass =
  "w-full rounded-sm border border-line bg-card px-3 py-2.5 font-sans text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-gold focus:ring-2 focus:ring-gold/20";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref
) {
  return <input ref={ref} className={cn(inputClass, className)} {...props} />;
});

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-gold", className)}>{children}</p>;
}

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("mx-auto w-full max-w-site px-4 sm:px-6 lg:px-10", className)}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}
      <h2 className="font-serif text-4xl font-medium leading-[1.05] tracking-[-0.01em] text-ink md:text-5xl">{title}</h2>
      {description ? (
        <p className={cn("mt-4 max-w-xl text-sm leading-relaxed text-muted md:text-base", align === "center" && "mx-auto")}>{description}</p>
      ) : null}
    </div>
  );
}
