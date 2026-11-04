/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Storefront palette: off-white / black / acid lime. Values are CSS variables so dark mode is a class flip.
        bg: v("bg"),
        surface: v("surface"),
        ink: v("ink"),
        line: v("line"),
        muted: v("muted"),
        lime: { DEFAULT: "#D7FF3A", ink: v("lime-ink") },
        // Legacy token names used by older pages, remapped to the new palette.
        ivory: v("bg"),
        gold: { DEFAULT: "#D7FF3A", soft: "#EEFFB0", deep: v("lime-ink") },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-anton)", "Impact", "sans-serif"],
        serif: ["var(--font-anton)", "Impact", "sans-serif"],
      },
    },
  },
  plugins: [],
};
