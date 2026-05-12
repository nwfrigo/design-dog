'use client'

import { CSSProperties, type ReactNode } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import type { StackAlign } from '@/types'
import { CorityLogo } from '@/components/shared/CorityLogo'
import { SolutionPill } from '@/components/shared/SolutionPill'
import { ArrowIcon } from '@/components/shared/ArrowIcon'
import { useGrayscaleImage } from '@/hooks/useGrayscaleImage'
import { TEMPLATE_THEMES, type TemplateTheme } from '@/lib/template-themes'
import {
  ContentStack,
  type ContentStackBlock,
} from '@/components/canvas-editor/ContentStack'

export type EmailSpeakersBlockId =
  | 'eyebrow'
  | 'headline'
  | 'body'
  | 'cta'
  | 'solutionPill'
  | 'speaker1'
  | 'speaker2'
  | 'speaker3'

/** Logical IDs for vertical-stack endpoints (left column only). 'logo' is
 *  the always-on header anchor; solutionPill renders alongside it. */
type EmailSpeakersStackId = 'logo' | 'eyebrow' | 'headline' | 'body' | 'cta'

const DEFAULT_GAP = 24

export function emailSpeakersGapKey(
  prevId: EmailSpeakersStackId,
  nextId: EmailSpeakersStackId,
): string {
  return `gap-${prevId}-to-${nextId}`
}

export interface SpeakerInfo {
  name: string
  role: string
  imageUrl: string
  imagePosition: { x: number; y: number }
  imageZoom: number
}

export interface EmailSpeakersProps {
  headline: string
  eyebrow?: string
  body: string
  ctaText: string
  solution: string
  logoColor: 'black' | 'orange'
  showEyebrow?: boolean
  showHeadline?: boolean
  showBody: boolean
  showCta: boolean
  showSolutionSet: boolean
  grayscale?: boolean
  theme?: TemplateTheme
  /** Legacy: number of speakers to show, top-N. When `showSpeaker1/2/3`
   *  are passed (Stage & Bench mode), each speaker's visibility is
   *  independent and `speakerCount` is ignored. */
  speakerCount: 1 | 2 | 3
  showSpeaker1?: boolean
  showSpeaker2?: boolean
  showSpeaker3?: boolean
  speaker1: SpeakerInfo
  speaker2: SpeakerInfo
  speaker3: SpeakerInfo
  headlineFontSize?: number
  /** Vertical alignment for the left-side content stack (eyebrow/headline/
   *  body/cta). Logo + solutionPill stay anchored to the top. */
  stackAlign?: StackAlign
  /** Sparse gap overrides keyed via `emailSpeakersGapKey(prev, next)`. Falls
   *  back to DEFAULT_GAP per slot. */
  gaps?: Record<string, number>
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
  /** Stage & Bench render-prop: wraps each editable block in <Editable>
   *  for selection / inline edit / drag. Pass through unchanged for
   *  export. */
  renderBlock?: (blockId: EmailSpeakersBlockId, content: ReactNode) => ReactNode
  /** Stage & Bench render-prop: swaps a block's inner text for an
   *  in-place editor when that block is being edited. Returns
   *  `defaultInner` otherwise. */
  renderInlineEditor?: (blockId: EmailSpeakersBlockId, defaultInner: ReactNode) => ReactNode
  /** Stage & Bench render-prop for spacer slots in the left content stack.
   *  Editor passes a drag handle; export omits → falls back to a plain div
   *  with the configured height. */
  renderSpacerBetween?: (
    gapKey: string,
    value: number,
    prevId: EmailSpeakersStackId,
    nextId: EmailSpeakersStackId,
  ) => ReactNode
  /** Stage & Bench render-prop for the inner pieces of each speaker block
   *  (name text, role text, avatar image). Wraps the styled chrome of each
   *  piece in <Editable> so users can deep-click into the speaker group to
   *  edit a specific field. Export omits → renders defaults. */
  renderSpeakerField?: (
    speakerId: 'speaker1' | 'speaker2' | 'speaker3',
    field: 'name' | 'role' | 'image',
    defaultInner: ReactNode,
  ) => ReactNode
  /** Stage & Bench render-prop that swaps the *inner text* of a speaker's
   *  name/role with an inline editor while preserving the surrounding
   *  styled chrome. Mirrors `renderInlineEditor` for top-level blocks —
   *  this is what keeps the font size/weight stable while editing. */
  renderSpeakerFieldInline?: (
    speakerId: 'speaker1' | 'speaker2' | 'speaker3',
    field: 'name' | 'role',
    defaultInner: ReactNode,
  ) => ReactNode
  /** Stage & Bench render-prop: an absolutely-positioned overlay that
   *  shares the template's stacking context — the drag scrim renders
   *  here so it can layer between blocks via z-index. */
  renderOverlay?: () => ReactNode
}

