/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#2B211F",
        wine: "#6E2A3D",
        "wine-dark": "#511F2E",
        rose: "#C98C86",
        blush: "#F4DEDA",
        ivory: "#FBF5F0",
        gold: "#B8894F",
        sage: "#5C8267",
        amber: "#C98A3B",
        brick: "#A4453C",
        line: "#E8D9D3",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Manrope", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 14px rgba(81, 31, 46, 0.07)",
      },
    },
  },
  plugins: [],
};
