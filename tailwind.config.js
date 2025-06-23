/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { // You can name this anything, 'primary' is common
          DEFAULT: '#3f982c', // This sets 'primary' to your main green color
          '50': '#f0f9ed',   // Lighter shades for backgrounds (optional, but good practice)
          '100': '#e0f3dd',
          '200': '#c2e7b9',
          '300': '#a3dc95',
          '400': '#85d071',
          '500': '#66c44d',
          '600': '#3f982c', // Your exact color can be at 600 or 700, whatever feels "default"
          '700': '#2f7321', // Darker shades for text/hover
          '800': '#1f4e16',
          '900': '#10290b',
        },
        // You can keep other colors or define more here (e.g., 'secondary', 'accent')
      },
    },
  },
  plugins: [],
}
