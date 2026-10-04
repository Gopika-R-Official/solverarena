/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      colors: {
        background: '#0a0a0a',
        surface: '#121212',
        surfaceBorder: '#262626',
        accent: '#00ff88', // electric green
        accentHover: '#00cc6a',
        accentMuted: 'rgba(0, 255, 136, 0.1)',
        textMain: '#ffffff',
        textMuted: '#888888',
      }
    },
  },
  plugins: [],
}
