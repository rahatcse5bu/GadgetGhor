import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // GadgetGhor brand teal (#2C8198)
        brand: {
          50: '#f0f9fb',
          100: '#d9eef2',
          200: '#b3dce5',
          300: '#7fc1d1',
          400: '#4a9fb5',
          500: '#2c8198',
          600: '#266d82',
          700: '#235a6b',
          800: '#234a58',
          900: '#213e4a',
          950: '#11272f',
        },
        accent: {
          // warm amber for sale/CTA highlights
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(16,40,48,0.06), 0 8px 24px rgba(16,40,48,0.06)',
        cardhover: '0 4px 12px rgba(16,40,48,0.10), 0 16px 40px rgba(16,40,48,0.12)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
