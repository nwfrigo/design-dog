'use client'

import { CSSProperties, type ReactNode } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { applyGrayscaleBoolean, filtersToCss, type ImageFilters } from '@/lib/image-filters'
import { CorityAlwaysAheadLogo } from '@/components/shared/CorityAlwaysAheadLogo'
import { CorityLogo } from '@/components/shared/CorityLogo'
import { PartnerLogo } from '@/components/shared/PartnerLogo'
import { RichText } from '@/components/shared/RichText'
import {
  ROI_SOLUTION_PILLS,
  type IndustryRoiDocument,
} from '@/lib/industry-roi/document'

/**
 * Industry ROI one-pager (Figma `roi-1`, 1223:1746). Fixed 612px width,
 * VARIABLE height — pure vertical flow, so hidden sections collapse and
 * dynamic rows/bullets grow the canvas. Export: single long-page PDF at
 * 612 × measured height (the root carries id="industry-roi-content" for
 * the export route's measure step).
 *
 * Dynamic slots: ROI table rows (`rowLabel:<id>` / `rowValue:<id>`) and
 * risk bullets (`bullet:<id>`) — ids derive from document entry ids. The
 * add/remove/reorder affordances are EDITOR-ONLY chrome rendered here
 * behind `interactive`, calling the adapter's document callbacks; exports
 * never see them.
 */

export type IndustryRoiBlockId =
  | 'heroImage' | 'heroTitle' | 'heroIntro'
  | 'tableIntro' | 'tableFootnote'
  | 'didYouKnowText' | 'didYouKnowSource'
  | 'benefitsHeader'
  | `cardRole:${number}` | `cardBody:${number}` | `cardImage:${number}`
  | 'risksTitle'
  | 'customerLogo' | 'customerStoryText' | 'customerStoryAttribution'
  | 'roiHeadline' | 'roiIntro'
  | `statValue:${number}` | `statLabel:${number}`
  | 'ctaHeadline' | 'cta'
  | `rowLabel:${string}` | `rowValue:${string}` | `bullet:${string}`

export interface IndustryRoiListActions {
  onAddRow: () => void
  onRemoveRow: (id: string) => void
  onMoveRow: (id: string, dir: -1 | 1) => void
  onAddBullet: () => void
  onRemoveBullet: (id: string) => void
  onMoveBullet: (id: string, dir: -1 | 1) => void
}

