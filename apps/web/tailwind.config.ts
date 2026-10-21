import type { Config } from "tailwindcss";

/**
 * CHESHIRE streetwear theme. Token names (ivory/gold/ink) are kept so every
 * page re-themes at once: ivory = paper, ink = black, gold = acid accent.
 */
const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#F4F3EF",
        gold: {
          DEFAULT: "#D7FF3A",
          soft: "#ECFFA6",
          deep: "#0A0A0A",
        },
        ink: "#0A0A0A",
        charcoal: "#1A1A1A",
        metal: "#D7FF3A",
        muted: "#6B6B6B",
        line: "#E4E4E0",
        sale: "#FF3B1F",
      },
      fontFamily: {
        serif: ["var(--font-display)", "Impact", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        brand: "0.2em",
        nav: "0.14em",
      },
      maxWidth: {
        site: "1600px",
      },
      transitionTimingFunction: {
        luxe: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      boxShadow: {
        gold: "0 1px 0 rgba(10, 10, 10, 0.08)",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        "marquee-fast": "marquee 25s linear infinite",
      },
      backgroundImage: {
        "luxe-wash": "linear-gradient(180deg, #F4F3EF 0%, #F4F3EF 100%)",
        "gold-wash": "linear-gradient(135deg, #D7FF3A 0%, #ECFFA6 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
