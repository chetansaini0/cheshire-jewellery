import type { Config } from "tailwindcss";
export declare const tokens: {
  colors: Record<"ivory" | "ink" | "gold" | "goldSoft" | "goldDeep" | "muted" | "card" | "line" | "sale", string>;
  fonts: { serif: string; sans: string };
  radius: Record<"sm" | "md" | "lg", string>;
  shadow: Record<"soft" | "lift", string>;
};
export declare const preset: Partial<Config>;
