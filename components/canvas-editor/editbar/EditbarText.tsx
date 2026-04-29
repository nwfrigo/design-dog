'use client'

import { useState } from 'react'
import { Bold, Italic, AArrowUp, AArrowDown, MoveVertical, EyeOff } from 'lucide-react'
import {
  EditbarRoot,
  EditbarSection,
  EditbarDivider,
  EditbarDragHandle,
  EditbarIconButton,
} from './shell'
import { EditbarSlider } from './EditbarSlider'
import { useCanvasEditorStore } from '@/store/canvas-editor'
import { useSlotVisibility } from '../VisibilityRegistry'
import { useSlotSize } from '../SizeRegistry'
import { useSlotContent } from '../ContentRegistry'
import { useSlotLineHeight } from '../LineHeightRegistry'

/**
 * Block-level format detection / toggling. Uses DOMParser instead of regex
 * because real content may have whitespace, attributes, or Tiptap-injected
 * wrappers (`<p>`) that brittle regex would miss — leading to "stuck on"
 * toggles where the active-state check disagrees with the toggle action.
 *
 * `isWhollyWrappedIn`: returns true iff the content is exactly one element of
 * the given tag(s), with no leading/trailing text or siblings.
 *
 * `toggleWrap`: peels the outer wrap if present (any of `tags`), else wraps
 * the entire content in `wrapTag`.
 */
/**
 * Block-level format toggling that matches the rendered DOM, not the raw HTML
 * string. Walks every text run and checks whether all of them have an ancestor
 * matching one of the format tags. This handles:
 *   - Tiptap's `<strong style="font-weight: 500;">` (attribute variants)
 *   - Accumulated nesting like `<em><p><strong>...</strong></p></em>`
 *   - Mixed runs `<strong>A</strong> <strong>B</strong>` (counts as wholly bold)
 *
 * On toggle: if all text is wrapped, strip every matching tag (peel cleanup);
 * otherwise strip existing partial wraps and wrap the whole thing fresh in the
 * canonical tag. Net effect: every click produces a clean, deterministic state.
 */

type WrapTag = 'strong' | 'b' | 'em' | 'i'

const BOLD_TAGS = ['strong', 'b'] as const satisfies readonly WrapTag[]
const ITALIC_TAGS = ['em', 'i'] as const satisfies readonly WrapTag[]

function isAllTextWrappedIn(html: string, tags: readonly WrapTag[]): boolean {
  if (typeof document === 'undefined') return false
  const div = document.createElement('div')
  div.innerHTML = html
  const walker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT)
  let hasText = false
  let node: Node | null = walker.nextNode()
  while (node) {
    const text = node.nodeValue ?? ''
    if (text.trim() !== '') {
      hasText = true
      let p: Element | null = node.parentElement
      let wrapped = false
      while (p && p !== div) {
        if (tags.includes(p.tagName.toLowerCase() as WrapTag)) {
          wrapped = true
          break
        }
        p = p.parentElement
      }
      if (!wrapped) return false
    }
    node = walker.nextNode()
  }
  return hasText
}

function stripTags(html: string, tags: readonly WrapTag[]): string {
  if (typeof document === 'undefined') return html
  const div = document.createElement('div')
  div.innerHTML = html
  for (const tag of tags) {
    const els = Array.from(div.querySelectorAll(tag))
    for (const el of els) {
      const parent = el.parentNode
      if (!parent) continue
      while (el.firstChild) parent.insertBefore(el.firstChild, el)
      parent.removeChild(el)
    }
  }
  return div.innerHTML
}

function toggleFormat(html: string, peelTags: readonly WrapTag[], wrapTag: WrapTag): string {
  if (isAllTextWrappedIn(html, peelTags)) {
    return stripTags(html, peelTags)
  }
  // Not fully wrapped — strip any partial wraps for a clean result, then wrap.
  const cleaned = stripTags(html, peelTags)
  return `<${wrapTag}>${cleaned}</${wrapTag}>`
}

/**
 * Text contextual editbar.
 *
 * Bold/Italic operate at two levels:
 *   - When actively editing (`isEditing`): execCommand toggles the current
 *     text-range selection — character-level formatting.
 *   - When the block is just selected (single-clicked, no text-range edit):
 *     wraps/unwraps the entire slot content in <strong>/<em> via the slot's
 *     ContentRegistry setter — block-level formatting. This matches the
 *     interaction model of font-size and visibility (block-scoped controls).
 *
 * Bold/Italic disabled for plain-text slots (`format: 'plain'`) since they
 * don't support inline tags.
 *
 * Line-spacing: not wired to a store field yet — button stays disabled until
 * the feature is built.
 */

export interface EditbarTextProps {
  /** Hide grip + divider. Default true (hidden) — grips aren't wired to drag-reposition yet. */
  noDragHandle?: boolean
}

