'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Mark, mergeAttributes } from '@tiptap/core'
import { useEffect } from 'react'

// Custom Bold extension that uses font-weight 500 (Fakt Pro Medium) instead of 700
const CustomBold = Mark.create({
  name: 'bold',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  parseHTML() {
    return [
      { tag: 'strong' },
      { tag: 'b', getAttrs: (node) => (node as HTMLElement).style.fontWeight !== 'normal' && null },
      { style: 'font-weight', getAttrs: (value) => /^(bold(er)?|[5-9]\d{2,})$/.test(value as string) && null },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['strong', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { style: 'font-weight: 500;' }), 0]
  },

  addCommands() {
    return {
      setBold: () => ({ commands }) => commands.setMark(this.name),
      toggleBold: () => ({ commands }) => commands.toggleMark(this.name),
      unsetBold: () => ({ commands }) => commands.unsetMark(this.name),
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-b': () => this.editor.commands.toggleBold(),
      'Mod-B': () => this.editor.commands.toggleBold(),
    }
  },
})

interface SimpleRichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
  singleLine?: boolean // If true, prevents Enter from creating new paragraphs
  onFontSizeUp?: () => void
  onFontSizeDown?: () => void
  fontSizeAtMax?: boolean
  fontSizeAtMin?: boolean
}

export function SimpleRichTextEditor({
  content,
  onChange,
  placeholder = 'Enter text...',
  className = '',
  minHeight = '40px',
  singleLine = false,
  onFontSizeUp,
  onFontSizeDown,
  fontSizeAtMax = false,
  fontSizeAtMin = false,
}: SimpleRichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable features we don't need
        heading: false,
        codeBlock: false,
        code: false,
        blockquote: false,
        horizontalRule: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        bold: false, // We use CustomBold instead
        // hardBreak is enabled by default, no need to configure
      }),
      CustomBold,
    ],
    content,
    immediatelyRender: false, // Required for Next.js SSR compatibility
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: `focus:outline-none ${className}`,
        style: `min-height: ${minHeight}`,
      },
      // Handle Enter key behavior
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter') {
          if (singleLine) {
            // Prevent any line breaks in single-line mode
            return true
          }
          // In multi-line mode: Enter inserts <br> (hard break) instead of new paragraph
          // This avoids paragraph spacing - line breaks look like natural text wrapping
          // Double-Enter creates <br><br> for a visible blank line
          view.dispatch(view.state.tr.replaceSelectionWith(
            view.state.schema.nodes.hardBreak.create()
          ).scrollIntoView())
          return true
        }
        return false
      },
    },
  })

  // Sync external content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return (
      <div
        className={`w-full bg-white dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg animate-pulse ${className}`}
        style={{ minHeight }}
      />
    )
  }

  return (
    <div className="w-full border border-gray-300 dark:border-line-subtle rounded-lg overflow-hidden bg-white dark:bg-surface-primary">
      {/* Compact Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-gray-200 dark:border-line-subtle bg-gray-50 dark:bg-surface-secondary">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-interactive-hover transition-colors ${
            editor.isActive('bold') ? 'bg-gray-200 dark:bg-surface-tertiary text-blue-600' : 'text-gray-500 dark:text-content-secondary'
          }`}
          title="Bold (⌘B)"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-interactive-hover transition-colors ${
            editor.isActive('italic') ? 'bg-gray-200 dark:bg-surface-tertiary text-blue-600' : 'text-gray-500 dark:text-content-secondary'
          }`}
          title="Italic (⌘I)"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 4h4m0 0l-4 16m0 0h4M6 20h4" />
          </svg>
        </button>

        {/* Font size inc/dec buttons */}
        {(onFontSizeUp || onFontSizeDown) && (
          <>
            <div className="w-px h-4 bg-gray-300 dark:bg-line-subtle mx-1" />
            <button
              type="button"
              onClick={onFontSizeUp}
              disabled={fontSizeAtMax}
              className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-interactive-hover transition-colors ${
                fontSizeAtMax ? 'opacity-30 cursor-not-allowed' : 'text-gray-500 dark:text-content-secondary'
              }`}
              title="Increase text size"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                <text x="0" y="13" fontSize="13" fontWeight="500" fontFamily="system-ui">A</text>
                <path d="M12.5 3 L14.5 0.5 L16.5 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" transform="translate(-2, 1.5)" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onFontSizeDown}
              disabled={fontSizeAtMin}
              className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-interactive-hover transition-colors ${
                fontSizeAtMin ? 'opacity-30 cursor-not-allowed' : 'text-gray-500 dark:text-content-secondary'
              }`}
              title="Decrease text size"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                <text x="0" y="13" fontSize="10" fontWeight="500" fontFamily="system-ui">A</text>
                <path d="M10.5 0.5 L12.5 3 L14.5 0.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" transform="translate(-2, 1.5)" />
              </svg>
            </button>
          </>
        )}

        <div className="flex-1" />

        <span className="text-[10px] text-gray-400 dark:text-content-secondary">
          {singleLine ? '⌘B bold · ⌘I italic' : '⌘B bold · ⌘I italic · Enter for new line'}
        </span>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Placeholder and styling */}
      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: '${placeholder.replace(/'/g, "\\'")}';
          color: #9ca3af;
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror {
          padding: 8px 12px;
          font-size: 14px;
          line-height: 1.5;
          color: inherit;
        }
        .ProseMirror p {
          margin: 0;
        }
        .ProseMirror p + p {
          margin-top: 0.5em;
        }
        .ProseMirror strong {
          font-weight: 500;
        }
        .ProseMirror:focus {
          outline: none;
        }
      `}</style>
    </div>
  )
}

/**
 * Utility to strip HTML tags and get plain text (for character counts, etc.)
 */
export function stripHtml(html: string): string {
  if (typeof document !== 'undefined') {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }
  // Fallback for SSR
  return html.replace(/<[^>]*>/g, '')
}

/**
 * Check if HTML content is effectively empty
 */
export function isHtmlEmpty(html: string): boolean {
  if (!html) return true
  const stripped = stripHtml(html).trim()
  return stripped === ''
}
