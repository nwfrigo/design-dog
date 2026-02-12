'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useStore } from '@/store'
import { ContentPage, CoverPage } from './templates/FaqPdf'
import type { FaqContentBlock, FaqPage } from '@/types'
import { RichTextEditor } from './RichTextEditor'
import { TableGridPicker } from './TableGridPicker'
import { ZoomableImage } from './ZoomableImage'
import { FaqCoverImageLibraryModal } from './FaqCoverImageLibraryModal'
import { solutionCategories, type SolutionCategory } from '@/config/solution-overview-assets'
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

// Page layout constants (matches ContentPage.tsx)
const PAGE_CONTENT_HEIGHT = 660 // Available height for content (792 - 96 top - 36 bottom)
const BLOCK_MARGIN_BOTTOM = 24 // Each block has marginBottom: 24

// Component to measure block heights in an offscreen container
function BlockMeasurer({
  blocks,
  onMeasured,
}: {
  blocks: FaqContentBlock[]
  onMeasured: (heights: Map<string, number>) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Wait for fonts and rendering
    const measure = async () => {
      await document.fonts.ready
      // Small delay to ensure render is complete
      await new Promise(resolve => setTimeout(resolve, 50))

      const heights = new Map<string, number>()
      const blockElements = containerRef.current?.querySelectorAll('[data-block-id]')

      blockElements?.forEach(el => {
        const blockId = el.getAttribute('data-block-id')
        if (blockId) {
          heights.set(blockId, el.getBoundingClientRect().height + BLOCK_MARGIN_BOTTOM)
        }
      })

      onMeasured(heights)
    }

    measure()
  }, [blocks, onMeasured])

  // Render blocks in the same style as ContentPage for accurate measurement
  const renderBlock = (block: FaqContentBlock) => {
    switch (block.type) {
      case 'heading':
        return (
          <div
            key={block.id}
            data-block-id={block.id}
            style={{
              color: 'black',
              fontSize: 18,
              fontFamily: 'Fakt Pro, sans-serif',
              fontWeight: 350,
              wordWrap: 'break-word',
              marginBottom: 24,
            }}
          >
            {block.text}
          </div>
        )

      case 'qa':
        return (
          <div
            key={block.id}
            data-block-id={block.id}
            style={{
              width: 492,
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              gap: 12,
              display: 'flex',
              marginBottom: 24,
            }}
          >
            <div
              style={{
                alignSelf: 'stretch',
                color: 'black',
                fontSize: 12,
                fontFamily: 'Fakt Pro, sans-serif',
                fontWeight: 500,
                lineHeight: '16px',
                wordWrap: 'break-word',
              }}
            >
              {block.question}
            </div>
            <div
              style={{
                alignSelf: 'stretch',
                color: 'black',
                fontSize: 12,
                fontFamily: 'Fakt Pro, sans-serif',
                fontWeight: 350,
                lineHeight: '16px',
                wordWrap: 'break-word',
              }}
              dangerouslySetInnerHTML={{ __html: block.answer }}
            />
          </div>
        )

      case 'table':
        return (
          <div
            key={block.id}
            data-block-id={block.id}
            style={{
              width: 492,
              marginBottom: 24,
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                tableLayout: 'fixed',
                fontSize: 12,
                fontFamily: 'Fakt Pro, sans-serif',
                fontWeight: 350,
                lineHeight: '16px',
              }}
            >
              <tbody>
                {block.data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        style={{
                          border: '0.5px solid #89888B',
                          padding: 8,
                          verticalAlign: 'top',
                          color: 'black',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        left: -9999,
        top: -9999,
        width: 492, // Same as ContentPage content width
        visibility: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {blocks.map(renderBlock)}
    </div>
  )
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
  onRequestFullscreen,
}: {
  block: FaqContentBlock
  blockIndex: number
  isExpanded: boolean
  onToggleExpand: () => void
  onUpdate: (updates: Partial<FaqContentBlock>) => void
  onDelete: () => void
  updateTableCell: (rowIndex: number, colIndex: number, value: string) => void
  onRequestFullscreen?: () => void
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
      className={`bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-transparent rounded-lg overflow-hidden ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      {/* Collapsed Header - Always visible */}
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#252540] transition-colors"
        onClick={onToggleExpand}
      >
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Block Type Badge */}
        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wide w-14">
          {block.type === 'heading' ? 'Header' : block.type === 'qa' ? 'Q&A' : 'Table'}
        </span>

        {/* Block Preview Text */}
        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
          {getBlockLabel()}
        </span>

        {/* Expand/Collapse Icon */}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
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
          className="p-1 text-gray-500 hover:text-red-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-gray-200 dark:border-gray-700/50">
          {block.type === 'heading' && (
            <input
              type="text"
              value={block.text}
              onChange={(e) => onUpdate({ text: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
              placeholder="Enter heading text"
            />
          )}

          {block.type === 'qa' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Question</label>
                <input
                  type="text"
                  value={block.question}
                  onChange={(e) => onUpdate({ question: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                  placeholder="Enter question"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Answer</label>
                <RichTextEditor
                  content={block.answer}
                  onChange={(html) => onUpdate({ answer: html })}
                  placeholder="Enter answer with formatting..."
                  onRequestFullscreen={onRequestFullscreen}
                />
              </div>
              {/* Done button to collapse block */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={onToggleExpand}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {block.type === 'table' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                <span>{block.rows} × {block.cols} table</span>
                <button
                  type="button"
                  onClick={() => {
                    const newRows = block.rows + 1
                    const newData = [...block.data, Array(block.cols).fill('')]
                    onUpdate({ rows: newRows, data: newData })
                  }}
                  className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300"
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
                  className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300"
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
                    className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300"
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
                    className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    - Col
                  </button>
                )}
              </div>

              <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody>
                    {block.data.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, colIndex) => (
                          <td key={colIndex} className="border border-gray-300 dark:border-gray-700 p-0">
                            <input
                              type="text"
                              value={cell}
                              onChange={(e) => updateTableCell(rowIndex, colIndex, e.target.value)}
                              className="w-full px-2 py-1.5 text-xs bg-gray-100 dark:bg-[#0d0d1a] text-gray-900 dark:text-gray-100 border-0 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500"
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
  const {
    setCurrentScreen,
    // FAQ state from Zustand store (persisted)
    faqTitle: title,
    setFaqTitle: setTitle,
    faqPages: pages,
    setFaqPages: setPages,
    faqCoverSolution: coverSolution,
    setFaqCoverSolution: setCoverSolution,
    faqCoverImageUrl: coverImageUrl,
    setFaqCoverImageUrl: setCoverImageUrl,
    faqCoverImagePosition: coverImagePosition,
    setFaqCoverImagePosition: setCoverImagePosition,
    faqCoverImageZoom: coverImageZoom,
    setFaqCoverImageZoom: setCoverImageZoom,
    faqCoverImageGrayscale: coverImageGrayscale,
    setFaqCoverImageGrayscale: setCoverImageGrayscale,
    faqCoverSubheader: coverSubheader,
    setFaqCoverSubheader: setCoverSubheader,
  } = useStore()

  // Local UI state (not persisted)
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set())
  const [showTablePicker, setShowTablePicker] = useState(false)
  const [deleteBlockConfirm, setDeleteBlockConfirm] = useState<{ blockId: string; blockType: string } | null>(null)
  const [deletePageConfirm, setDeletePageConfirm] = useState<number | null>(null)
  const [fullscreenEditBlock, setFullscreenEditBlock] = useState<{ blockId: string; question: string; answer: string } | null>(null)

  // Preview state (matching SO editor pattern)
  const [pdfPreviewZoom, setPdfPreviewZoom] = useState(150)
  const [showPdfFullscreen, setShowPdfFullscreen] = useState(false)
  const [showPdfAllPagesPreview, setShowPdfAllPagesPreview] = useState(false)

  // Auto-pagination state
  const [blockHeights, setBlockHeights] = useState<Map<string, number>>(new Map())
  const isRedistributing = useRef(false)

  // Overflow toast state
  const [showOverflowToast, setShowOverflowToast] = useState(false)
  const [toastExiting, setToastExiting] = useState(false)
  const overflowToastTimeout = useRef<NodeJS.Timeout | null>(null)
  const lastOverflowState = useRef(false)

  // Content moved toast state (when auto-redistribution moves content)
  const [showMovedToast, setShowMovedToast] = useState(false)
  const [movedToastExiting, setMovedToastExiting] = useState(false)
  const movedToastTimeout = useRef<NodeJS.Timeout | null>(null)

  // Scroll-based page detection
  const pageRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const isUserScrolling = useRef(true)

  // Cover image modals
  const [showCoverImageLibrary, setShowCoverImageLibrary] = useState(false)
  const [showCoverImageCropModal, setShowCoverImageCropModal] = useState(false)

  // Track if we're viewing the cover page (index -1) or content pages (0+)
  // Cover is always page 1, content pages start at page 2
  const [viewingCover, setViewingCover] = useState(true)

  // Get all blocks from all pages for measurement
  const allBlocks = pages.flatMap(page => page.blocks)

  // Handle block height measurements and redistribute if needed
  const handleBlocksMeasured = useCallback((heights: Map<string, number>) => {
    setBlockHeights(heights)

    // Don't redistribute if already in progress
    if (isRedistributing.current) return

    // Check if redistribution is needed
    const needsRedistribution = pages.some(page => {
      let pageHeight = 0
      for (const block of page.blocks) {
        const blockHeight = heights.get(block.id) || 0
        pageHeight += blockHeight
        if (pageHeight > PAGE_CONTENT_HEIGHT) {
          return true
        }
      }
      return false
    })

    if (needsRedistribution) {
      isRedistributing.current = true

      // Collect all blocks in order
      const allBlocksOrdered = pages.flatMap(p => p.blocks)

      // Redistribute blocks across pages
      const newPages: FaqPage[] = []
      let currentPageBlocks: FaqContentBlock[] = []
      let currentPageHeight = 0

      for (const block of allBlocksOrdered) {
        const blockHeight = heights.get(block.id) || 0

        // Check if this block fits on current page
        if (currentPageHeight + blockHeight > PAGE_CONTENT_HEIGHT && currentPageBlocks.length > 0) {
          // Current page is full, start a new page
          newPages.push({
            id: newPages.length === 0 && pages[0] ? pages[0].id : generateId(),
            blocks: currentPageBlocks,
          })
          currentPageBlocks = []
          currentPageHeight = 0
        }

        currentPageBlocks.push(block)
        currentPageHeight += blockHeight
      }

      // Don't forget the last page
      if (currentPageBlocks.length > 0) {
        newPages.push({
          id: newPages.length < pages.length ? pages[newPages.length].id : generateId(),
          blocks: currentPageBlocks,
        })
      }

      // Update pages if redistribution changed anything
      if (newPages.length !== pages.length ||
          newPages.some((p, i) => p.blocks.length !== pages[i]?.blocks.length)) {
        setPages(newPages)

        // Show content moved toast
        if (movedToastTimeout.current) {
          clearTimeout(movedToastTimeout.current)
          movedToastTimeout.current = null
        }
        setShowMovedToast(true)
        setMovedToastExiting(false)

        movedToastTimeout.current = setTimeout(() => {
          setMovedToastExiting(true)
          setTimeout(() => {
            setShowMovedToast(false)
            setMovedToastExiting(false)
          }, 500)
        }, 4000)

        // Adjust current page index if needed
        if (currentPageIndex >= newPages.length) {
          setCurrentPageIndex(newPages.length - 1)
        }
      }

      // Reset flag after a short delay to allow state to settle
      setTimeout(() => {
        isRedistributing.current = false
      }, 100)
    }
  }, [pages, currentPageIndex])

  // Get current page
  const currentPage = pages[currentPageIndex]

  // Calculate overflow info for a block based on its position
  const getBlockOverflowInfo = useCallback((blockIndex: number): { isOverflowing: boolean; overflowAmount: number } => {
    if (!currentPage || blockHeights.size === 0) {
      return { isOverflowing: false, overflowAmount: 0 }
    }

    // Calculate height used by blocks before this one
    let heightUsedBefore = 0
    for (let i = 0; i < blockIndex; i++) {
      const block = currentPage.blocks[i]
      if (block) {
        heightUsedBefore += blockHeights.get(block.id) || 0
      }
    }

    // Get this block's height
    const thisBlock = currentPage.blocks[blockIndex]
    const thisBlockHeight = thisBlock ? (blockHeights.get(thisBlock.id) || 0) : 0

    // Calculate available space and overflow
    const availableSpace = PAGE_CONTENT_HEIGHT - heightUsedBefore
    const overflowAmount = thisBlockHeight - availableSpace

    // Add a small buffer (20px) to prevent flickering at the boundary
    const isOverflowing = overflowAmount > 20

    return { isOverflowing, overflowAmount: Math.max(0, overflowAmount) }
  }, [currentPage, blockHeights])

  // Check if any block on current page is overflowing and show toast
  useEffect(() => {
    if (!currentPage || blockHeights.size === 0) return

    // Check if any block is overflowing
    let hasOverflow = false
    for (let i = 0; i < currentPage.blocks.length; i++) {
      const { isOverflowing } = getBlockOverflowInfo(i)
      if (isOverflowing) {
        hasOverflow = true
        break
      }
    }

    // Only show toast when overflow state changes from false to true
    if (hasOverflow && !lastOverflowState.current) {
      // Clear any existing timeout
      if (overflowToastTimeout.current) {
        clearTimeout(overflowToastTimeout.current)
        overflowToastTimeout.current = null
      }

      setShowOverflowToast(true)
      setToastExiting(false)

      // Start exit animation after 4 seconds
      overflowToastTimeout.current = setTimeout(() => {
        setToastExiting(true)
        // Remove toast after animation completes (500ms)
        setTimeout(() => {
          setShowOverflowToast(false)
          setToastExiting(false)
        }, 500)
      }, 4000)
    }

    lastOverflowState.current = hasOverflow
    // Note: Don't clear timeout in cleanup - let it run to completion
  }, [currentPage, blockHeights, getBlockOverflowInfo])

  // Cleanup timeouts only on unmount
  useEffect(() => {
    return () => {
      if (overflowToastTimeout.current) {
        clearTimeout(overflowToastTimeout.current)
      }
      if (movedToastTimeout.current) {
        clearTimeout(movedToastTimeout.current)
      }
    }
  }, [])

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

        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const pageId = entry.target.getAttribute('data-page-id')
            const pageIndex = pages.findIndex(p => p.id === pageId)
            if (pageIndex !== -1 && pageIndex !== currentPageIndex) {
              setCurrentPageIndex(pageIndex)
            }
          }
        })
      },
      {
        root: container,
        rootMargin: '-33% 0px -66% 0px',
        threshold: 0
      }
    )

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
    setPages(pages.map((page, idx) => {
      if (idx !== currentPageIndex) return page
      return {
        ...page,
        blocks: page.blocks.map(block =>
          block.id === blockId ? { ...block, ...updates } as FaqContentBlock : block
        ),
      }
    }))
  }, [currentPageIndex, pages, setPages])

  // Handle ESC key for fullscreen modals (must be after updateBlock is defined)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (fullscreenEditBlock) {
          // Save changes when pressing ESC in fullscreen editor
          updateBlock(fullscreenEditBlock.blockId, {
            question: fullscreenEditBlock.question,
            answer: fullscreenEditBlock.answer,
          })
          setFullscreenEditBlock(null)
        }
        if (showPdfFullscreen) setShowPdfFullscreen(false)
        if (showPdfAllPagesPreview) setShowPdfAllPagesPreview(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showPdfFullscreen, showPdfAllPagesPreview, fullscreenEditBlock, updateBlock])

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

    setPages(pages.map((page, idx) => {
      if (idx !== currentPageIndex) return page
      return { ...page, blocks: [...page.blocks, newBlock] }
    }))

    // Auto-expand the new block
    setExpandedBlocks(prev => new Set(prev).add(newBlock.id))
  }, [currentPageIndex, pages, setPages])

  const removeBlock = useCallback((blockId: string) => {
    setPages(pages.map((page, idx) => {
      if (idx !== currentPageIndex) return page
      return {
        ...page,
        blocks: page.blocks.filter(block => block.id !== blockId),
      }
    }))
    setDeleteBlockConfirm(null)
  }, [currentPageIndex, pages, setPages])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setPages(pages.map((page, idx) => {
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
    setPages(pages.map((page, idx) => {
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
  }, [currentPageIndex, pages, setPages])

  // Page management
  const addPage = useCallback(() => {
    setPages([...pages, { id: generateId(), blocks: [] }])
    setCurrentPageIndex(pages.length)
  }, [pages, setPages])

  const removePage = useCallback((pageIndex: number) => {
    if (pages.length <= 1) return
    setPages(pages.filter((_, idx) => idx !== pageIndex))
    if (currentPageIndex >= pageIndex && currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1)
    }
    setDeletePageConfirm(null)
  }, [pages, setPages, currentPageIndex])

  // Navigate to Review & Export screen
  // FAQ data is already in Zustand store, no need to save to sessionStorage
  const handleReviewExport = () => {
    setCurrentScreen('faq-export')
  }

  return (
    <div className="space-y-6">
      {/* Overflow Toast Notification */}
      {showOverflowToast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
            toastExiting
              ? 'opacity-0 -translate-y-4'
              : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg shadow-lg backdrop-blur-sm">
            <svg className="w-5 h-5 flex-shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm font-medium text-amber-400">
              Content exceeds page height. Consider splitting into multiple blocks.
            </span>
          </div>
        </div>
      )}

      {/* Content Moved Toast Notification */}
      {showMovedToast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
            movedToastExiting
              ? 'opacity-0 -translate-y-4'
              : 'opacity-100 translate-y-0'
          }`}
          style={{ marginTop: showOverflowToast ? '60px' : '0' }}
        >
          <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg shadow-lg backdrop-blur-sm">
            <svg className="w-5 h-5 flex-shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-sm font-medium text-amber-400">
              Your content exceeded the page height and has been moved to a new page.
            </span>
          </div>
        </div>
      )}

      {/* Hidden block measurer for auto-pagination */}
      <BlockMeasurer blocks={allBlocks} onMeasured={handleBlocksMeasured} />

      {/* Title Tab - matches SO editor pattern */}
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          <div className="px-4 py-2.5 text-sm font-medium border-t border-l border-r rounded-t-lg -mb-px border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            FAQ - {title || 'Untitled'}
          </div>
        </div>
      </div>

      {/* Main Editor Layout */}
      <div className="flex gap-6">
        {/* Left: Editor Sidebar */}
        <div className="w-[420px] flex-shrink-0">
          <div className="bg-gray-100 dark:bg-[#0d0d1a] rounded-xl p-5 space-y-5">
            {/* Page Header */}
            <div>
              <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
                {viewingCover ? 'Cover' : `Page ${currentPageIndex + 2}`}
              </h2>

              {/* Page Navigation */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs text-gray-500 dark:text-gray-500">
                    Pages ({pages.length + 1})
                  </label>
                  <button
                    onClick={() => {
                      addPage()
                      setViewingCover(false)
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    + Add Page
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {/* Cover page button */}
                  <button
                    onClick={() => setViewingCover(true)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      viewingCover
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-[#1a1a2e] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#252540] hover:text-gray-900 dark:hover:text-gray-200 border border-gray-300 dark:border-transparent'
                    }`}
                  >
                    Cover
                  </button>
                  {/* Content page buttons */}
                  {pages.map((page, idx) => (
                    <button
                      key={page.id}
                      onClick={() => {
                        setViewingCover(false)
                        setCurrentPageIndex(idx)
                      }}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        !viewingCover && idx === currentPageIndex
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-[#1a1a2e] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#252540] hover:text-gray-900 dark:hover:text-gray-200 border border-gray-300 dark:border-transparent'
                      }`}
                    >
                      Page {idx + 2}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cover Page Controls */}
            {viewingCover && (
              <div className="space-y-4">
                {/* Cover Subheader */}
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5">
                    Cover Subheader
                  </label>
                  <input
                    type="text"
                    value={coverSubheader}
                    onChange={(e) => setCoverSubheader(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                    placeholder="Frequently Asked Questions"
                  />
                </div>

                {/* Document Title (shared between cover and content pages) */}
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5">
                    Document Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                    placeholder="Enter document title"
                  />
                  <div className="text-right text-xs text-gray-500 dark:text-gray-500 mt-1">{title.length}/60</div>
                </div>

                {/* Solution Category */}
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5">
                    Solution Category
                  </label>
                  <select
                    value={coverSolution}
                    onChange={(e) => setCoverSolution(e.target.value as SolutionCategory | 'none')}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                  >
                    <option value="none">None</option>
                    {Object.entries(solutionCategories)
                      .filter(([key]) => key !== 'converged')
                      .map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.label}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5">Cover Image</label>
                  {!coverImageUrl ? (
                    <div className="flex gap-2">
                      {/* Upload box */}
                      <div className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-16 hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                        <label className="flex flex-col items-center justify-center h-full cursor-pointer text-xs text-gray-500 dark:text-gray-400">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file && file.type.startsWith('image/')) {
                                const reader = new FileReader()
                                reader.onload = () => {
                                  setCoverImageUrl(reader.result as string)
                                }
                                reader.readAsDataURL(file)
                              }
                            }}
                            className="hidden"
                          />
                          <svg className="w-4 h-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          Drop or upload
                        </label>
                      </div>
                      {/* Library box */}
                      <button
                        onClick={() => setShowCoverImageLibrary(true)}
                        className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-16
                          hover:border-gray-400 dark:hover:border-gray-500 transition-colors
                          flex flex-col items-center justify-center text-xs text-gray-500 dark:text-gray-400"
                      >
                        <svg className="w-4 h-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Choose from library
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Image preview - click to adjust */}
                      <div className="relative">
                        <div
                          onClick={() => setShowCoverImageCropModal(true)}
                          className="cursor-pointer overflow-hidden rounded-lg border border-gray-600 hover:border-blue-400 transition-colors"
                          style={{ width: '100%', height: 200 }}
                        >
                          <img
                            src={coverImageUrl}
                            alt="Cover image"
                            className="w-full h-full object-cover"
                            style={{
                              objectPosition: `${50 - coverImagePosition.x}% ${50 - coverImagePosition.y}%`,
                              transform: coverImageZoom !== 1 ? `scale(${coverImageZoom})` : undefined,
                              filter: coverImageGrayscale ? 'grayscale(100%)' : undefined,
                            }}
                          />
                        </div>
                        {/* Adjust button */}
                        <button
                          onClick={() => setShowCoverImageCropModal(true)}
                          className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/60 rounded text-white text-xs hover:bg-black/80 transition-colors z-20"
                        >
                          Adjust
                        </button>
                      </div>
                      {/* Grayscale toggle */}
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-gray-500 dark:text-gray-500">Grayscale</label>
                        <button
                          onClick={() => setCoverImageGrayscale(!coverImageGrayscale)}
                          className={`relative w-9 h-5 rounded-full transition-colors ${
                            coverImageGrayscale ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                              coverImageGrayscale ? 'translate-x-4' : ''
                            }`}
                          />
                        </button>
                      </div>
                      {/* Replace/Remove buttons */}
                      <div className="flex gap-2">
                        {/* Replace with upload */}
                        <div className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                          <label className="flex items-center justify-center gap-1 h-8 cursor-pointer text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file && file.type.startsWith('image/')) {
                                  const reader = new FileReader()
                                  reader.onload = () => {
                                    setCoverImageUrl(reader.result as string)
                                    setCoverImagePosition({ x: 0, y: 0 })
                                    setCoverImageZoom(1)
                                  }
                                  reader.readAsDataURL(file)
                                }
                              }}
                              className="hidden"
                            />
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Upload new
                          </label>
                        </div>
                        {/* Replace from library */}
                        <button
                          onClick={() => setShowCoverImageLibrary(true)}
                          className="flex-1 flex items-center justify-center gap-1 h-8 border border-gray-300 dark:border-gray-600 rounded-lg text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          From library
                        </button>
                        {/* Remove button */}
                        <button
                          onClick={() => {
                            setCoverImageUrl(null)
                            setCoverImagePosition({ x: 0, y: 0 })
                            setCoverImageZoom(1)
                            setCoverImageGrayscale(false)
                          }}
                          className="flex items-center justify-center w-8 h-8 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-500 hover:border-red-500/50 transition-colors"
                          title="Remove image"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Content Page Controls */}
            {!viewingCover && (
              <>
                {/* Add Content Buttons */}
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5">
                    Add Content
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addBlock('heading')}
                      className="flex-1 px-3 py-2 text-xs bg-white dark:bg-[#1a1a2e] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-[#252540] border border-gray-300 dark:border-transparent transition-colors"
                    >
                      + Heading
                    </button>
                    <button
                      onClick={() => addBlock('qa')}
                      className="flex-1 px-3 py-2 text-xs bg-white dark:bg-[#1a1a2e] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-[#252540] border border-gray-300 dark:border-transparent transition-colors"
                    >
                      + Q&A
                    </button>
                    <div className="relative flex-1">
                      <button
                        onClick={() => setShowTablePicker(!showTablePicker)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-[#1a1a2e] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-[#252540] border border-gray-300 dark:border-transparent transition-colors"
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
                  <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5">
                    Page {currentPageIndex + 2} Content ({currentPage?.blocks.length || 0} items)
                  </label>

                  {!currentPage || currentPage.blocks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-500 text-sm border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
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
                              onRequestFullscreen={block.type === 'qa' ? () => setFullscreenEditBlock({
                                blockId: block.id,
                                question: block.question,
                                answer: block.answer,
                              }) : undefined}
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
                    className="w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    Delete Page {currentPageIndex + 2}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right: Preview with Actions */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar - matches SO editor pattern */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {/* Preview Button */}
              <button
                onClick={() => setShowPdfAllPagesPreview(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                  text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-md
                  hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors
                  border border-gray-200 dark:border-gray-700"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </button>

              {/* Review & Export Button */}
              <button
                onClick={handleReviewExport}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white
                  bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
              >
                Review & Export
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Page Picker */}
              <div className="flex items-center gap-1 ml-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Page</span>
                <div className="flex">
                  {/* Cover page button */}
                  <button
                    onClick={() => setViewingCover(true)}
                    className={`w-7 h-7 text-xs font-medium transition-colors border border-gray-300 dark:border-gray-600 rounded-l ${
                      viewingCover
                        ? 'bg-blue-500 text-white border-blue-500 z-10 relative'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    1
                  </button>
                  {/* Content page buttons */}
                  {pages.map((page, idx) => (
                    <button
                      key={page.id}
                      onClick={() => {
                        setViewingCover(false)
                        setCurrentPageIndex(idx)
                      }}
                      className={`w-7 h-7 text-xs font-medium transition-colors border border-gray-300 dark:border-gray-600 -ml-px ${
                        idx === pages.length - 1 ? 'rounded-r' : ''
                      } ${
                        !viewingCover && currentPageIndex === idx
                          ? 'bg-blue-500 text-white border-blue-500 z-10 relative'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {idx + 2}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 ml-1" />

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 ml-1">
                <button
                  onClick={() => setPdfPreviewZoom(Math.max(75, pdfPreviewZoom - 25))}
                  disabled={pdfPreviewZoom <= 75}
                  className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-300 dark:border-gray-600 rounded-l bg-white dark:bg-gray-800"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <select
                  value={pdfPreviewZoom}
                  onChange={(e) => setPdfPreviewZoom(Number(e.target.value))}
                  className="h-7 px-2 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border-y border-gray-300 dark:border-gray-600 focus:outline-none cursor-pointer"
                >
                  <option value={200}>200%</option>
                  <option value={175}>175%</option>
                  <option value={150}>150%</option>
                  <option value={125}>125%</option>
                  <option value={100}>100%</option>
                  <option value={75}>75%</option>
                </select>
                <button
                  onClick={() => setPdfPreviewZoom(Math.min(200, pdfPreviewZoom + 25))}
                  disabled={pdfPreviewZoom >= 200}
                  className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowPdfFullscreen(true)}
                  className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-r bg-white dark:bg-gray-800 ml-1"
                  title="Fullscreen preview (ESC to exit)"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-gray-100 dark:bg-transparent rounded-xl p-6 flex items-start justify-center overflow-auto">
            <div
              className="ring-1 ring-gray-300/50 dark:ring-gray-700/50 rounded-sm shadow-lg"
              style={{
                width: 612 * (pdfPreviewZoom / 100),
                height: 792 * (pdfPreviewZoom / 100),
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 612,
                height: 792,
                transform: `scale(${pdfPreviewZoom / 100})`,
                transformOrigin: 'top left',
              }}>
                {viewingCover ? (
                  <CoverPage
                    title={title}
                    subheader={coverSubheader}
                    solution={coverSolution}
                    coverImageUrl={coverImageUrl || undefined}
                    coverImagePosition={coverImagePosition}
                    coverImageZoom={coverImageZoom}
                    coverImageGrayscale={coverImageGrayscale}
                    scale={1}
                  />
                ) : (
                  <ContentPage
                    title={title}
                    blocks={currentPage?.blocks || []}
                    pageNumber={currentPageIndex + 2}
                    scale={1}
                  />
                )}
              </div>
            </div>
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

      {/* Fullscreen Preview Modal */}
      {showPdfFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8">
          <button
            onClick={() => setShowPdfFullscreen(false)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="max-h-full overflow-auto">
            {viewingCover ? (
              <CoverPage
                title={title}
                subheader={coverSubheader}
                solution={coverSolution}
                coverImageUrl={coverImageUrl || undefined}
                coverImagePosition={coverImagePosition}
                coverImageZoom={coverImageZoom}
                coverImageGrayscale={coverImageGrayscale}
                scale={1}
              />
            ) : (
              <ContentPage
                title={title}
                blocks={currentPage?.blocks || []}
                pageNumber={currentPageIndex + 2}
                scale={1}
              />
            )}
          </div>
        </div>
      )}

      {/* All Pages Preview Modal */}
      {showPdfAllPagesPreview && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <h3 className="text-lg font-medium text-white">
              All Pages Preview ({pages.length + 1} page{pages.length !== 0 ? 's' : ''})
            </h3>
            <button
              onClick={() => setShowPdfAllPagesPreview(false)}
              className="p-2 text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div
            ref={previewContainerRef}
            className="flex-1 overflow-auto p-8"
          >
            <div className="max-w-[612px] mx-auto space-y-6">
              {/* Cover Page */}
              <div>
                <div className="text-xs text-gray-400 text-center mb-2">
                  Page 1 (Cover)
                </div>
                <div
                  className={`rounded-lg overflow-hidden shadow-lg cursor-pointer transition-all ${
                    viewingCover ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-700'
                  }`}
                  onClick={() => {
                    isUserScrolling.current = false
                    setViewingCover(true)
                    setTimeout(() => { isUserScrolling.current = true }, 100)
                  }}
                >
                  <CoverPage
                    title={title}
                    subheader={coverSubheader}
                    solution={coverSolution}
                    coverImageUrl={coverImageUrl || undefined}
                    coverImagePosition={coverImagePosition}
                    coverImageZoom={coverImageZoom}
                    coverImageGrayscale={coverImageGrayscale}
                    scale={1}
                  />
                </div>
              </div>

              {/* Content Pages */}
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
                  <div className="text-xs text-gray-400 text-center mb-2">
                    Page {idx + 2}
                  </div>
                  <div
                    className={`rounded-lg overflow-hidden shadow-lg cursor-pointer transition-all ${
                      !viewingCover && idx === currentPageIndex ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-700'
                    }`}
                    onClick={() => {
                      isUserScrolling.current = false
                      setViewingCover(false)
                      setCurrentPageIndex(idx)
                      setTimeout(() => { isUserScrolling.current = true }, 100)
                    }}
                  >
                    <ContentPage
                      title={title}
                      blocks={page.blocks}
                      pageNumber={idx + 2}
                      scale={1}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Rich Text Editor Modal */}
      {fullscreenEditBlock && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex-1 mr-4">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Question</label>
                <input
                  type="text"
                  value={fullscreenEditBlock.question}
                  onChange={(e) => setFullscreenEditBlock(prev => prev ? { ...prev, question: e.target.value } : null)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                  placeholder="Enter question"
                />
              </div>
            </div>

            {/* Modal Body - Rich Text Editor */}
            <div className="flex-1 p-6 overflow-auto">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">Answer</label>
              <div className="h-[400px]">
                <RichTextEditor
                  content={fullscreenEditBlock.answer}
                  onChange={(html) => setFullscreenEditBlock(prev => prev ? { ...prev, answer: html } : null)}
                  placeholder="Enter answer with formatting..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setFullscreenEditBlock(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Save changes back to the block
                  if (fullscreenEditBlock) {
                    updateBlock(fullscreenEditBlock.blockId, {
                      question: fullscreenEditBlock.question,
                      answer: fullscreenEditBlock.answer,
                    })
                  }
                  setFullscreenEditBlock(null)
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cover Image Library Modal */}
      {showCoverImageLibrary && (
        <FaqCoverImageLibraryModal
          solution={coverSolution === 'none' ? 'converged' : coverSolution}
          onSelect={(url) => {
            setCoverImageUrl(url)
            setCoverImagePosition({ x: 0, y: 0 })
            setCoverImageZoom(1)
            setShowCoverImageLibrary(false)
          }}
          onClose={() => setShowCoverImageLibrary(false)}
        />
      )}

      {/* Cover Image Crop/Adjust Modal */}
      {showCoverImageCropModal && coverImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCoverImageCropModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Adjust Cover Image
              </h3>
              <button
                onClick={() => setShowCoverImageCropModal(false)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex justify-center mb-4">
              <ZoomableImage
                src={coverImageUrl}
                containerWidth={204}
                containerHeight={400}
                zoom={coverImageZoom}
                position={coverImagePosition}
                onZoomChange={setCoverImageZoom}
                onPositionChange={setCoverImagePosition}
                borderRadius={8}
                border="1px solid #e5e7eb"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setCoverImagePosition({ x: 0, y: 0 })
                  setCoverImageZoom(1)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setShowCoverImageCropModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
