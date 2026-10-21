/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#F7F5F0",
        gold: {
          DEFAULT: "#C6A35A",
          soft: "#E8D9B0",
          deep: "#8F6F2E",
        },
        ink: "#1C1914",
        line: "#E8E0D2",
        muted: "#7A7264",
      },
    },
  },
  plugins: [],
};
