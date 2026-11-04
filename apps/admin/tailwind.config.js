/** @type {import('tailwindcss').Config} */
// Shared CHESHIRE design tokens (packages/ui) — the same preset the storefront uses.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { preset } = require("../../packages/ui/theme.cjs");

const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  presets: [preset],
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces are CSS variables so the optional dark mode is a class flip; light is the default.
        bg: v("bg"),
        surface: v("surface"),
        ink: v("ink"),
        line: v("line"),
        muted: v("muted"),
        ivory: v("bg"),
        card: v("surface"),
        gold: { DEFAULT: "#A6844A", soft: v("gold-soft"), deep: v("gold-deep") },
        // Legacy alias: older markup still says "lime"; it now renders as champagne gold.
        lime: { DEFAULT: "#A6844A", ink: v("gold-deep") },
      },
    },
  },
  plugins: [],
};
