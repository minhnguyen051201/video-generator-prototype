/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-playfair)", "serif"],
      },
    },
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },
    colors: {
      background: "#5A3D2E",
      foreground: "#F2E5D7",
      brand: {
        DEFAULT: "#F3B664",
        foreground: "#2E1A12",
        muted: "#C77D3B",
      },
    },
    fontFamily: {
      sans: ["var(--font-inter)", "sans-serif"],
      display: ["var(--font-playfair)", "serif"],
    },
    keyframes: {
      "fade-up": {
        "0%": { opacity: "0", transform: "translateY(16px)" },
        "100%": { opacity: "1", transform: "translateY(0)" },
      },
    },
    animation: {
      "fade-up": "fade-up 0.6s ease-out both",
    },
    boxShadow: {
      glow: "0 0 0 1px rgba(243, 182, 100, 0.25), 0 12px 40px rgba(0, 0, 0, 0.45)",
    },
  },
  plugins: [],
};
