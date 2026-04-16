import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /** Homepage hero / footer — `public/Screenshot 2026-04-16 170956.png` */
        'home-hero': '#0a162b',
        /** Ticker bar: deep purple-blue */
        'home-promo': '#3d4a72',
        'home-headline': '#a5d1ff',
        'home-gold': '#e9bd43',
        navy: '#0c1929',
        /** Hover / tint surfaces (matches app/globals.css :root tokens). */
        'navy-muted': '#1e3a5f',
        'brand-subtle': '#eff6ff',
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
