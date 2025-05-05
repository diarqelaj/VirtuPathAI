const plugin = require('tailwindcss/plugin');

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.stroke-dasharray-40': {
          strokeDasharray: '40',
        },
        '.stroke-dashoffset-0': {
          strokeDashoffset: '0',
        },
        '.stroke-dashoffset-40': {
          strokeDashoffset: '40',
        },
      });
    }),
  ],
};
