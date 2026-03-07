/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        game: ["'Baloo 2'", "'Quicksand'", "system-ui", "sans-serif"],
      },
      colors: {
        purple: { DEFAULT: "#7C3AED", light: "#EDE9FE" },
        slate: { DEFAULT: "#334155", light: "#94A3B8" },
        green: { DEFAULT: "#059669", light: "#D1FAE5" },
        red: { DEFAULT: "#DC2626", light: "#FEE2E2" },
        orange: { DEFAULT: "#EA580C", light: "#FFEDD5" },
        yellow: { DEFAULT: "#D97706", light: "#FEF3C7" },
        pink: { DEFAULT: "#DB2777", light: "#FCE7F3" },
        blue: { DEFAULT: "#2563EB", light: "#DBEAFE" },
      },
      animation: {
        bn: "bn .8s ease infinite",
        fu: "fu .4s ease both",
        pi: "pi .3s ease",
        wob: "wob 2s infinite",
      },
      keyframes: {
        bn: {
          "0%,100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.12)" },
        },
        fu: {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pi: {
          from: { opacity: "0", transform: "scale(.9) translateY(8px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        wob: {
          "0%": { transform: "rotate(0)" },
          "25%": { transform: "rotate(10deg)" },
          "75%": { transform: "rotate(-10deg)" },
          "100%": { transform: "rotate(0)" },
        },
      },
    },
  },
  plugins: [],
};
