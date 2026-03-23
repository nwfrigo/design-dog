'use client'

import type { QueuedAsset } from '@/types'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { TEMPLATE_REGISTRY } from '@/lib/template-registry'

interface TemplateRendererProps {
  asset: QueuedAsset
  colorsConfig: ColorsConfig
  typographyConfig: TypographyConfig
}

export function TemplateRenderer({ asset, colorsConfig, typographyConfig }: TemplateRendererProps) {
  const entry = TEMPLATE_REGISTRY[asset.templateType]
  if (!entry) return null

  const Component = entry.component
  const props = entry.renderProps(asset, colorsConfig, typographyConfig)

  return <Component {...props} />
}
