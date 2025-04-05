
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx,css}',
    './pages/**/*.{js,ts,jsx,tsx,mdx,css}',
    './components/**/*.{js,ts,jsx,tsx,mdx,css}',
  ],
  theme: {
    extend: {},
  },
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};