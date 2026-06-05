import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-jetbrains-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      colors: {
        darkBg: "#05070F",
        darkCard: "#0D1324",
        brandBlue: "#3B82F6",
        brandGreen: "#10B981",
        accentNeon: "#00F2FE",
        accentEmerald: "#10B981",
        accentPurple: "#8B5CF6",
      }
    },
  },
  plugins: [],
};
export default config;
