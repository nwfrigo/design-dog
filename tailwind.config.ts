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
          primary: 'rgb(var(--surface-primary) / <alpha-value>)',
          secondary: 'rgb(var(--surface-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--surface-tertiary) / <alpha-value>)',
          inverse: 'rgb(var(--surface-inverse) / <alpha-value>)',
        },
        content: {
          primary: 'rgb(var(--content-primary) / <alpha-value>)',
          secondary: 'rgb(var(--content-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--content-tertiary) / <alpha-value>)',
          inverse: 'rgb(var(--content-inverse) / <alpha-value>)',
          destructive: 'rgb(var(--content-destructive) / <alpha-value>)',
          success: 'rgb(var(--content-success) / <alpha-value>)',
          warning: 'rgb(var(--content-warning) / <alpha-value>)',
        },
        line: {
          subtle: 'rgb(var(--line-subtle) / <alpha-value>)',
          focus: 'rgb(var(--line-focus) / <alpha-value>)',
          destructive: 'rgb(var(--line-destructive) / <alpha-value>)',
        },
        'btn-primary': {
          DEFAULT: 'rgb(var(--btn-primary-bg) / <alpha-value>)',
          hover: 'rgb(var(--btn-primary-bg-hover) / <alpha-value>)',
          disabled: 'rgb(var(--btn-primary-bg-disabled) / <alpha-value>)',
          text: 'rgb(var(--btn-primary-text) / <alpha-value>)',
        },
        'btn-secondary': {
          DEFAULT: 'rgb(var(--btn-secondary-bg) / <alpha-value>)',
          hover: 'rgb(var(--btn-secondary-bg-hover) / <alpha-value>)',
          text: 'rgb(var(--btn-secondary-text) / <alpha-value>)',
          border: 'rgb(var(--btn-secondary-border) / <alpha-value>)',
        },
        'btn-ghost': {
          text: 'rgb(var(--btn-ghost-text) / <alpha-value>)',
        },
        interactive: {
          hover: 'rgb(var(--interactive-hover) / <alpha-value>)',
          active: 'rgb(var(--interactive-active) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
}
export default config
