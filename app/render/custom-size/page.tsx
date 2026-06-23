import { Suspense } from 'react'
import { GenericRenderContent } from '@/components/shared/GenericRenderContent'
import { CustomSizeCanvas } from '@/components/custom-size/CustomSizeCanvas'
import {
  customSizeToProps,
  defaultCustomSizeDocument,
  type CustomSizeDocument,
  type ReusedContent,
} from '@/lib/custom-size/document'
import { resolveLayout } from '@/lib/custom-size/resolve'
import colorsJson from '@/public/assets/brand-config/colors.json'
import typographyJson from '@/public/assets/brand-config/typography.json'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { parseString, parseEnum, parseNumber, parseBoolTrue, parseBoolFalse } from '@/lib/render-params'

const colorsConfig = colorsJson as ColorsConfig
const typographyConfig = typographyJson as TypographyConfig

/**
 * Bare render route for custom-size assets — mirrors the stacker/faq/carousel
 * custom render pages (no app shell, no providers). The `customSizeConfig` param
 * is the URL-encoded JSON CustomSizeDocument; reused content (headline, image
 * settings, theme…) rides the standard export params. Output here must equal the
 * editor — both go through `customSizeToProps` + `CustomSizeCanvas`.
 */
export default function CustomSizeRenderPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  let doc: CustomSizeDocument = defaultCustomSizeDocument()
  try {
    const raw = searchParams.customSizeConfig as string | undefined
    if (raw) doc = JSON.parse(decodeURIComponent(raw)) as CustomSizeDocument
  } catch {
    /* keep default doc */
  }

  const reused: ReusedContent = {
    eyebrow: parseString(searchParams, 'eyebrow', ''),
    headline: parseString(searchParams, 'headline', ''),
    subhead: parseString(searchParams, 'subhead', ''),
    body: parseString(searchParams, 'body', ''),
    cta: parseString(searchParams, 'ctaText', ''),
    solution: parseString(searchParams, 'solution', 'none'),
    showSolutionSet: parseBoolTrue(searchParams, 'showSolutionSet'),
    showEyebrow: parseBoolTrue(searchParams, 'showEyebrow'),
    showSubhead: parseBoolTrue(searchParams, 'showSubhead'),
    showBody: parseBoolTrue(searchParams, 'showBody'),
    showCta: parseBoolTrue(searchParams, 'showCta'),
    theme: parseEnum<'light' | 'dark'>(searchParams, 'theme', 'dark'),
    grayscale: parseBoolFalse(searchParams, 'grayscale'),
    imagePosition: {
      x: parseNumber(searchParams, 'imagePositionX', 0),
      y: parseNumber(searchParams, 'imagePositionY', 0),
    },
    imageZoom: parseNumber(searchParams, 'imageZoom', 1),
    imageFilters: {
      exposure: parseNumber(searchParams, 'imageExposure', 0),
      contrast: parseNumber(searchParams, 'imageContrast', 0),
      saturation: parseNumber(searchParams, 'imageSaturation', 0),
    },
  }

  const { content, width, height, theme, overrides } = customSizeToProps(doc, reused)

  // Spacer drags persist as relative factors in doc.gapScale; convert to the
  // absolute px the renderer expects (factor × the engine's computed gap), so
  // the exported PNG matches the editor exactly.
  const layout = resolveLayout(content, width, height, overrides)
  const gaps: Record<string, number> = {}
  for (const [k, factor] of Object.entries(doc.gapScale)) {
    gaps[k] = factor * layout.gap
  }

  return (
    <div style={{ width, height, margin: 0, padding: 0, overflow: 'hidden' }}>
      <Suspense fallback={<div style={{ width, height, background: '#060015' }} />}>
        <GenericRenderContent
          Component={CustomSizeCanvas}
          props={{ content, width, height, theme, overrides, gaps, colors: colorsConfig, typography: typographyConfig, scale: 1 }}
        />
      </Suspense>
    </div>
  )
}
