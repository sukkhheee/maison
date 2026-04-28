import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1320px" }
    },
    extend: {
      colors: {
        // Luxury palette
        ink: {
          DEFAULT: "#111111",
          900: "#0a0a0a",
          800: "#161616",
          700: "#1f1f1f",
          600: "#2a2a2a"
        },
        bone: {
          DEFAULT: "#F9F9F9",
          200: "#F2F0EC",
          300: "#E8E5DD"
        },
        gold: {
          DEFAULT: "#C9A96A",
          50: "#FAF5EA",
          100: "#F1E6C8",
          200: "#E2CD93",
          300: "#D3B574",
          400: "#C9A96A",
          500: "#B8954E",
          600: "#9A7A3C",
          700: "#7A5F2E"
        },
        // shadcn-compatible aliases mapped to our palette
        background: "#F9F9F9",
        foreground: "#111111",
        primary: { DEFAULT: "#111111", foreground: "#F9F9F9" },
        accent: { DEFAULT: "#C9A96A", foreground: "#111111" },
        muted: { DEFAULT: "#F2F0EC", foreground: "#5b5b5b" },
        border: "#E8E5DD",
        ring: "#C9A96A"
      },
      fontFamily: {
        // Loaded via next/font in app/layout.tsx and exposed as CSS vars
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      letterSpacing: {
        "luxury-tight": "-0.02em",
        "luxury-wide": "0.18em"
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "4px"
      },
      boxShadow: {
        soft: "0 8px 30px rgba(17,17,17,0.06)",
        gold: "0 12px 40px rgba(201,169,106,0.25)",
        ring: "0 0 0 1px rgba(201,169,106,0.5)"
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, #E2CD93 0%, #C9A96A 50%, #9A7A3C 100%)",
        "ink-fade":
          "linear-gradient(180deg, rgba(17,17,17,0.0) 0%, rgba(17,17,17,0.6) 60%, rgba(17,17,17,0.92) 100%)"
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        }
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 2.4s linear infinite"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
