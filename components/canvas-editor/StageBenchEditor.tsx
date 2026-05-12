'use client'

import type { ComponentType } from 'react'
import type { TemplateType } from '@/types'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { DndProvider } from '@/lib/dnd'

import { EmailDarkGradientStageBench } from './template-adapters/EmailDarkGradientStageBench'
import { EmailSpeakersStageBench } from './template-adapters/EmailSpeakersStageBench'
import { EmailImageStageBench } from './template-adapters/EmailImageStageBench'
import { WebsitePressReleaseStageBench } from './template-adapters/WebsitePressReleaseStageBench'
import { SocialDarkGradientStageBench } from './template-adapters/SocialDarkGradientStageBench'
import { SocialBlueGradientStageBench } from './template-adapters/SocialBlueGradientStageBench'
import { SocialEhsAccelerateStageBench } from './template-adapters/SocialEhsAccelerateStageBench'
import { SocialImageStageBench } from './template-adapters/SocialImageStageBench'
import { SocialImageMeddbaseStageBench } from './template-adapters/SocialImageMeddbaseStageBench'
import { NewsletterDarkGradientStageBench } from './template-adapters/NewsletterDarkGradientStageBench'
import { NewsletterBlueGradientStageBench } from './template-adapters/NewsletterBlueGradientStageBench'
import { NewsletterLightStageBench } from './template-adapters/NewsletterLightStageBench'

/**
 * StageBenchEditor — thin dispatcher for the Stage & Bench editor screen.
 *
 * Each template that opts into Stage & Bench provides an adapter component
 * that owns the full inner render: store subscriptions, slot config,
 * stage-bar selectors, and the wired-up template render. This component
 * just provides the DndProvider context and routes to the right adapter.
 *
 * Adding a new template = build an adapter (or future declarative
 * descriptor) and register it in `TEMPLATE_ADAPTERS`. EditorScreen also
 * needs to add the template id to the `STAGE_BENCH_TEMPLATES` set in
 * `migrated-templates.ts` so the editor routes there at all.
 */

export interface StageBenchEditorProps {
  currentTemplate: TemplateType
  selectedAssets: TemplateType[]
  currentAssetIndex: number
  isExporting: boolean
  isEditingFromQueue: boolean
  colorsConfig: ColorsConfig
  typographyConfig: TypographyConfig
  onExport: () => void
  onAddToQueue: () => void
  onSaveToQueue: () => void
  onPreview: () => void
  onAddAsset: () => void
  onGoToAsset: (idx: number) => void
  onDeleteAsset: (idx: number) => void
  getAssetLabel: (assetType: TemplateType, index: number) => string
}

/** Registry of per-template Stage & Bench adapters. The key is the
 *  template id; the value is the React component to render. Templates
 *  not in this map fall back to the legacy editor (gated by
 *  STAGE_BENCH_TEMPLATES in migrated-templates.ts). */
const TEMPLATE_ADAPTERS: Partial<Record<TemplateType, ComponentType<StageBenchEditorProps>>> = {
  'email-dark-gradient': EmailDarkGradientStageBench,
  'email-speakers': EmailSpeakersStageBench,
  'email-image': EmailImageStageBench,
  'website-press-release': WebsitePressReleaseStageBench,
  'social-dark-gradient': SocialDarkGradientStageBench,
  'social-blue-gradient': SocialBlueGradientStageBench,
  'social-ehs-accelerate': SocialEhsAccelerateStageBench,
  'social-image': SocialImageStageBench,
  'social-image-meddbase': SocialImageMeddbaseStageBench,
  'newsletter-dark-gradient': NewsletterDarkGradientStageBench,
  'newsletter-blue-gradient': NewsletterBlueGradientStageBench,
  'newsletter-light': NewsletterLightStageBench,
}

export function StageBenchEditor(props: StageBenchEditorProps) {
  const Adapter = TEMPLATE_ADAPTERS[props.currentTemplate]
  if (!Adapter) {
    // Shouldn't happen in practice — EditorScreen gates on
    // isStageBenchTemplate(currentTemplate) before rendering this. Belt
    // and suspenders.
    return null
  }
  return (
    <DndProvider>
      <Adapter {...props} />
    </DndProvider>
  )
}
