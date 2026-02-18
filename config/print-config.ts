/**
 * Print Template Configuration
 *
 * Defines dimensions, bleed, and export settings for print-ready templates.
 * All measurements in inches, converted to pixels at export time.
 */

export interface PrintTemplateConfig {
  id: string
  name: string
  category: 'print'
  dimensions: {
    width: number      // inches
    height: number     // inches
    bleed: number      // inches (added to all sides)
  }
  dpi: 300 | 600
  sides: 1 | 2         // single or double-sided
}

/**
 * Calculate pixel dimensions for a print template at given DPI
 */
export function getPixelDimensions(config: PrintTemplateConfig, includeBleed: boolean = true) {
  const { width, height, bleed } = config.dimensions
  const { dpi } = config

  const finalWidth = includeBleed ? width + (bleed * 2) : width
  const finalHeight = includeBleed ? height + (bleed * 2) : height

  return {
    width: Math.round(finalWidth * dpi),
    height: Math.round(finalHeight * dpi),
    // For Puppeteer deviceScaleFactor calculation
    // Base render size (what the template is designed at)
    baseWidth: Math.round(finalWidth * 96),   // 96 DPI is browser default
    baseHeight: Math.round(finalHeight * 96),
    scaleFactor: dpi / 96,
  }
}

/**
 * Print template definitions
 */
export const printTemplates: Record<string, PrintTemplateConfig> = {
  'business-card': {
    id: 'business-card',
    name: 'Business Card',
    category: 'print',
    dimensions: {
      width: 3.5,      // US standard
      height: 2,
      bleed: 0.125,    // Standard bleed
    },
    dpi: 600,          // High quality for small format
    sides: 2,
  },
  // Future print templates
  // 'postcard-4x6': {
  //   id: 'postcard-4x6',
  //   name: 'Postcard (4x6)',
  //   category: 'print',
  //   dimensions: { width: 6, height: 4, bleed: 0.125 },
  //   dpi: 300,
  //   sides: 2,
  // },
  // 'card-4x4': {
  //   id: 'card-4x4',
  //   name: 'Square Card (4x4)',
  //   category: 'print',
  //   dimensions: { width: 4, height: 4, bleed: 0.125 },
  //   dpi: 300,
  //   sides: 2,
  // },
}

/**
 * Get print template config by ID
 */
export function getPrintTemplate(id: string): PrintTemplateConfig | undefined {
  return printTemplates[id]
}

/**
 * Business card specific helpers
 */
export const businessCardConfig = printTemplates['business-card']
export const businessCardPixels = getPixelDimensions(businessCardConfig, true)

// With bleed at 600 DPI:
// Width: (3.5 + 0.25) * 600 = 2250px
// Height: (2 + 0.25) * 600 = 1350px

// Base render size (96 DPI browser):
// Width: 3.75 * 96 = 360px
// Height: 2.25 * 96 = 216px
// Scale factor: 600/96 = 6.25x
