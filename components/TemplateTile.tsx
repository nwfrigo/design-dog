'use client'

import { useState, useEffect, useMemo } from 'react'
import type { TemplateInfo } from '@/lib/template-config'
import type { TemplateType } from '@/types'
import { TEMPLATE_DIMENSIONS } from '@/lib/template-config'
import { fetchColorsConfig, fetchTypographyConfig, type ColorsConfig, type TypographyConfig } from '@/lib/brand-config'

// Import all template components
import { EmailGrid, type GridDetail } from '@/components/templates/EmailGrid'
import { EmailImage } from '@/components/templates/EmailImage'
import { EmailDarkGradient } from '@/components/templates/EmailDarkGradient'
import { EmailSpeakers } from '@/components/templates/EmailSpeakers'
import { SocialDarkGradient } from '@/components/templates/SocialDarkGradient'
import { SocialBlueGradient } from '@/components/templates/SocialBlueGradient'
import { SocialImage } from '@/components/templates/SocialImage'
import { SocialGridDetail } from '@/components/templates/SocialGridDetail'
import { WebsiteThumbnail } from '@/components/templates/WebsiteThumbnail'
import { NewsletterDarkGradient } from '@/components/templates/NewsletterDarkGradient'
import { NewsletterBlueGradient } from '@/components/templates/NewsletterBlueGradient'
import { NewsletterLight } from '@/components/templates/NewsletterLight'

interface TemplateTileProps {
  template: TemplateInfo
  isSelected: boolean
  onToggle: () => void
}

// Placeholder image URLs for previews - matching what users see in editor
const PLACEHOLDER_IMAGES = {
  email: '/assets/images/email-image-placeholder.png',
  social: '/assets/images/social-image-placeholder.png',
  speaker1: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  speaker2: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
  speaker3: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop',
}

// Default content for previews
const PREVIEW_CONTENT = {
  headline: 'Headline',
  subhead: 'Subheadline text here',
  body: 'Body copy goes here.',
  cta: 'Learn More',
  eyebrow: 'EYEBROW',
}

