/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 900: '#082D50', 800: '#0B3A63', 700: '#124a7c' },
        brand: { 600: '#0656d0', 500: '#0866F5', 100: '#d6e7ff', 50: '#EAF3FF' },
        page: '#F4F8FC',
        ink: { DEFAULT: '#102B4E', muted: '#60758F' },
        success: '#16B978',
        warning: '#F5A623',
        danger: '#EF4444',
      },
    },
  },
  plugins: [],
};