// Check if HTML content is effectively empty (handles <p></p> etc.)
function isHtmlEmpty(html: string | undefined): boolean {
  if (!html) return true
  const stripped = html.replace(/<[^>]*>/g, '').trim()
  return stripped === ''
}

// Inline styles for rich text elements (dark text on light background)
const RICH_TEXT_STYLES = `
  .rich-text-dark strong { font-weight: 500; }
  .rich-text-dark em { font-style: italic; }
  .rich-text-dark p { margin: 0; }
  .rich-text-dark p + p { margin-top: 0.3em; }
`

// Component to render a circular speaker avatar with optional grayscale
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
    backgroundColor: '#E5E5E5',
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

type StackBlock = ContentStackBlock<EmailSpeakersStackId>

export function EmailSpeakers({
  headline,
  eyebrow,
  body,
  ctaText,
  solution,
  logoColor,
  showEyebrow = false,
  showHeadline = true,
  showBody,
  showCta,
  showSolutionSet,
  grayscale = false,
  theme = 'light',
  speakerCount,
  showSpeaker1,
  showSpeaker2,
  showSpeaker3,
  speaker1,
  speaker2,
  speaker3,
  headlineFontSize,
  stackAlign = 'top',
  gaps,
  colors,
  typography,
  scale = 1,
  renderBlock,
  renderInlineEditor,
  renderSpacerBetween,
  renderSpeakerField,
  renderSpeakerFieldInline,
  renderOverlay,
}: EmailSpeakersProps) {
  // Default identity render-props so callers that don't pass them
  // get the existing behavior with zero changes.
  const wrapBlock = renderBlock ?? ((_id, content) => content)
  const wrapInline = renderInlineEditor ?? ((_id, defaultInner) => defaultInner)
  const wrapSpeakerField = renderSpeakerField ?? ((_id, _field, defaultInner) => defaultInner)
  const wrapSpeakerInline = renderSpeakerFieldInline ?? ((_id, _field, defaultInner) => defaultInner)
  const themeColors = TEMPLATE_THEMES[theme]
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const logoFill = themeColors.logoFill
  const textColor = themeColors.textPrimary
  const solutionConfig = colors.solutions[solution] || colors.solutions.general
  const solutionColor = solutionConfig.color
  const solutionLabel = solutionConfig.label

  // Determine if content is empty for conditional rendering
  const hasHeadline = !isHtmlEmpty(headline)
  const hasBody = !isHtmlEmpty(body)

  const containerStyle: CSSProperties = {
    width: 640,
    height: 300,
    padding: 32,
    background: themeColors.backgroundPrimary,
    display: 'inline-flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 32,
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }

  // Speaker visibility — Stage & Bench mode (showSpeakerN passed) takes
  // precedence; legacy callers fall back to top-N from `speakerCount`.
  const useIndependentVisibility =
    showSpeaker1 !== undefined ||
    showSpeaker2 !== undefined ||
    showSpeaker3 !== undefined
  const visibleSpeakers: { id: 'speaker1' | 'speaker2' | 'speaker3'; data: SpeakerInfo }[] =
    useIndependentVisibility
      ? ([
          showSpeaker1 ? { id: 'speaker1' as const, data: speaker1 } : null,
          showSpeaker2 ? { id: 'speaker2' as const, data: speaker2 } : null,
          showSpeaker3 ? { id: 'speaker3' as const, data: speaker3 } : null,
        ].filter(Boolean) as { id: 'speaker1' | 'speaker2' | 'speaker3'; data: SpeakerInfo }[])
      : ([speaker1, speaker2, speaker3] as SpeakerInfo[])
          .slice(0, speakerCount)
          .map((data, i) => ({ id: (`speaker${i + 1}` as 'speaker1' | 'speaker2' | 'speaker3'), data }))

  return (
    <div style={containerStyle}>
      {/* Rich text styles for HTML content */}
      <style dangerouslySetInnerHTML={{ __html: RICH_TEXT_STYLES }} />

      {/* Left content area — header anchored top, ContentStack handles
       *  the body blocks (eyebrow / headline / body / cta). Solution pill
       *  rides alongside the logo in the header row, not in the stack. */}
      <div style={{
        alignSelf: 'stretch',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: 315,
      }}>
        <ContentStack<EmailSpeakersStackId>
          blocks={[
            {
              id: 'eyebrow',
              visible: showEyebrow && !!eyebrow,
              defaultInner: eyebrow,
              renderChrome: (inner) => (
                <div style={{
                  color: textColor,
                  fontSize: 10,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '1.1px',
                }}>
                  {inner}
                </div>
              ),
            },
            {
              id: 'headline',
              visible: showHeadline,
              defaultInner: (
                <div dangerouslySetInnerHTML={{ __html: hasHeadline ? headline : 'Headline' }} />
              ),
              renderChrome: (inner) => (
                <div
                  className="rich-text-dark"
                  style={{
                    alignSelf: 'stretch',
                    color: textColor,
                    fontSize: headlineFontSize ?? 38.15,
                    fontWeight: 350,
                    lineHeight: `${(headlineFontSize ?? 38.15) * (48.19 / 38.15)}px`,
                  }}
                >
                  {inner}
                </div>
              ),
            },
            {
              id: 'body',
              visible: showBody,
              defaultInner: (
                <div dangerouslySetInnerHTML={{ __html: body || 'Body copy goes here.' }} />
              ),
              renderChrome: (inner) => (
                <div
                  className="rich-text-dark"
                  style={{
                    alignSelf: 'stretch',
                    color: textColor,
                    fontSize: 18.07,
                    fontWeight: 350,
                  }}
                >
                  {inner}
                </div>
              ),
            },
            {
              id: 'cta',
              visible: showCta && !!ctaText,
              defaultInner: ctaText,
              renderChrome: (inner) => (
                <div style={{
                  display: 'inline-flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  <span style={{
                    textAlign: 'center',
                    color: themeColors.buttonSecondaryText,
                    fontSize: 18,
                    fontWeight: 350,
                    lineHeight: '18px',
                  }}>
                    {inner}
                  </span>
                  <ArrowIcon color={themeColors.buttonSecondaryText} width={16.5} height={16.5 * 0.8} />
                </div>
              ),
            },
          ]}
          gaps={gaps}
          defaultGap={DEFAULT_GAP}
          renderSpacerBetween={renderSpacerBetween}
          renderBlock={renderBlock as (id: EmailSpeakersStackId, content: ReactNode) => ReactNode}
          renderInlineEditor={renderInlineEditor as (id: EmailSpeakersStackId, defaultInner: ReactNode) => ReactNode}
          stackAlign={stackAlign}
          topAnchor={{
            id: 'logo',
            node: (
              <div style={{
                display: 'inline-flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 40,
                flexShrink: 0,
              }}>
                <CorityLogo fill={logoFill} height={23} />

                {/* Solution Pill — wrapped via renderBlock so the editor
                 *  can select it; sits alongside the logo, not in the stack. */}
                {showSolutionSet && solution !== 'none' && wrapBlock(
                  'solutionPill',
                  <SolutionPill
                    variant="email"
                    solutionColor={solutionColor}
                    solutionLabel={solutionLabel}
                    textColor={themeColors.textPrimary}
                    background={themeColors.bgCategoryChip}
                    border={`0.79px solid ${themeColors.borderFocus}`}
                  />,
                )}
              </div>
            ),
          }}
          alignItems="flex-start"
        />
      </div>

      {/* Right speakers area */}
      <div style={{
        flex: '1 1 0',
        alignSelf: 'stretch',
        overflow: 'hidden',
        display: 'inline-flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        {visibleSpeakers.map(({ id, data: speaker }, index) => wrapBlock(
          id,
          <div
            key={id}
            style={{
              alignSelf: 'stretch',
              flex: '1 1 0',
              display: 'inline-flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 16,
            }}
          >
            {wrapSpeakerField(
              id,
              'image',
              <SpeakerAvatar
                imageUrl={speaker.imageUrl}
                position={speaker.imagePosition}
                zoom={speaker.imageZoom}
                size={48}
                speakerIndex={index + 1}
                grayscale={grayscale}
              />,
            )}
            <div style={{
              width: 161,
              display: 'inline-flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
            }}>
              {wrapSpeakerField(
                id,
                'name',
                <div style={{
                  alignSelf: 'stretch',
                  color: textColor,
                  fontSize: 18,
                  fontWeight: 350,
                }}>
                  {wrapSpeakerInline(id, 'name', speaker.name || 'Firstname Lastname')}
                </div>,
              )}
              {wrapSpeakerField(
                id,
                'role',
                <div style={{
                  alignSelf: 'stretch',
                  color: textColor,
                  fontSize: 12,
                  fontWeight: 350,
                  lineHeight: '16px',
                }}>
                  {wrapSpeakerInline(id, 'role', speaker.role || 'Role, Company')}
                </div>,
              )}
            </div>
          </div>,
        ))}
      </div>
      {renderOverlay?.()}
    </div>
  )
}
