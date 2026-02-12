'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { Mark, mergeAttributes } from '@tiptap/core'
import { useCallback, useEffect } from 'react'

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
      {
        tag: 'strong',
      },
      {
        tag: 'b',
        getAttrs: (node) => (node as HTMLElement).style.fontWeight !== 'normal' && null,
      },
      {
        style: 'font-weight',
        getAttrs: (value) => /^(bold(er)?|[5-9]\d{2,})$/.test(value as string) && null,
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['strong', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { style: 'font-weight: 500;' }), 0]
  },

  addCommands() {
    return {
      setBold: () => ({ commands }) => {
        return commands.setMark(this.name)
      },
      toggleBold: () => ({ commands }) => {
        return commands.toggleMark(this.name)
      },
      unsetBold: () => ({ commands }) => {
        return commands.unsetMark(this.name)
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-b': () => this.editor.commands.toggleBold(),
      'Mod-B': () => this.editor.commands.toggleBold(),
    }
  },
})

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  onRequestFullscreen?: () => void
}

export function RichTextEditor({ content, onChange, placeholder, onRequestFullscreen }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        code: false,
        blockquote: false,
        horizontalRule: false,
        bold: false, // Disable default bold, we use CustomBold
      }),
      CustomBold,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          style: 'color: #D35F0B; text-decoration: none;',
        },
      }),
    ],
    content,
    immediatelyRender: false, // Required for Next.js SSR compatibility
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[80px] px-3 py-2 text-gray-900 dark:text-gray-100',
      },
    },
  })

  // Sync external content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const setLink = useCallback(() => {
    if (!editor) return

    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  // Add Cmd+K keyboard shortcut for links
  useEffect(() => {
    if (!editor) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setLink()
      }
    }

    // Get the editor DOM element
    const editorElement = editor.view.dom
    editorElement.addEventListener('keydown', handleKeyDown)

    return () => {
      editorElement.removeEventListener('keydown', handleKeyDown)
    }
  }, [editor, setLink])

  // Indent functions for lists
  const indent = useCallback(() => {
    if (!editor) return
    // For list items, sink them deeper
    if (editor.isActive('listItem')) {
      editor.chain().focus().sinkListItem('listItem').run()
    }
  }, [editor])

  const outdent = useCallback(() => {
    if (!editor) return
    // For list items, lift them up
    if (editor.isActive('listItem')) {
      editor.chain().focus().liftListItem('listItem').run()
    }
  }, [editor])

  if (!editor) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg min-h-[120px] animate-pulse" />
    )
  }

  return (
    <div className="w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
            editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700 text-blue-600' : 'text-gray-600 dark:text-gray-400'
          }`}
          title="Bold (⌘B)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
            editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700 text-blue-600' : 'text-gray-600 dark:text-gray-400'
          }`}
          title="Italic (⌘I)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4m0 0l-4 16m0 0h4M6 20h4" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
            editor.isActive('underline') ? 'bg-gray-200 dark:bg-gray-700 text-blue-600' : 'text-gray-600 dark:text-gray-400'
          }`}
          title="Underline (⌘U)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v7a5 5 0 0010 0V4" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 20h14" />
          </svg>
        </button>

        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
            editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700 text-blue-600' : 'text-gray-600 dark:text-gray-400'
          }`}
          title="Bullet List"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            <circle cx="2" cy="6" r="1" fill="currentColor" />
            <circle cx="2" cy="12" r="1" fill="currentColor" />
            <circle cx="2" cy="18" r="1" fill="currentColor" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
            editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700 text-blue-600' : 'text-gray-600 dark:text-gray-400'
          }`}
          title="Numbered List"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13" />
            <text x="2" y="7" fontSize="6" fill="currentColor" fontWeight="bold">1</text>
            <text x="2" y="13" fontSize="6" fill="currentColor" fontWeight="bold">2</text>
            <text x="2" y="19" fontSize="6" fill="currentColor" fontWeight="bold">3</text>
          </svg>
        </button>

        <button
          type="button"
          onClick={outdent}
          disabled={!editor.isActive('listItem')}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
            !editor.isActive('listItem') ? 'opacity-40 cursor-not-allowed' : ''
          } text-gray-600 dark:text-gray-400`}
          title="Decrease Indent"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 6h10M11 12h10M11 18h10" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l-4-3v6l4-3z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={indent}
          disabled={!editor.isActive('listItem')}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
            !editor.isActive('listItem') ? 'opacity-40 cursor-not-allowed' : ''
          } text-gray-600 dark:text-gray-400`}
          title="Increase Indent"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 6h10M11 12h10M11 18h10" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l4 3-4 3V9z" />
          </svg>
        </button>

        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />

        <button
          type="button"
          onClick={setLink}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
            editor.isActive('link') ? 'bg-gray-200 dark:bg-gray-700 text-blue-600' : 'text-gray-600 dark:text-gray-400'
          }`}
          title="Add Link (⌘K)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>

        {editor.isActive('link') && (
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-red-500"
            title="Remove Link"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Fullscreen button */}
        {onRequestFullscreen && (
          <button
            type="button"
            onClick={onRequestFullscreen}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
            title="Edit in Fullscreen"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
          </button>
        )}
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Placeholder styling */}
      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: '${placeholder || 'Enter answer...'}';
          color: #9ca3af;
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror {
          min-height: 80px;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        .ProseMirror li {
          margin: 0.25em 0;
        }
        .ProseMirror a {
          color: #D35F0B;
          text-decoration: none;
        }
        .ProseMirror a:hover {
          text-decoration: underline;
        }
        .ProseMirror p {
          margin: 0.5em 0;
        }
        .ProseMirror p:first-child {
          margin-top: 0;
        }
        .ProseMirror p:last-child {
          margin-bottom: 0;
        }
        /* Preserve empty paragraphs for multiple line breaks */
        .ProseMirror p:empty::before,
        .ProseMirror p br:only-child {
          content: '';
          display: inline-block;
        }
        .ProseMirror p:empty {
          min-height: 1em;
        }
        .ProseMirror strong {
          font-weight: 500;
        }
        .ProseMirror u {
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}
