/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        surface: '#121218',
        'surface-light': '#1a1a24',
        border: '#2a2a3a',
        text: '#e8e8f0',
        'text-muted': '#8888a0',
        primary: '#ACAAFF',
        accent: '#588afd',
        success: '#00a88b',
        danger: '#f85149',
        gold: '#ffe098',
        'accent-light': '#a78bfa',
      },
    },
  },
  plugins: [],
};
