import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './app/**/*.{vue,js,ts}',
    './app.vue',
    './error.vue',
    './content/**/*.md',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: 'var(--ink)',
          soft: 'var(--ink-soft)',
          softer: 'var(--ink-softer)',
        },
        line: {
          DEFAULT: 'var(--line)',
          strong: 'var(--line-strong)',
        },
        paper: {
          DEFAULT: 'var(--paper)',
          soft: 'var(--paper-soft)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          soft: 'var(--accent-soft)',
          deep: 'var(--accent-deep)',
        },
        textc: {
          DEFAULT: 'var(--text)',
          dim: 'var(--text-dim)',
          muted: 'var(--muted)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display': 'var(--fs-display)',
        'h1-fluid': 'var(--fs-h1)',
        'h2-fluid': 'var(--fs-h2)',
        'h3-fluid': 'var(--fs-h3)',
        'lead': 'var(--fs-lead)',
      },
      borderRadius: {
        xs: 'var(--r-xs)',
        sm: 'var(--r-sm)',
        md: 'var(--r-md)',
        lg: 'var(--r-lg)',
        xl: 'var(--r-xl)',
      },
      transitionTimingFunction: {
        'out-expo': 'var(--ease-out)',
        'in-out-expo': 'var(--ease-in-out)',
      },
      maxWidth: {
        container: '1280px',
      },
      animation: {
        'marquee': 'marquee 40s linear infinite',
        'marquee-slow': 'marquee 80s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
}
