/**
 * Template Theme System
 *
 * Maps Figma variable tokens to resolved hex values per theme.
 * This is the single source of truth — templates read from this config,
 * never hardcode theme-specific hex values.
 *
 * Token names match the Figma variable table:
 *   bg/primary, text/primary, button/secondary/text,
 *   border/focus, bg/category-chip
 */

export type TemplateTheme = 'light' | 'dark'

export interface ThemeColors {
  backgroundPrimary: string
  textPrimary: string
  buttonSecondaryText: string
  borderFocus: string
  bgCategoryChip: string
  logoFill: string
}

export const TEMPLATE_THEMES: Record<TemplateTheme, ThemeColors> = {
  light: {
    backgroundPrimary: '#FFFFFF',
    textPrimary: '#000000',
    buttonSecondaryText: '#060015',
    borderFocus: '#D9D8D6',
    bgCategoryChip: '#FFFFFF',
    logoFill: '#000000',
  },
  dark: {
    backgroundPrimary: '#060015',
    textPrimary: '#FFFFFF',
    buttonSecondaryText: '#FFFFFF',
    borderFocus: '#0080FF',
    bgCategoryChip: '#060621',
    logoFill: '#FFFFFF',
  },
}
