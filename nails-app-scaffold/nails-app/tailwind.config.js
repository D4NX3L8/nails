/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./screens/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Mismos tokens de marca del voceto (valentina-nails-prototipo.jsx)
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
        display: ["Fraunces_500Medium"],
        body: ["Manrope_500Medium"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};
