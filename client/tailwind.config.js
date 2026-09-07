/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: '#F4F1EC',
        surface: '#EFECE6',
        'surface-elevated': '#F9F8F5',
        'surface-sunken': '#E8E4DC',
        terracotta: {
          DEFAULT: '#C4623A',
          hover: '#AD522D',
          light: '#F5ECE7',
          dark: '#8C3F20',
        },
        sage: {
          DEFAULT: '#7A8B6F',
          hover: '#66755C',
          light: '#EDF1EA',
          dark: '#4F5C46',
        },
        charcoal: {
          DEFAULT: '#2C2825',
          light: '#423D38',
        },
        subtle: '#736B63',
        'border-warm': '#E2DDD3',
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'nm-flat': '6px 6px 14px #d8d3ca, -6px -6px 14px #ffffff',
        'nm-sm': '3px 3px 8px #d8d3ca, -3px -3px 8px #ffffff',
        'nm-lg': '10px 10px 24px #d4cec4, -10px -10px 24px #ffffff',
        'nm-pressed': 'inset 3px 3px 6px #d8d3ca, inset -3px -3px 6px #ffffff',
        'nm-inset-sm': 'inset 2px 2px 4px #d8d3ca, inset -2px -2px 4px #ffffff',
        'nm-terracotta': '0 6px 18px -2px rgba(196, 98, 58, 0.35)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}
