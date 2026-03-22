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
        ink: "var(--fg)",
        muted: "var(--muted)",
        canvas: "var(--bg)",
        surface: "var(--surface)",
        line: "var(--border)",
        navy: "var(--navy)",
        "navy-muted": "var(--navy-muted)",
        brand: "var(--brand)",
        "brand-hover": "var(--brand-hover)",
        "brand-subtle": "var(--brand-subtle)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        corp: "0 1px 3px 0 rgb(15 23 42 / 0.06), 0 1px 2px -1px rgb(15 23 42 / 0.06)",
        "corp-md":
          "0 4px 6px -1px rgb(15 23 42 / 0.07), 0 2px 4px -2px rgb(15 23 42 / 0.05)",
      },
    },
  },
  plugins: [],
};
export default config;
