import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        fm: {
          navy: '#1a2236',
          'panel-dark': '#2d3748',
          'panel-mid': '#4a5568',
          'panel-light': '#718096',
          gold: '#d69e2e',
          'gold-light': '#ecc94b',
          green: '#38a169',
          'green-light': '#68d391',
          red: '#e53e3e',
          'red-light': '#fc8181',
          amber: '#dd6b20',
          blue: '#3182ce',
          'text-primary': '#e2e8f0',
          'text-secondary': '#a0aec0',
          'text-muted': '#718096',
          border: '#4a5568',
          'border-light': '#718096',
        },
      },
    },
  },
  plugins: [],
}

export default config
