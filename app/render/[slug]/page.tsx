import { Suspense } from 'react'
import { GenericRenderContent } from '@/components/shared/GenericRenderContent'
import { TEMPLATE_REGISTRY, type RenderField } from '@/lib/template-registry'
import colorsJson from '@/public/assets/brand-config/colors.json'
import typographyJson from '@/public/assets/brand-config/typography.json'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import type { TemplateType } from '@/types'
import {
  parseString,
  parseBoolTrue,
  parseBoolFalse,
  parseNumber,
  parseNumberOrUndefined,
  parseEnum,
  parseStringOrNull,
  parseInt_,
  type SearchParams,
} from '@/lib/render-params'

const colorsConfig = colorsJson as ColorsConfig
const typographyConfig = typographyJson as TypographyConfig

/**
 * Parse a single field from URL search params using the schema definition.
 */
function parseField(searchParams: SearchParams, field: RenderField): unknown {
  switch (field.parser) {
    case 'string':
      return parseString(searchParams, field.param, (field.default as string) ?? '')
    case 'boolTrue':
      return parseBoolTrue(searchParams, field.param)
    case 'boolFalse':
      return parseBoolFalse(searchParams, field.param)
    case 'number':
      return parseNumber(searchParams, field.param, (field.default as number) ?? 0)
    case 'numberOrUndefined':
      return parseNumberOrUndefined(searchParams, field.param)
    case 'enum':
      return parseEnum(searchParams, field.param, (field.default as string) ?? '')
    case 'stringOrNull':
      return parseStringOrNull(searchParams, field.param)
    case 'int':
      return parseInt_(searchParams, field.param, (field.default as number) ?? 0)
    default:
      return parseString(searchParams, field.param, '')
  }
}

export default function DynamicRenderPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const templateType = params.slug as TemplateType
  const entry = TEMPLATE_REGISTRY[templateType]

  // If template not in registry or has no schema, show nothing
  // (custom templates like solution-overview-pdf have their own static routes)
  if (!entry?.renderSchema) {
    return <div>Template not found: {params.slug}</div>
  }

  const schema = entry.renderSchema

  // Step 1: Parse all declared fields from URL params
  const parsed: Record<string, unknown> = {}
  for (const field of schema.fields) {
    parsed[field.param] = parseField(searchParams, field)
  }

  // Step 2: Run custom prop assembly if defined (image positions, speakers, CTA fallback, etc.)
  const assembled = schema.assembleProps
    ? schema.assembleProps(parsed, searchParams)
    : {}

  // Step 3: Merge parsed fields + assembled props + brand config
  const props: Record<string, unknown> = {
    ...parsed,
    ...assembled,
    colors: colorsConfig,
    typography: typographyConfig,
    scale: 1,
  }

  // Step 4: Compute background color
  const background = schema.dynamicBackground
    ? schema.dynamicBackground(parsed)
    : schema.background

  return (
    <div
      style={{
        width: schema.width,
        height: schema.height,
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        ...(background ? { background } : {}),
      }}
    >
      <Suspense
        fallback={
          <div
            style={{
              width: schema.width,
              height: schema.height,
              ...(background ? { background } : {}),
            }}
          >
            Loading...
          </div>
        }
      >
        <GenericRenderContent Component={entry.component} props={props} />
      </Suspense>
    </div>
  )
}
