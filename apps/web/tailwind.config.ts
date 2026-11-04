import type { Config } from "tailwindcss";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { preset } = require("../../packages/ui/theme.cjs");

/** CHESHIRE storefront — palette, fonts and radii come from the shared preset in packages/ui. */
const config: Config = {
  presets: [preset],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 60s linear infinite",
        "marquee-fast": "marquee 25s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
