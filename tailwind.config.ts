import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        airport: {
          green: "#00AAB5",
          blue: "#5785C5",
          yellow: "#F99D1B",
          black: "#221E1F",
          bg: "#f5f8fa",
          card: "#ffffff",
        },
      },
      fontFamily: {
        pretendard: ["Pretendard", "sans-serif"],
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        blink: "blink 1.2s step-start infinite",
      },
    },
  },
  plugins: [],
};
export default config;
