import type { Config } from "tailwindcss";

const config: Omit<Config, "content"> = {
  theme: {
    extend: {
      colors: {
        // Primary brand scale — Sage Green
        brand: {
          50:  "#f4f7ef",
          100: "#e6eeda",
          200: "#ccddb5",
          300: "#b4cc90",
          400: "#9bbb6b",
          500: "#8AAF6E", // Sage Green — primary
          600: "#72964d",
          700: "#5a7a3a",
          800: "#445e2d",
          900: "#2f4220",
        },
        // Accent scale — Soft Peach (CTA, connection moments, warmth)
        peach: {
          50:  "#fef9f4",
          100: "#fdf3e8",
          200: "#FAE8CC", // Soft Peach — primary CTA / accent
          300: "#f5d4a6",
          400: "#eeba76",
          500: "#e49e45",
          600: "#c47e28",
          700: "#9d621e",
          800: "#764a17",
          900: "#503210",
        },
        // Sage neutrals — surfaces and secondary elements
        sage: {
          light:   "#B8CE9E", // Light Sage — hover, secondary chips, progress fills
          surface: "#EDE8C8", // Pale Yellow-Green — card backgrounds, page surfaces
        },
      },
      fontFamily: {
        sans:    ["Inter", "sans-serif"],
        display: ["Clash Display", "sans-serif"],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)",
      },
      boxShadow: {
        brutal:    "4px 4px 0px 0px rgba(0,0,0,1)",
        "brutal-sm": "2px 2px 0px 0px rgba(0,0,0,1)",
        "brutal-lg": "8px 8px 0px 0px rgba(0,0,0,1)",
      },
    },
  },
  plugins: [],
};

export default config;
