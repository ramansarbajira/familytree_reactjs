/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          // Keep your green color here
          DEFAULT: "#3f982c",
          50: "#f0f9ed",
          100: "#e0f3dd",
          200: "#c2e7b9",
          300: "#a3dc95",
          400: "#85d071",
          500: "#66c44d",
          600: "#3f982c",
          700: "#2f7321",
          800: "#1f4e16",
          900: "#10290b",
        },
        // ✅ Add Tailwind’s original blue back
        blue: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
      },
      keyframes: {
        "fade-pop": {
          "0%": { opacity: "0", transform: "scale(0.5)" },
          "30%": { opacity: "1", transform: "scale(1.2)" },
          "70%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.8)" },
        },
      },
      animation: {
        "fade-pop": "fade-pop 0.8s ease-in-out",
      },
    },
  },
  plugins: [],
};