// Render a template with default preview content
function TemplateRenderer({
  templateType,
  colors,
  typography,
  scale = 1
}: {
  templateType: TemplateType
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}) {
  const commonProps = { colors, typography, scale }

  switch (templateType) {
    case 'email-grid':
      return (
        <EmailGrid
          {...commonProps}
          headline={PREVIEW_CONTENT.headline}
          body={PREVIEW_CONTENT.body}
          showEyebrow={true}
          eyebrow={PREVIEW_CONTENT.eyebrow}
          showLightHeader={true}
          showHeavyHeader={false}
          showSubheading={false}
          showBody={false}
          showSolutionSet={true}
          solution="safety"
          logoColor="orange"
          showGridDetail2={true}
          gridDetail1={{ type: 'data', text: '150+ Sessions' }}
          gridDetail2={{ type: 'data', text: '50 Speakers' }}
          gridDetail3={{ type: 'cta', text: 'Register Now' }}
        />
      )

    case 'email-image':
      return (
        <EmailImage
          {...commonProps}
          headline={PREVIEW_CONTENT.headline}
          body={PREVIEW_CONTENT.body}
          ctaText={PREVIEW_CONTENT.cta}
          imageUrl={PLACEHOLDER_IMAGES.email}
          layout="even"
          solution="safety"
          logoColor="orange"
          showBody={false}
          showCta={true}
          showSolutionSet={true}
        />
      )

    case 'email-dark-gradient':
      return (
        <EmailDarkGradient
          {...commonProps}
          headline={PREVIEW_CONTENT.headline}
          eyebrow={PREVIEW_CONTENT.eyebrow}
          subheading={PREVIEW_CONTENT.subhead}
          body={PREVIEW_CONTENT.body}
          ctaText={PREVIEW_CONTENT.cta}
          colorStyle="1"
          alignment="left"
          ctaStyle="link"
          showEyebrow={true}
          showSubheading={false}
          showBody={false}
          showCta={true}
        />
      )

    case 'email-speakers':
      return (
        <EmailSpeakers
          {...commonProps}
          headline={PREVIEW_CONTENT.headline}
          eyebrow={PREVIEW_CONTENT.eyebrow}
          body={PREVIEW_CONTENT.body}
          ctaText={PREVIEW_CONTENT.cta}
          solution="safety"
          logoColor="orange"
          showEyebrow={true}
          showBody={false}
          showCta={true}
          showSolutionSet={true}
          speakerCount={3}
          speaker1={{ name: 'Jane Smith', role: 'CEO', imageUrl: PLACEHOLDER_IMAGES.speaker1, imagePosition: { x: 50, y: 50 }, imageZoom: 1 }}
          speaker2={{ name: 'John Doe', role: 'CTO', imageUrl: PLACEHOLDER_IMAGES.speaker2, imagePosition: { x: 50, y: 50 }, imageZoom: 1 }}
          speaker3={{ name: 'Alex Chen', role: 'VP Safety', imageUrl: PLACEHOLDER_IMAGES.speaker3, imagePosition: { x: 50, y: 50 }, imageZoom: 1 }}
        />
      )

    case 'social-dark-gradient':
      return (
        <SocialDarkGradient
          {...commonProps}
          eyebrow={PREVIEW_CONTENT.eyebrow}
          headline={PREVIEW_CONTENT.headline}
          subhead={PREVIEW_CONTENT.subhead}
          body={PREVIEW_CONTENT.body}
          metadata=""
          ctaText={PREVIEW_CONTENT.cta}
          colorStyle="1"
          headingSize="M"
          alignment="left"
          ctaStyle="link"
          logoColor="white"
          showEyebrow={true}
          showSubhead={true}
          showBody={false}
          showMetadata={false}
          showCta={true}
        />
      )

    case 'social-blue-gradient':
      return (
        <SocialBlueGradient
          {...commonProps}
          eyebrow={PREVIEW_CONTENT.eyebrow}
          headline={PREVIEW_CONTENT.headline}
          subhead={PREVIEW_CONTENT.subhead}
          body={PREVIEW_CONTENT.body}
          metadata=""
          ctaText={PREVIEW_CONTENT.cta}
          colorStyle="1"
          headingSize="M"
          alignment="left"
          ctaStyle="link"
          showEyebrow={true}
          showSubhead={true}
          showBody={false}
          showMetadata={false}
          showCta={true}
        />
      )

    case 'social-image':
      return (
        <SocialImage
          {...commonProps}
          headline={PREVIEW_CONTENT.headline}
          subhead={PREVIEW_CONTENT.subhead}
          metadata=""
          ctaText={PREVIEW_CONTENT.cta}
          imageUrl={PLACEHOLDER_IMAGES.social}
          layout="even"
          solution="safety"
          logoColor="orange"
          showSubhead={false}
          showMetadata={false}
          showCta={true}
          showSolutionSet={true}
        />
      )

    case 'social-grid-detail':
      return (
        <SocialGridDetail
          {...commonProps}
          headline={PREVIEW_CONTENT.headline}
          subhead={PREVIEW_CONTENT.subhead}
          eyebrow={PREVIEW_CONTENT.eyebrow}
          showEyebrow={true}
          showSubhead={false}
          showSolutionSet={true}
          solution="safety"
          logoColor="orange"
          showRow3={true}
          showRow4={true}
          gridDetail1={{ type: 'data', text: '150+ Sessions' }}
          gridDetail2={{ type: 'data', text: '50 Speakers' }}
          gridDetail3={{ type: 'data', text: '3 Days' }}
          gridDetail4={{ type: 'cta', text: 'Register Now' }}
        />
      )

    case 'website-thumbnail':
      return (
        <WebsiteThumbnail
          {...commonProps}
          eyebrow={PREVIEW_CONTENT.eyebrow}
          headline={PREVIEW_CONTENT.headline}
          subhead={PREVIEW_CONTENT.subhead}
          body={PREVIEW_CONTENT.body}
          solution="safety"
          imageUrl={PLACEHOLDER_IMAGES.social}
          showEyebrow={true}
          showSubhead={false}
          showBody={false}
          logoColor="orange"
        />
      )

    case 'newsletter-dark-gradient':
      return (
        <NewsletterDarkGradient
          {...commonProps}
          eyebrow={PREVIEW_CONTENT.eyebrow}
          headline={PREVIEW_CONTENT.headline}
          body={PREVIEW_CONTENT.body}
          ctaText={PREVIEW_CONTENT.cta}
          colorStyle="1"
          imageSize="none"
          imageUrl={null}
          showEyebrow={true}
          showBody={false}
          showCta={true}
        />
      )

    case 'newsletter-blue-gradient':
      return (
        <NewsletterBlueGradient
          {...commonProps}
          eyebrow={PREVIEW_CONTENT.eyebrow}
          headline={PREVIEW_CONTENT.headline}
          body={PREVIEW_CONTENT.body}
          ctaText={PREVIEW_CONTENT.cta}
          colorStyle="1"
          imageSize="none"
          imageUrl={null}
          showEyebrow={true}
          showBody={false}
          showCta={true}
        />
      )

    case 'newsletter-light':
      return (
        <NewsletterLight
          {...commonProps}
          eyebrow={PREVIEW_CONTENT.eyebrow}
          headline={PREVIEW_CONTENT.headline}
          body={PREVIEW_CONTENT.body}
          ctaText={PREVIEW_CONTENT.cta}
          imageSize="none"
          imageUrl={null}
          showEyebrow={true}
          showBody={false}
          showCta={true}
        />
      )

    default:
      return null
  }
}

