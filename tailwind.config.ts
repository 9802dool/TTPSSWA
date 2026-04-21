import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontSize: {
        /** Fluid display — use with media-query layouts for responsive headings */
        'fluid-2xl': 'clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem)',
        'fluid-3xl': 'clamp(1.75rem, 1.35rem + 2vw, 2.75rem)',
        'fluid-4xl': 'clamp(2rem, 1.5rem + 2.5vw, 3.5rem)',
        'fluid-5xl': 'clamp(2.25rem, 1.6rem + 3.2vw, 4rem)',
      },
      colors: {
        navy: '#0c1929',
        /** Committee body copy — matches brand swatch #11213B (rgb 17, 33, 59). */
        'committee-ink': '#11213B',
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
