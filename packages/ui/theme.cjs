/**
 * CHESHIRE design system — single source of truth for both apps.
 * Values live in tokens.json; this file turns them into a Tailwind preset.
 *   storefront: apps/web/tailwind.config.ts   admin: apps/admin/tailwind.config.js
 * Fonts are loaded per app with next/font (Cormorant Garamond → --font-serif, Manrope → --font-sans).
 */
const tokens = require("./tokens.json");
const c = tokens.colors;

/** @type {import('tailwindcss').Config} */
const preset = {
  theme: {
    extend: {
      colors: {
        ivory: c.ivory,
        ink: c.ink,
        gold: { DEFAULT: c.gold, soft: c.goldSoft, deep: c.goldDeep },
        muted: c.muted,
        card: c.card,
        line: c.line,
        sale: c.sale,
        charcoal: "#2A2826",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
        display: ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Manrope", "system-ui", "sans-serif"],
      },
      borderRadius: tokens.radius,
      boxShadow: { soft: tokens.shadow.soft, lift: tokens.shadow.lift },
      letterSpacing: { brand: "0.24em", nav: "0.16em" },
      maxWidth: { site: "1440px" },
      transitionTimingFunction: { luxe: "cubic-bezier(0.22, 1, 0.36, 1)" },
    },
  },
};

module.exports = { tokens, preset };
