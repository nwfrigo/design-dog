// Brand configuration loader
// In development, these are loaded from public/assets/brand-config/
// In production, they could be loaded from a CMS or database

export interface SolutionConfig {
  color: string
  label: string
}

export interface ColorsConfig {
  brand: {
    primary: string
    primaryDark: string
    black: string
    white: string
  }
  solutions: Record<string, SolutionConfig>
  ui: {
    border: string
    borderHighContrast: string
    textPrimary: string
    textSecondary: string
    surface: string
    surfaceSecondary: string
  }
}

export interface TypographyConfig {
  fontFamily: {
    primary: string
    fallback: string
  }
  fontWeights: {
    blond: number
    light: number
    book: number
    regular: number
    medium: number
    semibold: number
    bold: number
  }
  templates: {
    websiteThumbnail: {
      eyebrow: {
        fontSize: number
        fontWeight: number
        letterSpacing: string
        textTransform: string
      }
      headline: {
        fontSize: number
        fontWeightLight: number
        fontWeightHeavy: number
        lineHeight: string
      }
      subhead: {
        fontSize: number
        fontWeight: number
        lineHeight: number
      }
      body: {
        fontSize: number
        fontWeight: number
        lineHeight: number
      }
      pill: {
        fontSize: number
        fontWeight: number
        letterSpacing: string
        textTransform: string
      }
    }
  }
}

export interface VoiceExample {
  type: 'headline' | 'body' | 'cta'
  content: string
  context?: string
}

export interface VoiceConfig {
  companyName: string
  profile: {
    summary: string
    toneDescriptors: string[]
    vocabularyPatterns: string[]
    structureNotes: string[]
    doAndDonts: {
      do: string[]
      dont: string[]
    }
  }
  examples: VoiceExample[]
}

// Default configs (loaded at build time for server components)
// These will be overwritten when fetched from the JSON files
let colorsConfig: ColorsConfig | null = null
let typographyConfig: TypographyConfig | null = null
let voiceConfig: VoiceConfig | null = null

// Client-side fetch functions
export async function fetchColorsConfig(): Promise<ColorsConfig> {
  if (typeof window === 'undefined') {
    // Server-side: import directly
    const config = await import('@/public/assets/brand-config/colors.json')
    return config.default as ColorsConfig
  }

  if (colorsConfig) return colorsConfig

  const response = await fetch('/assets/brand-config/colors.json')
  colorsConfig = await response.json()
  return colorsConfig!
}

export async function fetchTypographyConfig(): Promise<TypographyConfig> {
  if (typeof window === 'undefined') {
    const config = await import('@/public/assets/brand-config/typography.json')
    return config.default as TypographyConfig
  }

  if (typographyConfig) return typographyConfig

  const response = await fetch('/assets/brand-config/typography.json')
  typographyConfig = await response.json()
  return typographyConfig!
}

export async function fetchVoiceConfig(): Promise<VoiceConfig> {
  if (typeof window === 'undefined') {
    const config = await import('@/public/assets/brand-config/voice.json')
    return config.default as VoiceConfig
  }

  if (voiceConfig) return voiceConfig

  const response = await fetch('/assets/brand-config/voice.json')
  voiceConfig = await response.json()
  return voiceConfig!
}

// Synchronous getters for client components (after initial fetch)
export function getColorsConfig(): ColorsConfig | null {
  return colorsConfig
}

export function getTypographyConfig(): TypographyConfig | null {
  return typographyConfig
}

export function getVoiceConfig(): VoiceConfig | null {
  return voiceConfig
}

// Helper to get solution colors as a simple object
export function getSolutionColors(config: ColorsConfig): Record<string, string> {
  const colors: Record<string, string> = {}
  for (const [key, value] of Object.entries(config.solutions)) {
    colors[key] = value.color
  }
  return colors
}

// Helper to get solution labels
export function getSolutionLabels(config: ColorsConfig): Record<string, string> {
  const labels: Record<string, string> = {}
  for (const [key, value] of Object.entries(config.solutions)) {
    labels[key] = value.label
  }
  return labels
}
