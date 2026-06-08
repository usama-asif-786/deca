import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-2': 'var(--bg2)',
        'bg-3': 'var(--bg3)',
        'bg-4': 'var(--bg4)',
        border: 'var(--border)',
        'border-2': 'var(--border2)',
        text: 'var(--text)',
        'text-2': 'var(--text2)',
        'text-3': 'var(--text3)',
        orange: 'var(--orange)',
        accent: 'var(--accent)',
        'accent-bg': 'var(--accent-bg)',
        green: {
          DEFAULT: 'var(--green)',
          bg: 'var(--green-bg)',
        },
        amber: {
          DEFAULT: 'var(--amber)',
          bg: 'var(--amber-bg)',
        },
        red: {
          DEFAULT: 'var(--red)',
          bg: 'var(--red-bg)',
        },
        purple: {
          DEFAULT: 'var(--purple)',
          bg: 'var(--purple-bg)',
        },
        cyan: {
          DEFAULT: 'var(--cyan)',
          bg: 'var(--cyan-bg)',
        },
        lime: {
          DEFAULT: 'var(--lime)',
          bg: 'var(--lime-bg)',
        },
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        lg: 'var(--radius-lg)',
        full: '9999px',
      },
      boxShadow: {
        lg: 'var(--shadow-lg)',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
