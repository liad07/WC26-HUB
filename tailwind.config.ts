import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          bg: "#070a12",
          bg2: "#0a0f1a",
          card: "#0f1524",
          elevated: "#131b2e",
          border: "#1e293b",
          accent: "#22d3ee",
          brand: "#6366f1",
          brand2: "#a855f7",
          live: "#f43f5e",
          gold: "#fbbf24",
        },
      },
      fontFamily: {
        sans: ["var(--font-heebo)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(120deg, #6366f1 0%, #3b82f6 45%, #22d3ee 100%)",
        "brand-radial": "radial-gradient(60% 60% at 50% 0%, rgba(99,102,241,0.25), transparent 70%)",
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(99,102,241,0.55)",
        "glow-cyan": "0 0 40px -8px rgba(34,211,238,0.6)",
        "glow-live": "0 0 34px -6px rgba(244,63,94,0.6)",
        card: "0 18px 45px -20px rgba(0,0,0,0.75)",
      },
      keyframes: {
        "pulse-live": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "glow-live": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(244,63,94,0.0)" },
          "50%": { boxShadow: "0 0 26px 3px rgba(244,63,94,0.55)" },
        },
        "glow-champion": {
          "0%, 100%": { boxShadow: "0 0 20px 2px rgba(251,191,36,0.45)" },
          "50%": { boxShadow: "0 0 42px 10px rgba(251,191,36,0.8)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-7px)" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "pulse-live": "pulse-live 1.4s ease-in-out infinite",
        shimmer: "shimmer 1.5s infinite",
        "fade-up": "fade-up 0.55s cubic-bezier(0.22,1,0.36,1) both",
        "glow-live": "glow-live 1.8s ease-in-out infinite",
        "glow-champion": "glow-champion 2.4s ease-in-out infinite",
        float: "float 5s ease-in-out infinite",
        "gradient-x": "gradient-x 6s ease infinite",
        "spin-slow": "spin-slow 22s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
