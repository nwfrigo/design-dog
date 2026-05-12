'use client'

import { CSSProperties, type ReactNode } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import type { StackAlign } from '@/types'
import { CorityLogo } from '@/components/shared/CorityLogo'
import { SolutionPill } from '@/components/shared/SolutionPill'
import { useGrayscaleImage } from '@/hooks/useGrayscaleImage'
import { ArrowIcon } from '@/components/shared/ArrowIcon'
import { TEMPLATE_THEMES, type TemplateTheme } from '@/lib/template-themes'
import {
  ContentStack,
  type ContentStackBlock,
} from '@/components/canvas-editor/ContentStack'
import {
  NEUTRAL_FILTERS,
  applyGrayscaleBoolean,
  filtersToCss,
  type ImageFilters,
} from '@/lib/image-filters'

export interface WebinarSpeakerInfo {
  name: string
  role: string
  imageUrl: string
  imagePosition: { x: number; y: number }
  imageZoom: number
}

export type WebinarVariant = 'none' | 'image' | 'speakers'

/** Editable block IDs. The `speakers` block is a panel-level slot that
 *  contains 3 speaker rows internally; per-speaker editing is deferred
 *  (mirrors how EmailSpeakers initially shipped). */
export type WebsiteWebinarBlockId =
  | 'logo'
  | 'solutionPill'
  | 'eyebrow'
  | 'headline'
  | 'subhead'
  | 'body'
  | 'cta'
  | 'image'
  | 'speakers'

type WebsiteWebinarStackId = Exclude<WebsiteWebinarBlockId, 'image' | 'solutionPill' | 'speakers'>

export interface WebsiteWebinarProps {
  eyebrow: string
  headline: string
  subhead: string
  body: string
  cta: string
  solution: string
  variant: WebinarVariant
  imageUrl?: string
  imagePosition?: { x: number; y: number }
  imageZoom?: number
  imageFilters?: ImageFilters
  showEyebrow: boolean
  showHeadline?: boolean
  showSubhead: boolean
  showBody: boolean
  showCta: boolean
  grayscale?: boolean
  theme?: TemplateTheme
  speaker1: WebinarSpeakerInfo
  speaker2: WebinarSpeakerInfo
  speaker3: WebinarSpeakerInfo
  showSpeaker1?: boolean
  showSpeaker2?: boolean
  showSpeaker3?: boolean
  headlineFontSize?: number
  subheadFontSize?: number
  stackAlign?: StackAlign
  gaps?: Record<string, number>
  renderSpacerBetween?: (
    gapKey: string,
    value: number,
    prevId: WebsiteWebinarStackId,
    nextId: WebsiteWebinarStackId,
  ) => ReactNode
  renderBlock?: (blockId: WebsiteWebinarBlockId, content: ReactNode) => ReactNode
  renderInlineEditor?: (blockId: WebsiteWebinarBlockId, defaultInner: ReactNode) => ReactNode
  renderOverlay?: () => ReactNode
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

const DEFAULT_GAP = 25.10

function SpeakerAvatar({
  imageUrl,
  position,
  zoom,
  size = 48,
  speakerIndex,
  grayscale = false,
}: {
  imageUrl: string
  position: { x: number; y: number }
  zoom: number
  size?: number
  speakerIndex: number
  grayscale?: boolean
}) {
  const grayscaleImageUrl = useGrayscaleImage(imageUrl, grayscale)

  const containerStyle: CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    overflow: 'hidden',
    position: 'relative',
    flexShrink: 0,
    backgroundColor: '#333',
  }

  const imageStyle: CSSProperties = {
    position: 'absolute',
    width: `${100 * zoom}%`,
    height: `${100 * zoom}%`,
    objectFit: 'cover',
    left: `${50 + position.x}%`,
    top: `${50 + position.y}%`,
    transform: 'translate(-50%, -50%)',
    filter: grayscale ? (grayscaleImageUrl ? 'none' : 'grayscale(100%)') : 'none',
  }

  if (!imageUrl) {
    return <div style={containerStyle} />
  }

  return (
    <div style={containerStyle}>
      <img
        src={grayscaleImageUrl || imageUrl}
        alt=""
        data-export-image="true"
        data-speaker={speakerIndex}
        style={imageStyle}
      />
    </div>
  )
}