// Preview Modal Component
function PreviewModal({
  template,
  colors,
  typography,
  onClose
}: {
  template: TemplateInfo
  colors: ColorsConfig
  typography: TypographyConfig
  onClose: () => void
}) {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Modal content */}
      <div className="relative max-w-[90vw] max-h-[90vh] overflow-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Template name */}
        <div className="absolute -top-10 left-0 text-white/80 text-sm font-medium">
          {template.label} <span className="text-white/50">({template.dimensions})</span>
        </div>

        {/* Template preview at full size */}
        <div
          className="rounded-lg overflow-hidden shadow-2xl bg-white"
          style={{ width: template.width, height: template.height }}
        >
          <TemplateRenderer
            templateType={template.type as TemplateType}
            colors={colors}
            typography={typography}
            scale={1}
          />
        </div>
      </div>
    </div>
  )
}

export function TemplateTile({ template, isSelected, onToggle }: TemplateTileProps) {
  const [colors, setColors] = useState<ColorsConfig | null>(null)
  const [typography, setTypography] = useState<TypographyConfig | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    Promise.all([fetchColorsConfig(), fetchTypographyConfig()])
      .then(([c, t]) => {
        setColors(c)
        setTypography(t)
      })
  }, [])

  // Calculate preview scale to fit width (target width for tile preview)
  const targetWidth = 240
  const previewScale = targetWidth / template.width
  const previewHeight = Math.round(template.height * previewScale)

  return (
    <>
      <div
        className={`
          group relative flex flex-col rounded-xl overflow-hidden transition-all duration-200
          border-2
          ${isSelected
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
          }
        `}
      >
        {/* Preview area - click to select */}
        <button
          onClick={onToggle}
          className="relative overflow-hidden bg-gray-100 dark:bg-gray-800/50"
          style={{ height: previewHeight + 24, padding: 12 }}
        >
          {/* Scaled template preview */}
          <div
            className="rounded overflow-hidden shadow-sm bg-white [&_*]:!text-left"
            style={{
              width: targetWidth,
              height: previewHeight,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {colors && typography ? (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: template.width,
                  height: template.height,
                  transform: `scale(${previewScale})`,
                  transformOrigin: 'top left',
                }}
              >
                <TemplateRenderer
                  templateType={template.type as TemplateType}
                  colors={colors}
                  typography={typography}
                  scale={1}
                />
              </div>
            ) : (
              <div
                className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded"
                style={{ width: targetWidth, height: previewHeight }}
              />
            )}
          </div>

          {/* Selection checkmark */}
          {isSelected && (
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </button>

        {/* Info area */}
        <div className="px-3 py-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <span className={`text-sm font-medium truncate block ${
              isSelected
                ? 'text-blue-700 dark:text-blue-300'
                : 'text-gray-900 dark:text-gray-100'
            }`}>
              {template.label}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
              {template.dimensions}
            </span>
          </div>

          {/* Preview button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowPreview(true)
            }}
            className="flex-shrink-0 px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400
              hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30
              rounded transition-colors"
          >
            Preview
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && colors && typography && (
        <PreviewModal
          template={template}
          colors={colors}
          typography={typography}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  )
}

// Coming soon placeholder tile
export function ComingSoonTile({ label }: { label: string }) {
  return (
    <div className="flex flex-col rounded-xl overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 opacity-60">
      {/* Preview area placeholder */}
      <div className="h-32 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">Coming soon</span>
        </div>
      </div>

      {/* Info area */}
      <div className="px-3 py-2.5 border-t border-gray-100 dark:border-gray-800">
        <span className="text-sm font-medium text-gray-400 dark:text-gray-500">{label}</span>
      </div>
    </div>
  )
}

// Request new template tile
export function RequestTemplateTile({ channelName }: { channelName: string }) {
  return (
    <button
      onClick={() => {
        // Future: Open a modal or form to request a new template
        alert(`Request a new ${channelName} template - Coming soon!`)
      }}
      className="flex flex-col rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
    >
      {/* Preview area */}
      <div className="flex-1 min-h-[136px] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 flex items-center justify-center transition-colors">
            <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            Request new template
          </span>
        </div>
      </div>

      {/* Info area - matches other tiles */}
      <div className="px-3 py-2.5 border-t border-gray-100 dark:border-gray-800">
        <span className="text-sm text-gray-400 dark:text-gray-500">
          Need something different?
        </span>
      </div>
    </button>
  )
}