export function EditbarText({ noDragHandle = true }: EditbarTextProps) {
  const editingPath = useCanvasEditorStore((s) => s.editingPath)
  const selection = useCanvasEditorStore((s) => s.selection)
  const isEditing = !!editingPath && editingPath === selection?.path
  const visibility = useSlotVisibility(selection?.path)
  const size = useSlotSize(selection?.path)
  const content = useSlotContent(selection?.path)
  const lineHeight = useSlotLineHeight(selection?.path)
  const clearSelection = useCanvasEditorStore((s) => s.clearSelection)
  const setEditingPath = useCanvasEditorStore((s) => s.setEditingPath)

  const supportsRichText = content?.format === 'html'

  const [execBoldActive, setExecBoldActive] = useState(false)
  const [execItalicActive, setExecItalicActive] = useState(false)
  const [lineHeightOpen, setLineHeightOpen] = useState(false)

  const blockBoldActive = supportsRichText ? isAllTextWrappedIn(content!.value, BOLD_TAGS) : false
  const blockItalicActive = supportsRichText ? isAllTextWrappedIn(content!.value, ITALIC_TAGS) : false

  const boldActive = isEditing ? execBoldActive : blockBoldActive
  const italicActive = isEditing ? execItalicActive : blockItalicActive

  // Re-poll execCommand state after a formatting click so the active styling
  // tracks the underlying selection (only meaningful while actively editing).
  const refreshActiveStates = () => {
    if (typeof document === 'undefined') return
    try {
      setExecBoldActive(document.queryCommandState('bold'))
      setExecItalicActive(document.queryCommandState('italic'))
    } catch {
      // queryCommandState can throw in some contexts — ignore
    }
  }

  const onBold = () => {
    if (isEditing) {
      document.execCommand('bold')
      refreshActiveStates()
      return
    }
    if (!content || content.format !== 'html') return
    content.set(toggleFormat(content.value, BOLD_TAGS, 'strong'))
  }

  const onItalic = () => {
    if (isEditing) {
      document.execCommand('italic')
      refreshActiveStates()
      return
    }
    if (!content || content.format !== 'html') return
    content.set(toggleFormat(content.value, ITALIC_TAGS, 'em'))
  }
  const onSizeUp = () => {
    if (!size) return
    size.set(Math.min(size.value + size.step, size.max))
  }
  const onSizeDown = () => {
    if (!size) return
    size.set(Math.max(size.value - size.step, size.min))
  }

  const actions = (
    <EditbarSection gap="default">
      <EditbarIconButton
        ariaLabel="Bold"
        size="sm"
        active={boldActive}
        disabled={!supportsRichText && !isEditing}
        onClick={onBold}
      >
        <Bold size={18} />
      </EditbarIconButton>
      <EditbarIconButton
        ariaLabel="Italic"
        size="sm"
        active={italicActive}
        disabled={!supportsRichText && !isEditing}
        onClick={onItalic}
      >
        <Italic size={18} />
      </EditbarIconButton>
      <EditbarIconButton
        ariaLabel="Increase font size"
        size="sm"
        disabled={!size || size.value >= size.max}
        onClick={onSizeUp}
      >
        <AArrowUp size={18} />
      </EditbarIconButton>
      <EditbarIconButton
        ariaLabel="Decrease font size"
        size="sm"
        disabled={!size || size.value <= size.min}
        onClick={onSizeDown}
      >
        <AArrowDown size={18} />
      </EditbarIconButton>
      <EditbarIconButton
        ariaLabel="Line spacing"
        size="sm"
        active={lineHeightOpen}
        disabled={!lineHeight}
        onClick={() => setLineHeightOpen((v) => !v)}
      >
        <MoveVertical size={18} />
      </EditbarIconButton>
      {visibility && (
        <EditbarIconButton
          ariaLabel={`Hide ${visibility.label}`}
          size="sm"
          onClick={() => {
            visibility.hide()
            setEditingPath(null)
            clearSelection()
          }}
        >
          <EyeOff size={18} />
        </EditbarIconButton>
      )}
    </EditbarSection>
  )

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <EditbarRoot ariaLabel="Text formatting">
        {!noDragHandle && (
          <>
            <EditbarDragHandle />
            <EditbarDivider />
          </>
        )}
        {actions}
      </EditbarRoot>

      {lineHeightOpen && lineHeight && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            zIndex: 1,
          }}
        >
          <EditbarSlider
            ariaLabel="Line spacing"
            value={lineHeight.value}
            onChange={lineHeight.set}
            min={lineHeight.min}
            max={lineHeight.max}
            step={lineHeight.step}
            showValue
          />
        </div>
      )}
    </div>
  )
}