export function WebsiteWebinar({
  eyebrow,
  headline,
  subhead,
  body,
  cta,
  solution,
  variant = 'image',
  imageUrl = '/placeholder-mountain.jpg',
  imagePosition = { x: 0, y: 0 },
  imageZoom = 1,
  imageFilters = NEUTRAL_FILTERS,
  showEyebrow,
  showHeadline = true,
  showSubhead,
  showBody,
  showCta,
  grayscale = false,
  theme = 'dark',
  speaker1,
  speaker2,
  speaker3,
  showSpeaker1 = true,
  showSpeaker2 = true,
  showSpeaker3 = true,
  headlineFontSize: headlineFontSizeProp,
  subheadFontSize,
  stackAlign = 'top',
  gaps,
  renderSpacerBetween,
  renderBlock,
  renderInlineEditor,
  renderOverlay,
  colors,
  typography,
  scale = 1,
}: WebsiteWebinarProps) {
  const wrapBlock = renderBlock ?? ((_id, content) => content)
  const themeColors = TEMPLATE_THEMES[theme]
  const solutionConfig = colors.solutions[solution] || colors.solutions.safety
  const solutionColor = solutionConfig.color
  const solutionLabel = solutionConfig.label

  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`

  const grayscaleImageUrl = useGrayscaleImage(imageUrl, grayscale && variant === 'image')

  const effectiveFilters = applyGrayscaleBoolean(imageFilters, grayscale)
  const filterCss = filtersToCss(effectiveFilters)
  const filterCssNoSat =
    filterCss && grayscaleImageUrl
      ? filtersToCss({ ...effectiveFilters, saturation: 0 })
      : undefined
  const imageFilterStyle =
    grayscaleImageUrl && filterCssNoSat ? filterCssNoSat :
    grayscaleImageUrl ? 'none' :
    filterCss ? filterCss :
    grayscale ? 'grayscale(100%)' : 'none'

  const defaultHeadlineFontSize = variant === 'none' ? 54 : 35.42
  const headlineFontSize = headlineFontSizeProp ?? defaultHeadlineFontSize
  const headlineLineHeight = `${headlineFontSize * (50.20 / defaultHeadlineFontSize)}px`

  const containerStyle: CSSProperties = {
    width: 800,
    height: 450,
    padding: 33.33,
    paddingRight: variant === 'image' ? 0 : 33.33,
    position: 'relative',
    background: themeColors.backgroundPrimary,
    overflow: 'hidden',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: variant === 'image' ? 10.42 : 28,
  }

  const speakers: (WebinarSpeakerInfo & { speakerIndex: number })[] = []
  if (showSpeaker1) speakers.push({ ...speaker1, speakerIndex: 1 })
  if (showSpeaker2) speakers.push({ ...speaker2, speakerIndex: 2 })
  if (showSpeaker3) speakers.push({ ...speaker3, speakerIndex: 3 })

  const headerNode: ReactNode = (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 49.70, flexShrink: 0 }}>
      {wrapBlock('logo', (
        <CorityLogo fill={themeColors.logoFill} height={29} />
      ))}
      {solution !== 'none' && wrapBlock('solutionPill', (
        <SolutionPill
          variant="website-dark"
          solutionColor={solutionColor}
          solutionLabel={solutionLabel}
          textColor={themeColors.textPrimary}
          background={themeColors.bgCategoryChip}
          border={`0.79px solid ${themeColors.borderFocus}`}
        />
      ))}
    </div>
  )

  const blocks: ContentStackBlock<WebsiteWebinarStackId>[] = [
    {
      id: 'eyebrow',
      visible: showEyebrow,
      defaultInner: eyebrow || 'Eyebrow',
      renderChrome: (inner) => (
        <div style={{
          alignSelf: 'stretch',
          color: themeColors.textPrimary,
          fontSize: 14,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: 1.38,
        }}>{inner}</div>
      ),
    },
    {
      id: 'headline',
      visible: !!showHeadline,
      defaultInner: headline || 'Headline',
      renderChrome: (inner) => (
        <div style={{
          alignSelf: 'stretch',
          color: themeColors.textPrimary,
          fontSize: headlineFontSize,
          fontWeight: 350,
          lineHeight: headlineLineHeight,
        }}>{inner}</div>
      ),
    },
    {
      id: 'subhead',
      visible: showSubhead,
      defaultInner: subhead || 'Subheadline',
      renderChrome: (inner) => (
        <div style={{
          alignSelf: 'stretch',
          color: themeColors.textPrimary,
          fontSize: subheadFontSize ?? 22,
          fontWeight: 350,
        }}>{inner}</div>
      ),
    },
    {
      id: 'body',
      visible: showBody,
      defaultInner: body || 'Body copy goes here.',
      renderChrome: (inner) => (
        <div style={{
          alignSelf: 'stretch',
          color: themeColors.textPrimary,
          fontSize: 14.58,
          fontWeight: 350,
        }}>{inner}</div>
      ),
    },
    {
      id: 'cta',
      visible: showCta,
      defaultInner: cta || 'Call to Action',
      renderChrome: (inner) => (
        <div style={{
          display: 'inline-flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 12.50,
        }}>
          <span style={{
            textAlign: 'center',
            color: themeColors.buttonSecondaryText,
            fontSize: 18.75,
            fontWeight: 500,
            lineHeight: '18.75px',
          }}>{inner}</span>
          <ArrowIcon color={themeColors.buttonSecondaryText} width={17} height={14} viewBox="0 0 17 14" pathD="M10 1L16 7M16 7L10 13M16 7H1" strokeWidth={1.17} />
        </div>
      ),
    },
  ]

  return (
    <div style={containerStyle}>
      {/* Image on right — only for image variant. Absolute-positioned so
       *  it extends to the right edge (matches legacy layout). */}
      {variant === 'image' && wrapBlock('image', (
        <div style={{
          position: 'absolute',
          left: 467,
          top: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
        }}>
          <img
            src={grayscaleImageUrl || imageUrl}
            alt=""
            data-export-image="true"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: `${50 - imagePosition.x}% ${50 - imagePosition.y}%`,
              transform: imageZoom !== 1
                ? `translate(${imagePosition.x * (imageZoom - 1)}%, ${imagePosition.y * (imageZoom - 1)}%) scale(${imageZoom})`
                : undefined,
              transformOrigin: 'center',
              filter: imageFilterStyle,
            }}
          />
        </div>
      ))}

      {/* Left content column */}
      <div style={{
        width: variant === 'none' ? undefined : 401,
        flex: variant === 'none' ? '1 1 0' : undefined,
        alignSelf: 'stretch',
        overflow: 'hidden',
      }}>
        <ContentStack<WebsiteWebinarStackId>
          blocks={blocks}
          gaps={gaps}
          defaultGap={DEFAULT_GAP}
          renderSpacerBetween={renderSpacerBetween}
          renderBlock={renderBlock as (id: WebsiteWebinarStackId, content: ReactNode) => ReactNode}
          renderInlineEditor={renderInlineEditor as (id: WebsiteWebinarStackId, defaultInner: ReactNode) => ReactNode}
          stackAlign={stackAlign}
          topAnchor={{
            id: 'logo',
            node: headerNode,
          }}
          alignItems="flex-start"
        />
      </div>

      {/* Speakers panel — only for speakers variant. Wrapped as a single
       *  block (per-speaker editing deferred — mirrors EmailSpeakers'
       *  initial state). */}
      {variant === 'speakers' && wrapBlock('speakers', (
        <div style={{
          flex: '1 1 0',
          alignSelf: 'stretch',
          paddingLeft: 20,
          paddingRight: 20,
          background: themeColors.bgCategoryChip,
          overflow: 'hidden',
          borderRadius: 7,
          border: `0.75px solid ${themeColors.borderFocus}`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          {speakers.map((speaker, index) => (
            <div
              key={index}
              style={{
                alignSelf: 'stretch',
                flex: '1 1 0',
                display: 'inline-flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <SpeakerAvatar
                imageUrl={speaker.imageUrl}
                position={speaker.imagePosition}
                zoom={speaker.imageZoom}
                size={48}
                speakerIndex={speaker.speakerIndex}
                grayscale={grayscale}
              />
              <div style={{
                flex: '1 1 0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
              }}>
                <div style={{
                  alignSelf: 'stretch',
                  color: themeColors.textPrimary,
                  fontSize: 18,
                  fontWeight: 350,
                }}>
                  {speaker.name}
                </div>
                <div style={{
                  alignSelf: 'stretch',
                  color: themeColors.textPrimary,
                  fontSize: 12,
                  fontWeight: 350,
                  lineHeight: '16px',
                }}>
                  {speaker.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {renderOverlay?.()}
    </div>
  )
}
