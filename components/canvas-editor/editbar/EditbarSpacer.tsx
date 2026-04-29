'use client'

import { useStore } from '@/store'
import { useCanvasEditorStore } from '@/store/canvas-editor'
import { EditbarRoot, EditbarSection, EDITBAR_TOKENS } from './shell'

/**
 * Spacer contextual editbar — read-only px readout.
 *
 * Drag handles already do the actual editing; this is just informational so
 * the user can see the precise current value without dragging.
 *
 * Resolves the spacer's value generically: `selection.path` is `templateId.slotKey`,
 * `selection.storeKey` names the record-typed store field. Pulls the current value
 * from `useStore[storeKey][slotKey]`. Works for any template that stores its gaps
 * as a Record<slotKey, number>.
 */
export function EditbarSpacer() {
  const selection = useCanvasEditorStore((s) => s.selection)
  const value = useStore((s) => {
    if (!selection) return undefined
    const slotKey = selection.path.split('.').slice(1).join('.')
    const record = (s as unknown as Record<string, Record<string, number> | undefined>)[selection.storeKey]
    return record?.[slotKey]
  })

  return (
    <EditbarRoot ariaLabel="Spacer">
      <EditbarSection gap="tight">
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: EDITBAR_TOKENS.textPrimary,
            fontFamily: EDITBAR_TOKENS.fontFamily,
            fontSize: EDITBAR_TOKENS.fontSize,
            fontWeight: 600,
            lineHeight: 1,
            padding: `${EDITBAR_TOKENS.space1}px ${EDITBAR_TOKENS.space2}px`,
            whiteSpace: 'nowrap',
          }}
        >
          {value != null ? `${value}px` : '—'}
        </div>
      </EditbarSection>
    </EditbarRoot>
  )
}
