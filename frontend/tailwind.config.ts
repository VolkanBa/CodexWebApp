import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        suit: {
          purple: "#6d35d8",
          purpleDark: "#25113f",
          orange: "#ff7a1a",
          green: "#32d45d",
          black: "#08070d"
        }
      },
      boxShadow: {
        glow: "0 24px 80px rgba(109, 53, 216, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
