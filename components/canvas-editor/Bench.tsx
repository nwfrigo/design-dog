'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Type, Heading1, Heading2, AlignLeft, MousePointerClick, type LucideIcon } from 'lucide-react'
import { EDITBAR_TOKENS } from './editbar/shell'
import { useCanvasMode } from './CanvasEditorProvider'
import { useVisibilitySlots, SLOT_DRAG_MIME, type SlotVisibility } from './VisibilityRegistry'

const ICONS: Record<NonNullable<SlotVisibility['iconKey']>, LucideIcon> = {
  eyebrow: Type,
  headline: Heading1,
  subhead: Heading2,
  body: AlignLeft,
  cta: MousePointerClick,
  generic: Type,
}

/**
 * Bench — the parking spot for hidden slots in the Stage & Bench editor.
 *
 * Slots that live on the Stage (the design) can be sent to the Bench via the
 * eye-off icon on their contextual toolbar. Bench chips are draggable; dropping
 * one back onto the Stage restores that slot to its template-defined position.
 *
 * Renders via React portal into the preview pad — necessary because the Stage
 * is wrapped in a `transform: scale(...)` container, which CSS treats as a
 * containing block for absolutely-positioned descendants. Anchoring inside the
 * Stage tree would attach the Bench to the scaled canvas instead of the pad.
 * Portal target: any element marked `data-canvas-preview-pad` (set by
 * EditorScreen on the gray pad surrounding the Stage).
 */
export function Bench() {
  const mode = useCanvasMode()
  const slots = useVisibilitySlots()
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setPortalTarget(document.querySelector<HTMLElement>('[data-canvas-preview-pad]'))
  }, [])

  if (mode !== 'edit') return null

  const hidden = slots.filter((s) => s.isHidden)
  if (hidden.length === 0) return null
  if (!portalTarget) return null

  const content = (
    <div
      data-canvas-bank
      style={{
        position: 'absolute',
        left: 24,
        top: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 5,
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          fontFamily: EDITBAR_TOKENS.fontFamily,
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#9aa0a6',
          paddingLeft: 4,
          marginBottom: 2,
        }}
      >
        Bench
      </div>
      {hidden.map((slot) => {
        const Icon = ICONS[slot.iconKey ?? 'generic']
        return (
          <div
            key={slot.path}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'move'
              e.dataTransfer.setData(SLOT_DRAG_MIME, slot.path)
              e.dataTransfer.setData('text/plain', slot.path)
            }}
            title={`Drag onto the design to show ${slot.label}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              height: EDITBAR_TOKENS.height,
              padding: '0 12px',
              background: EDITBAR_TOKENS.bg,
              border: `${EDITBAR_TOKENS.borderThin}px solid ${EDITBAR_TOKENS.border}`,
              borderRadius: EDITBAR_TOKENS.radius,
              color: EDITBAR_TOKENS.iconDefault,
              fontFamily: EDITBAR_TOKENS.fontFamily,
              fontSize: EDITBAR_TOKENS.fontSize,
              cursor: 'grab',
              userSelect: 'none',
              transition: 'color 120ms, border-color 120ms',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = EDITBAR_TOKENS.iconActive
              e.currentTarget.style.borderColor = EDITBAR_TOKENS.iconDefault
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = EDITBAR_TOKENS.iconDefault
              e.currentTarget.style.borderColor = EDITBAR_TOKENS.border
            }}
          >
            <Icon size={14} />
            <span>{slot.label}</span>
          </div>
        )
      })}
    </div>
  )

  return createPortal(content, portalTarget)
}
