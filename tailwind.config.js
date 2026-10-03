/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FFF9E6',
          100: '#FFF0C2',
          200: '#FFE08A',
          300: '#FFCF4D',
          400: '#F0B429',
          500: '#D99A1E',
          600: '#B37D15',
          700: '#8C610F',
          800: '#66460A',
          900: '#402C06',
        },
      },
    },
  },
  plugins: [],
}
