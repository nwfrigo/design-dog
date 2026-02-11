'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useStore } from '@/store'
import { ContentPage, type FaqContentBlock } from './templates/FaqPdf'
import { RichTextEditor } from './RichTextEditor'
import { TableGridPicker } from './TableGridPicker'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9)

// Default placeholder content from the reference PDF
const DEFAULT_QA_BLOCKS: FaqContentBlock[] = [
  {
    type: 'heading',
    id: generateId(),
    text: 'Page headings look like this',
  },
  {
    type: 'qa',
    id: generateId(),
    question: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sed mi sit amet?',
    answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sed mi sit amet odio viverra eleifend. Interdum et malesuada fames ac ante ipsum primis in faucibus.',
  },
  {
    type: 'qa',
    id: generateId(),
    question: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit?',
    answer: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
<ul>
<li>ipsum primis in faucibus. Morbi sed</li>
<li>ipsum primis in faucibus. Morbi sed</li>
<li>ipsum primis in faucibus. Morbi sed</li>
</ul>
<p>Amet, consectetur adipiscing elit. Ut sed mi sit <a href="#">hyperlink</a> viverra eleifend.</p>`,
  },
]

interface FaqPage {
  id: string
  blocks: FaqContentBlock[]
}

// Sortable Block Item Component
function SortableBlockItem({
  block,
  blockIndex,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onDelete,
  updateTableCell,
}: {
  block: FaqContentBlock
  blockIndex: number
  isExpanded: boolean
  onToggleExpand: () => void
  onUpdate: (updates: Partial<FaqContentBlock>) => void
  onDelete: () => void
  updateTableCell: (rowIndex: number, colIndex: number, value: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getBlockLabel = () => {
    if (block.type === 'heading') return block.text || 'Heading'
    if (block.type === 'qa') return block.question || 'Q&A'
    if (block.type === 'table') return `Table (${block.rows}×${block.cols})`
    return 'Block'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      {/* Collapsed Header - Always visible */}
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={onToggleExpand}
      >
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>

        {/* Block Type Badge */}
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide w-12">
          {block.type === 'heading' ? 'HEAD' : block.type === 'qa' ? 'Q&A' : 'TABLE'}
        </span>

        {/* Block Preview Text */}
        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
          {getBlockLabel()}
        </span>

        {/* Expand/Collapse Icon */}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-gray-200 dark:border-gray-700">
          {block.type === 'heading' && (
            <input
              type="text"
              value={block.text}
              onChange={(e) => onUpdate({ text: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
              placeholder="Enter heading text"
            />
          )}

          {block.type === 'qa' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Question</label>
                <input
                  type="text"
                  value={block.question}
                  onChange={(e) => onUpdate({ question: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                  placeholder="Enter question"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Answer</label>
                <RichTextEditor
                  content={block.answer}
                  onChange={(html) => onUpdate({ answer: html })}
                  placeholder="Enter answer with formatting..."
                />
              </div>
            </div>
          )}

          {block.type === 'table' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span>{block.rows} × {block.cols} table</span>
                <button
                  type="button"
                  onClick={() => {
                    const newRows = block.rows + 1
                    const newData = [...block.data, Array(block.cols).fill('')]
                    onUpdate({ rows: newRows, data: newData })
                  }}
                  className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  + Row
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newCols = block.cols + 1
                    const newData = block.data.map(row => [...row, ''])
                    onUpdate({ cols: newCols, data: newData })
                  }}
                  className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  + Col
                </button>
                {block.rows > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newRows = block.rows - 1
                      const newData = block.data.slice(0, -1)
                      onUpdate({ rows: newRows, data: newData })
                    }}
                    className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    - Row
                  </button>
                )}
                {block.cols > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newCols = block.cols - 1
                      const newData = block.data.map(row => row.slice(0, -1))
                      onUpdate({ cols: newCols, data: newData })
                    }}
                    className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    - Col
                  </button>
                )}
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody>
                    {block.data.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, colIndex) => (
                          <td key={colIndex} className="border border-gray-200 dark:border-gray-700 p-0">
                            <input
                              type="text"
                              value={cell}
                              onChange={(e) => updateTableCell(rowIndex, colIndex, e.target.value)}
                              className="w-full px-2 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-0 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500"
                              placeholder="..."
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Delete Confirmation Modal
function DeleteConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  itemType,
  itemLabel,
}: {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  itemType: string
  itemLabel?: string
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Delete {itemType}{itemLabel ? ` ${itemLabel}` : ''}?
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          This action cannot be undone. Are you sure you want to delete this {itemType.toLowerCase()}?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export function FaqEditorScreen() {
  const { setCurrentScreen } = useStore()

  // FAQ document state
  const [title, setTitle] = useState('Title goes here')
  const [pages, setPages] = useState<FaqPage[]>([
    { id: generateId(), blocks: DEFAULT_QA_BLOCKS },
  ])
  const [currentPageIndex, setCurrentPageIndex] = useState(0)

  // UI state
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set())
  const [showTablePicker, setShowTablePicker] = useState(false)
  const [deleteBlockConfirm, setDeleteBlockConfirm] = useState<{ blockId: string; blockType: string } | null>(null)
  const [deletePageConfirm, setDeletePageConfirm] = useState<number | null>(null)

  // Scroll-based page detection
  const pageRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const isUserScrolling = useRef(true)

  // Export state
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [exportScale, setExportScale] = useState<1 | 2>(2)

  // Get current page
  const currentPage = pages[currentPageIndex]

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Scroll-based page detection using IntersectionObserver
  useEffect(() => {
    const container = previewContainerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!isUserScrolling.current) return

        // Find the most visible page
        let mostVisibleEntry: IntersectionObserverEntry | null = null
        let maxRatio = 0

        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio
            mostVisibleEntry = entry
          }
        })

        if (mostVisibleEntry) {
          const pageId = (mostVisibleEntry as IntersectionObserverEntry).target.getAttribute('data-page-id')
          const pageIndex = pages.findIndex(p => p.id === pageId)
          if (pageIndex !== -1 && pageIndex !== currentPageIndex) {
            setCurrentPageIndex(pageIndex)
          }
        }
      },
      {
        root: container,
        rootMargin: '-40% 0px -40% 0px', // Center 20% of viewport triggers
        threshold: [0, 0.25, 0.5, 0.75, 1]
      }
    )

    // Observe all page elements
    pageRefs.current.forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [pages, currentPageIndex])

  // Toggle block expansion
  const toggleBlockExpand = (blockId: string) => {
    setExpandedBlocks(prev => {
      const next = new Set(prev)
      if (next.has(blockId)) {
        next.delete(blockId)
      } else {
        next.add(blockId)
      }
      return next
    })
  }

  // Block management
  const updateBlock = useCallback((blockId: string, updates: Partial<FaqContentBlock>) => {
    setPages(prev => prev.map((page, idx) => {
      if (idx !== currentPageIndex) return page
      return {
        ...page,
        blocks: page.blocks.map(block =>
          block.id === blockId ? { ...block, ...updates } as FaqContentBlock : block
        ),
      }
    }))
  }, [currentPageIndex])

  const addBlock = useCallback((type: 'heading' | 'qa' | 'table', tableSize?: { rows: number; cols: number }) => {
    const newBlock: FaqContentBlock = type === 'heading'
      ? { type: 'heading', id: generateId(), text: 'New heading' }
      : type === 'qa'
        ? { type: 'qa', id: generateId(), question: 'New question?', answer: '<p>Answer goes here.</p>' }
        : {
            type: 'table',
            id: generateId(),
            rows: tableSize?.rows || 3,
            cols: tableSize?.cols || 3,
            data: Array(tableSize?.rows || 3).fill(null).map(() => Array(tableSize?.cols || 3).fill(''))
          }

    setPages(prev => prev.map((page, idx) => {
      if (idx !== currentPageIndex) return page
      return { ...page, blocks: [...page.blocks, newBlock] }
    }))

    // Auto-expand the new block
    setExpandedBlocks(prev => new Set(prev).add(newBlock.id))
  }, [currentPageIndex])

  const removeBlock = useCallback((blockId: string) => {
    setPages(prev => prev.map((page, idx) => {
      if (idx !== currentPageIndex) return page
      return {
        ...page,
        blocks: page.blocks.filter(block => block.id !== blockId),
      }
    }))
    setDeleteBlockConfirm(null)
  }, [currentPageIndex])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setPages(prev => prev.map((page, idx) => {
        if (idx !== currentPageIndex) return page
        const oldIndex = page.blocks.findIndex(b => b.id === active.id)
        const newIndex = page.blocks.findIndex(b => b.id === over.id)
        return {
          ...page,
          blocks: arrayMove(page.blocks, oldIndex, newIndex),
        }
      }))
    }
  }

  // Update table cell
  const updateTableCell = useCallback((blockId: string, rowIndex: number, colIndex: number, value: string) => {
    setPages(prev => prev.map((page, idx) => {
      if (idx !== currentPageIndex) return page
      return {
        ...page,
        blocks: page.blocks.map(block => {
          if (block.id !== blockId || block.type !== 'table') return block
          const newData = block.data.map((row, rIdx) =>
            rIdx === rowIndex
              ? row.map((cell, cIdx) => cIdx === colIndex ? value : cell)
              : row
          )
          return { ...block, data: newData }
        }),
      }
    }))
  }, [currentPageIndex])

  // Page management
  const addPage = useCallback(() => {
    setPages(prev => [...prev, { id: generateId(), blocks: [] }])
    setCurrentPageIndex(pages.length)
  }, [pages.length])

  const removePage = useCallback((pageIndex: number) => {
    if (pages.length <= 1) return
    setPages(prev => prev.filter((_, idx) => idx !== pageIndex))
    if (currentPageIndex >= pageIndex && currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1)
    }
    setDeletePageConfirm(null)
  }, [pages.length, currentPageIndex])

  // Export to PDF
  const handleExport = async () => {
    setIsExporting(true)
    setExportError(null)
    setExportSuccess(false)

    try {
      const exportParams = {
        template: 'faq-pdf',
        page: 'all',
        title,
        pages,
        numPages: pages.length,
        scale: exportScale,
      }

      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportParams),
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const filename = title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() || 'faq'
      a.download = `${filename}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (error) {
      console.error('Export failed:', error)
      setExportError('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleBack = () => {
    setCurrentScreen('select')
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar - Editor Controls */}
      <div className="w-[380px] flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="p-5 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">FAQ Editor</h1>
          </div>

          {/* Document Title */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
              Document Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
              placeholder="Enter document title"
            />
          </div>

          {/* Page Navigation */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Pages ({pages.length})
              </label>
              <button
                onClick={addPage}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Page
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {pages.map((page, idx) => (
                <button
                  key={page.id}
                  onClick={() => setCurrentPageIndex(idx)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    idx === currentPageIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Page {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Add Content Buttons */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
              Add Content
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => addBlock('heading')}
                className="flex-1 px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                + Heading
              </button>
              <button
                onClick={() => addBlock('qa')}
                className="flex-1 px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                + Q&A
              </button>
              <div className="relative flex-1">
                <button
                  onClick={() => setShowTablePicker(!showTablePicker)}
                  className="w-full px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  + Table
                </button>
                {showTablePicker && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowTablePicker(false)} />
                    <div className="absolute left-0 top-full mt-1 z-50">
                      <TableGridPicker
                        onSelect={(rows, cols) => {
                          addBlock('table', { rows, cols })
                          setShowTablePicker(false)
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Content Blocks - Draggable */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
              Page {currentPageIndex + 1} Content ({currentPage.blocks.length} items)
            </label>

            {currentPage.blocks.length === 0 ? (
              <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                No content yet. Add a heading, Q&A, or table above.
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={currentPage.blocks.map(b => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {currentPage.blocks.map((block, blockIndex) => (
                      <SortableBlockItem
                        key={block.id}
                        block={block}
                        blockIndex={blockIndex}
                        isExpanded={expandedBlocks.has(block.id)}
                        onToggleExpand={() => toggleBlockExpand(block.id)}
                        onUpdate={(updates) => updateBlock(block.id, updates)}
                        onDelete={() => setDeleteBlockConfirm({
                          blockId: block.id,
                          blockType: block.type === 'heading' ? 'Heading' : block.type === 'qa' ? 'Q&A' : 'Table'
                        })}
                        updateTableCell={(rowIndex, colIndex, value) =>
                          updateTableCell(block.id, rowIndex, colIndex, value)
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Delete Page Button */}
          {pages.length > 1 && (
            <button
              onClick={() => setDeletePageConfirm(currentPageIndex)}
              className="w-full px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              Delete Page {currentPageIndex + 1}
            </button>
          )}
        </div>
      </div>

      {/* Right Side - Preview */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {pages.length} page{pages.length > 1 ? 's' : ''} • Letter (8.5" × 11")
          </div>

          <div className="flex items-center gap-3">
            {/* Error Message */}
            {exportError && (
              <span className="text-sm text-red-500">{exportError}</span>
            )}

            {/* Resolution Picker */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Resolution:</span>
              <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <button
                  onClick={() => setExportScale(1)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    exportScale === 1
                      ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  1x
                </button>
                <button
                  onClick={() => setExportScale(2)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    exportScale === 2
                      ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  2x
                </button>
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Exporting...
                </>
              ) : exportSuccess ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Downloaded!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div ref={previewContainerRef} className="flex-1 overflow-auto p-6 bg-gray-100 dark:bg-gray-900">
          <div className="max-w-[612px] mx-auto space-y-4">
            {/* Render all pages */}
            {pages.map((page, idx) => (
              <div
                key={page.id}
                data-page-id={page.id}
                ref={(el) => {
                  if (el) {
                    pageRefs.current.set(page.id, el)
                  } else {
                    pageRefs.current.delete(page.id)
                  }
                }}
              >
                {/* Page Number Label */}
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
                  Page {idx + 1}
                </div>
                {/* Page Preview */}
                <div
                  className={`rounded-lg overflow-hidden shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 cursor-pointer transition-all ${
                    idx === currentPageIndex ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => {
                    isUserScrolling.current = false
                    setCurrentPageIndex(idx)
                    // Re-enable scroll detection after a short delay
                    setTimeout(() => { isUserScrolling.current = true }, 100)
                  }}
                >
                  <ContentPage
                    title={title}
                    blocks={page.blocks}
                    pageNumber={idx + 1}
                    scale={1}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Block Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteBlockConfirm !== null}
        onConfirm={() => deleteBlockConfirm && removeBlock(deleteBlockConfirm.blockId)}
        onCancel={() => setDeleteBlockConfirm(null)}
        itemType={deleteBlockConfirm?.blockType || 'Block'}
      />

      {/* Delete Page Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deletePageConfirm !== null}
        onConfirm={() => deletePageConfirm !== null && removePage(deletePageConfirm)}
        onCancel={() => setDeletePageConfirm(null)}
        itemType="Page"
        itemLabel={deletePageConfirm !== null ? String(deletePageConfirm + 1) : undefined}
      />
    </div>
  )
}
