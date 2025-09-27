/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#1a1b26',
          50: '#1f2028',
          100: '#24252d',
          200: '#2a2b36',
          300: '#3a3b46',
          400: '#4a4b56',
          500: '#5a5b66',
          600: '#6a6b76',
          700: '#7a7b86',
          800: '#8a8b96',
          900: '#9a9ba6',
        }
      }
    },
  },
  plugins: [],
};