export interface IndustryRoiProps {
  doc: IndustryRoiDocument
  renderBlock?: (blockId: IndustryRoiBlockId, content: ReactNode) => ReactNode
  renderInlineEditor?: (blockId: IndustryRoiBlockId, defaultInner: ReactNode) => ReactNode
  renderOverlay?: () => ReactNode
  listActions?: IndustryRoiListActions
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

const INK = '#060015'
const DARK_RAISED = '#060621'
const BORDER_LIGHT = '#d9d8d6'
const BORDER_DARK = '#41415e'
const ORANGE = '#D35F0B'
const GRAY_LIGHT = '#767676'
const GRAY_DARK = '#969899'
const COBALT_GLOW = 'rgba(0,128,255,0.3)'

function croppedImageStyle(
  position: { x: number; y: number },
  zoom: number,
  filters: ImageFilters,
  grayscale = false,
): CSSProperties {
  const css = filtersToCss(applyGrayscaleBoolean(filters, grayscale))
  return {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: `${50 - position.x}% ${50 - position.y}%`,
    transform: zoom !== 1
      ? `translate(${position.x * (zoom - 1)}%, ${position.y * (zoom - 1)}%) scale(${zoom})`
      : undefined,
    transformOrigin: 'center',
    filter: css || undefined,
  }
}

/** Small editor-only list control cluster (↑ ↓ ×), floated at a row's right. */
function ListControls({ onUp, onDown, onRemove, canUp, canDown, dark }: {
  onUp: () => void; onDown: () => void; onRemove: () => void
  canUp: boolean; canDown: boolean; dark?: boolean
}) {
  const base: CSSProperties = {
    width: 16, height: 16, borderRadius: 3, border: `0.75px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
    background: dark ? DARK_RAISED : '#ffffff', color: dark ? '#ffffff' : INK,
    fontSize: 9, lineHeight: '14px', textAlign: 'center', cursor: 'pointer', userSelect: 'none',
  }
  const disabled: CSSProperties = { opacity: 0.25, cursor: 'default' }
  return (
    <span
      data-roi-editor-chrome="true"
      style={{ display: 'inline-flex', gap: 3, marginLeft: 8, flexShrink: 0 }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <span style={{ ...base, ...(canUp ? {} : disabled) }} onClick={() => canUp && onUp()}>↑</span>
      <span style={{ ...base, ...(canDown ? {} : disabled) }} onClick={() => canDown && onDown()}>↓</span>
      <span style={{ ...base }} onClick={onRemove}>×</span>
    </span>
  )
}

function AddLine({ label, onClick, dark }: { label: string; onClick: () => void; dark?: boolean }) {
  return (
    <div
      data-roi-editor-chrome="true"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={onClick}
      style={{
        border: `1px dashed ${dark ? BORDER_DARK : BORDER_LIGHT}`,
        borderRadius: 6,
        color: dark ? GRAY_DARK : GRAY_LIGHT,
        fontSize: 9,
        letterSpacing: 0.9,
        textTransform: 'uppercase',
        textAlign: 'center',
        padding: '6px 0',
        cursor: 'pointer',
        userSelect: 'none',
        width: '100%',
      }}
    >
      {label}
    </div>
  )
}

export function IndustryRoi({
  doc,
  renderBlock,
  renderInlineEditor,
  renderOverlay,
  listActions,
  typography,
  scale = 1,
}: IndustryRoiProps) {
  const wrapBlock = renderBlock ?? ((_id: IndustryRoiBlockId, content: ReactNode) => content)
  const wrapInline = renderInlineEditor ?? ((_id: IndustryRoiBlockId, defaultInner: ReactNode) => defaultInner)
  const interactive = !!renderBlock
  // Defensive: snapshots/params from older shapes may lack the arrays.
  const rows = doc.rows ?? []
  const bullets = doc.bullets ?? []
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`

  const containerStyle: CSSProperties = {
    width: 612,
    position: 'relative',
    background: '#ffffff',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    display: 'flex',
    flexDirection: 'column',
  }

  const text = (
    id: IndustryRoiBlockId,
    value: string,
    style: CSSProperties,
    placeholder = 'Text',
  ): ReactNode => wrapBlock(id, (
    <div style={style}>
      {wrapInline(id, <RichText html={value || placeholder} />)}
    </div>
  ))

  return (
    <div id="industry-roi-content" style={containerStyle}>

      {/* ---------------- Hero (fixed 264) ---------------- */}
      <div style={{ position: 'relative', width: 612, height: 264, overflow: 'hidden', background: '#ffffff', flexShrink: 0 }}>
        {wrapBlock('heroImage', (
          <div style={{ position: 'absolute', left: 176, top: -53, width: 553 - 117, height: 369, overflow: 'hidden' }}>
            {doc.heroImageUrl && (
              <img
                src={doc.heroImageUrl}
                alt=""
                data-export-image="true"
                style={croppedImageStyle(doc.heroImagePosition, doc.heroImageZoom, doc.heroImageFilters)}
              />
            )}
          </div>
        ))}
        {/* White fades: bottom-up and left-in (the Figma's two gradients) */}
        <div style={{ position: 'absolute', left: 0, bottom: 0, width: 612, height: 218, background: 'linear-gradient(to top, #ffffff 26.9%, rgba(255,255,255,0.86) 55.5%, rgba(255,255,255,0) 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, width: 366, height: 264, background: 'linear-gradient(to right, #ffffff 35%, rgba(255,255,255,0.86) 55%, rgba(255,255,255,0) 100%)', pointerEvents: 'none' }} />

        <div style={{ position: 'absolute', left: 48, top: 72 }}>
          <CorityAlwaysAheadLogo height={32.67} />
        </div>

        <div style={{ position: 'absolute', left: 48, top: 174, width: 517, display: 'flex', justifyContent: 'space-between' }}>
          {text('heroTitle', doc.heroTitle, { width: 230, fontSize: 24, fontWeight: 350, lineHeight: 'normal', color: INK }, 'Industry title')}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 0, height: 44, borderLeft: `0.75px solid ${INK}` }} />
            {text('heroIntro', doc.heroIntro, { width: 229, fontSize: 8, fontWeight: 350, lineHeight: '12px', color: INK }, 'Intro')}
          </div>
        </div>
      </div>

      {/* ---------------- ROI table ---------------- */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 48px 32px', background: '#ffffff' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {text('tableIntro', doc.tableIntro, { fontSize: 14, fontWeight: 350, lineHeight: '18px', color: INK }, 'Intro line')}
          <div style={{ border: `0.5px solid ${BORDER_LIGHT}`, borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {rows.map((row, i) => (
              <div
                key={row.id}
                style={{
                  background: '#fafafb',
                  borderBottom: i < rows.length - 1 ? `0.75px solid ${BORDER_LIGHT}` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  gap: 0,
                }}
              >
                {wrapBlock(`rowLabel:${row.id}`, (
                  <div style={{ fontSize: 14, fontWeight: 350, lineHeight: '18px', color: INK, whiteSpace: 'nowrap' }}>
                    {wrapInline(`rowLabel:${row.id}`, <span>{row.label || 'Row label'}</span>)}
                  </div>
                ))}
                {/* Auto-fill dotted leader — pure CSS, grows/shrinks with the texts */}
                <div style={{ flex: '1 0 0', minWidth: 12, margin: '0 10px', borderBottom: `1.5px dotted ${ORANGE}`, height: 0, alignSelf: 'center', transform: 'translateY(4px)' }} />
                {wrapBlock(`rowValue:${row.id}`, (
                  <div style={{ fontSize: 18, fontWeight: 350, color: ORANGE, whiteSpace: 'nowrap' }}>
                    {wrapInline(`rowValue:${row.id}`, <span>{row.value || 'Value'}</span>)}
                  </div>
                ))}
                {interactive && listActions && (
                  <ListControls
                    canUp={i > 0}
                    canDown={i < rows.length - 1}
                    onUp={() => listActions.onMoveRow(row.id, -1)}
                    onDown={() => listActions.onMoveRow(row.id, 1)}
                    onRemove={() => listActions.onRemoveRow(row.id)}
                  />
                )}
              </div>
            ))}
          </div>
          {interactive && listActions && (
            <AddLine label="+ Add row" onClick={listActions.onAddRow} />
          )}
        </div>
        {text('tableFootnote', doc.tableFootnote, { fontSize: 8, fontWeight: 350, lineHeight: '12px', color: GRAY_LIGHT, textAlign: 'center', width: 290, alignSelf: 'flex-start' }, 'Footnote')}
      </div>

      {/* ---------------- "Did you know?" dark band (hideable) ---------------- */}
      {doc.showDidYouKnow && (
        <div style={{ background: INK, display: 'flex', flexDirection: 'column', gap: 20, padding: '40px 48px' }}>
          <div style={{
            alignSelf: 'flex-start', background: INK, border: `0.75px solid ${BORDER_DARK}`, borderRadius: 6,
            padding: 8, boxShadow: `0 0 6px ${COBALT_GLOW}`,
            fontSize: 10, fontWeight: 500, letterSpacing: 1.1, textTransform: 'uppercase', color: '#ffffff', lineHeight: 1,
          }}>
            Did you know?
          </div>
          {text('didYouKnowText', doc.didYouKnowText, { fontSize: 18, fontWeight: 350, lineHeight: 'normal', color: '#ffffff' }, 'Fact')}
          {text('didYouKnowSource', doc.didYouKnowSource, { fontSize: 8, fontWeight: 350, lineHeight: '12px', color: GRAY_DARK }, '(Source)')}
        </div>
      )}

      {/* ---------------- Strategic benefits — 3 persona cards ---------------- */}
      <div style={{ background: INK, display: 'flex', flexDirection: 'column', gap: 16, padding: '0 48px 8px' }}>
        <div style={{ borderTop: `1px solid ${BORDER_DARK}`, width: '100%' }} />
        {text('benefitsHeader', doc.benefitsHeader, { fontSize: 14, fontWeight: 350, lineHeight: '18px', color: '#ffffff' }, 'Section header')}
        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
          {doc.cards.map((card, i) => (
            <div key={i} style={{
              flex: '1 0 0', minWidth: 0, minHeight: 208, display: 'flex', flexDirection: 'column',
              background: DARK_RAISED, border: `0.5px solid ${BORDER_DARK}`, borderRadius: 6,
              overflow: 'hidden', boxShadow: `0 0 12px ${COBALT_GLOW}`,
            }}>
              {wrapBlock(`cardImage:${i}`, (
                <div style={{ width: '100%', aspectRatio: '331 / 186', overflow: 'hidden', position: 'relative', background: DARK_RAISED }}>
                  {card.imageUrl && (
                    <img
                      src={card.imageUrl}
                      alt=""
                      data-export-image="true"
                      style={croppedImageStyle(card.imagePosition, card.imageZoom, card.imageFilters, true)}
                    />
                  )}
                </div>
              ))}
              <div style={{ background: INK, flex: '1 0 0', padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {wrapBlock(`cardRole:${i}`, (
                  <div style={{ fontSize: 8, fontWeight: 500, letterSpacing: 0.88, textTransform: 'uppercase', color: GRAY_DARK, lineHeight: 1 }}>
                    {wrapInline(`cardRole:${i}`, <span>{card.role || 'Role'}</span>)}
                  </div>
                ))}
                {wrapBlock(`cardBody:${i}`, (
                  <div style={{ fontSize: 12, fontWeight: 350, lineHeight: '16px', color: '#ffffff' }}>
                    {wrapInline(`cardBody:${i}`, <RichText html={card.body || 'Benefit copy'} />)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- Risks — dynamic bullets ---------------- */}
      <div style={{ background: INK, display: 'flex', flexDirection: 'column', gap: 23, padding: '32px 48px' }}>
        {text('risksTitle', doc.risksTitle, { fontSize: 24, fontWeight: 350, lineHeight: 'normal', color: '#ffffff' }, 'Section title')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {bullets.map((b, i) => (
            <div key={b.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, border: `1.5px solid ${ORANGE}`, flexShrink: 0 }} />
              {wrapBlock(`bullet:${b.id}`, (
                <div style={{ fontSize: 12, fontWeight: 350, lineHeight: '16px', color: '#ffffff' }}>
                  {wrapInline(`bullet:${b.id}`, <span>{b.text || 'Bullet'}</span>)}
                </div>
              ))}
              {interactive && listActions && (
                <ListControls
                  dark
                  canUp={i > 0}
                  canDown={i < bullets.length - 1}
                  onUp={() => listActions.onMoveBullet(b.id, -1)}
                  onDown={() => listActions.onMoveBullet(b.id, 1)}
                  onRemove={() => listActions.onRemoveBullet(b.id)}
                />
              )}
            </div>
          ))}
          {interactive && listActions && (
            <AddLine dark label="+ Add bullet" onClick={listActions.onAddBullet} />
          )}
        </div>
      </div>

      {/* ---------------- Customer story (hideable) ---------------- */}
      {doc.showCustomerStory && (
        <div style={{ background: '#ffffff', display: 'flex', flexDirection: 'column', gap: 20, padding: '32px 48px 4px' }}>
          <div style={{ display: 'flex', gap: 23, alignItems: 'center' }}>
            <div style={{
              background: '#fafafb', border: `0.75px solid ${BORDER_LIGHT}`, borderRadius: 6, padding: 8,
              fontSize: 8, fontWeight: 500, letterSpacing: 0.88, textTransform: 'uppercase', color: INK, lineHeight: 1,
            }}>
              Customer story
            </div>
            {wrapBlock('customerLogo', (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <PartnerLogo url={doc.customerLogoUrl} height={doc.customerLogoHeight} interactive={interactive} maxWidth={140} />
              </div>
            ))}
          </div>
          {text('customerStoryText', doc.customerStoryText, { fontSize: 18, fontWeight: 350, lineHeight: 'normal', color: INK }, 'Case study line')}
          {text('customerStoryAttribution', doc.customerStoryAttribution, { fontSize: 8, fontWeight: 350, lineHeight: '12px', color: GRAY_LIGHT }, 'Attribution')}
          <div style={{ borderTop: `1px solid ${BORDER_LIGHT}`, width: '100%' }} />
        </div>
      )}

      {/* ---------------- Verdantix ROI block ---------------- */}
      <div style={{ background: '#ffffff', display: 'flex', flexDirection: 'column', gap: 20, padding: '32px 48px 0' }}>
        <CorityLogo fill={ORANGE} height={18.63} />
        {text('roiHeadline', doc.roiHeadline, { fontSize: 24, fontWeight: 350, lineHeight: 'normal', color: INK }, 'ROI headline')}
        {text('roiIntro', doc.roiIntro, { fontSize: 14, fontWeight: 350, lineHeight: '18px', color: INK }, 'ROI intro')}
      </div>

      {/* ---------------- Stats (4, icons static) ---------------- */}
      <div style={{ background: '#ffffff', display: 'flex', gap: 29, padding: '32px 48px' }}>
        {doc.stats.map((s, i) => (
          <div key={i} style={{ flex: '1 0 0', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/assets/industry-roi/stat-icon-${i + 1}.svg`} alt="" data-export-image="true" style={{ width: 12.24, height: 12.24 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {wrapBlock(`statValue:${i}`, (
                <div style={{ fontSize: 18.36, fontWeight: 350, color: INK, lineHeight: 'normal' }}>
                  {wrapInline(`statValue:${i}`, <span>{s.value || '0'}</span>)}
                </div>
              ))}
              {wrapBlock(`statLabel:${i}`, (
                <div style={{ fontSize: 8, fontWeight: 500, letterSpacing: 0.88, textTransform: 'uppercase', color: INK, lineHeight: 'normal' }}>
                  {wrapInline(`statLabel:${i}`, <span>{s.label || 'Label'}</span>)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- Solutions pills (STATIC, brand-locked) ---------------- */}
      <div style={{ background: '#ffffff', display: 'flex', flexDirection: 'column', gap: 16, padding: '0 48px 40px' }}>
        <div style={{ fontSize: 14, fontWeight: 350, lineHeight: '18px', color: INK }}>Solutions included in ROI Analysis</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ROI_SOLUTION_PILLS.map((rowPills, r) => (
            <div key={r} style={{ display: 'flex', gap: 8 }}>
              {rowPills.map((pill) => (
                <div key={pill} style={{
                  background: '#ffffff', border: `0.75px solid ${BORDER_LIGHT}`, borderRadius: 6, padding: 8,
                  boxShadow: '0 0 2px rgba(0,0,0,0.1)',
                  fontSize: 8, fontWeight: 500, letterSpacing: 0.88, textTransform: 'uppercase', color: INK, lineHeight: 1,
                  whiteSpace: 'nowrap',
                }}>
                  {pill}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- CTA band ---------------- */}
      <div style={{ background: INK, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '32px 48px' }}>
        {text('ctaHeadline', doc.ctaHeadline, { width: 296, fontSize: 18, fontWeight: 350, lineHeight: 'normal', color: '#ffffff' }, 'CTA headline')}
        {wrapBlock('cta', (
          <div style={{
            background: ORANGE, borderRadius: 999, padding: '13px 20px',
            fontSize: 12, fontWeight: 500, lineHeight: '16px', color: '#ffffff', whiteSpace: 'nowrap',
          }}>
            {wrapInline('cta', <span>{doc.ctaText || 'Explore Cority'}</span>)}
          </div>
        ))}
      </div>

      {renderOverlay?.()}
    </div>
  )
}
