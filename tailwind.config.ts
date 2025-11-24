import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        background: '#0a0a0a',
        foreground: '#e0e0e0',
        accent: '#00ff88',
        danger: '#ff0055',
      },
    },
  },
  plugins: [],
};

export default config;
