/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FFD700',
          dark: '#E6C200',
        },
        dark: {
          DEFAULT: '#1A1A1A',
          lighter: '#2D2D2D',
        },
        brandBlue: {
          DEFAULT: '#0056B3',
          light: '#0071CE',
          dark: '#003D80',
        }
      }
    },
  },
  plugins: [],
}
