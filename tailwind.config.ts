import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      borderRadius: {
        'dawn-lg': '0.875rem',
        'dawn-xl': '1.25rem',
      },
      boxShadow: {
        dawn: '0 22px 60px rgba(15, 23, 42, 0.10)',
        'dawn-sm': '0 10px 30px rgba(15, 23, 42, 0.10)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config
