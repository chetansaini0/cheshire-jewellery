import * as React from "react";
import { cn } from "@cheshire/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-[#111111] text-[#F7F5F0] hover:bg-[#242424]",
    secondary: "bg-[#F7F5F0] text-[#111111] border border-[#111111] hover:bg-[#111111] hover:text-[#F7F5F0]",
    ghost: "bg-transparent text-[#111111] hover:bg-black/5",
    outline: "border border-[#B8B8B8] text-[#111111] hover:border-[#111111]",
  };
  const sizes = {
    sm: "h-9 px-4 text-xs tracking-[0.14em]",
    md: "h-11 px-6 text-xs tracking-[0.16em]",
    lg: "h-13 px-8 text-sm tracking-[0.18em]",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center uppercase font-medium transition-colors duration-300 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111]",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 text-[10px] tracking-[0.18em] uppercase border border-[#111111]/text-[#111111]",
        className
      )}
    >
      {children}
    </span>
  );
}

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10", className)}>
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn(align === "center" && "text-center")}>
      {eyebrow ? (
        <p className="mb-3 text-[11px] tracking-[0.22em] uppercase text-[#6B6B6B]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight text-[#111111]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 max-w-xl text-sm md:text-base text-[#6B6B6B] leading-relaxed">
          {description}
        </p>
      ) : null}
    </div>
  );
}
