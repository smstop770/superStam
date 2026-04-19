/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef3f8',
          100: '#d5e3ef',
          500: '#1b4f72',
          600: '#164060',
          700: '#0f2d44',
          DEFAULT: '#1b4f72',
        },
        gold: {
          300: '#e8d28a',
          400: '#d4b96a',
          500: '#c9a84c',
          600: '#a8893a',
          DEFAULT: '#c9a84c',
        },
        cream: '#fafaf5',
      },
      fontFamily: {
        hebrew: ['"Noto Serif Hebrew"', 'serif'],
      },
    },
  },
  plugins: [],
};
