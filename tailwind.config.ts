import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          primary: 'var(--surface-primary)',
          secondary: 'var(--surface-secondary)',
          tertiary: 'var(--surface-tertiary)',
          inverse: 'var(--surface-inverse)',
        },
        content: {
          primary: 'var(--content-primary)',
          secondary: 'var(--content-secondary)',
          tertiary: 'var(--content-tertiary)',
          inverse: 'var(--content-inverse)',
          destructive: 'var(--content-destructive)',
          success: 'var(--content-success)',
          warning: 'var(--content-warning)',
        },
        line: {
          subtle: 'var(--line-subtle)',
          focus: 'var(--line-focus)',
          destructive: 'var(--line-destructive)',
        },
        'btn-primary': {
          DEFAULT: 'var(--btn-primary-bg)',
          hover: 'var(--btn-primary-bg-hover)',
          disabled: 'var(--btn-primary-bg-disabled)',
          text: 'var(--btn-primary-text)',
        },
        'btn-secondary': {
          DEFAULT: 'var(--btn-secondary-bg)',
          hover: 'var(--btn-secondary-bg-hover)',
          text: 'var(--btn-secondary-text)',
          border: 'var(--btn-secondary-border)',
        },
        'btn-ghost': {
          text: 'var(--btn-ghost-text)',
        },
        interactive: {
          hover: 'var(--interactive-hover)',
          active: 'var(--interactive-active)',
        },
      },
    },
  },
  plugins: [],
}
export default config
