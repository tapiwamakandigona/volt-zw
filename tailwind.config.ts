import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a", // Main brand green
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        amber: {
          400: "#fbbf24",
          500: "#f59e0b",
        },
        danger: "#dc2626",
        // Dark-first surfaces (Todoist-inspired charcoal)
        sidebar: "#16161e",
        ink: "#0e0e14", // app background (dark)
        panel: "#1a1a24", // card / panel (dark)
        surface: "#fafafa", // light page background
        card: "#ffffff",
        muted: "#8a8a99",
        border: "#26262f",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0.625rem",
        xl: "0.875rem",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.4s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
