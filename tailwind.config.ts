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
        icon: {
          focus: 'rgb(var(--icon-focus) / <alpha-value>)',
          subtle: 'rgb(var(--icon-subtle) / <alpha-value>)',
        },
      },
      boxShadow: {
        // Mode-aware: light = drop shadow, dark = soft glow. Driven by CSS
        // variables defined in globals.css (:root + html.dark).
        'elevation-sm': '0 var(--elevation-sm-y) var(--elevation-sm-blur) var(--elevation-sm-color)',
        'elevation-md': '0 var(--elevation-md-y) var(--elevation-md-blur) var(--elevation-md-color)',
        'elevation-lg': '0 var(--elevation-lg-y) var(--elevation-lg-blur) var(--elevation-lg-color)',
      },
    },
  },
  plugins: [],
}
export default config
