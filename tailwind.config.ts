import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0c1929',
        brand: '#1e40af',
        'brand-hover': '#1d4ed8',
        gold: '#c9a227',
        ink: '#0f172a',
        muted: '#64748b',
        line: '#e2e8f0',
        surface: '#ffffff',
        canvas: '#f8fafc',
      },
      boxShadow: {
        corp: '0 4px 14px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [typography],
};

export default config;
