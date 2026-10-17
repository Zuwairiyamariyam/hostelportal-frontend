/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: '#FDF2F4',
          100: '#FBE8EB',
          200: '#F5C4CB',
          600: '#A31D31',
          700: '#801323',
          800: '#680F1D',
          900: '#4A0B14',
        }
      }
    },
  },
  plugins: [],
}