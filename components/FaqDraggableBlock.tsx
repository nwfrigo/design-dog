'use client'

import { ReactNode, CSSProperties } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { StackerDropIndicator } from './StackerDropIndicator'

export interface FaqDraggableBlockProps {
  blockId: string
  children: ReactNode
  isSelected: boolean
  isOverAbove: boolean
  onSelect: (blockId: string) => void
  onDelete: (blockId: string) => void
}

export function FaqDraggableBlock({
  blockId,
  children,
  isSelected,
  isOverAbove,
  onSelect,
  onDelete,
}: FaqDraggableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: blockId,
  })

  const wrapperStyle: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'margin 200ms ease-out',
    opacity: isDragging ? 0.4 : 1,
    position: 'relative',
  }

  const contentStyle: CSSProperties = {
    position: 'relative',
    borderRadius: 4,
    outline: isSelected ? '1px solid #3B82F6' : 'none',
    outlineOffset: 4,
    cursor: 'pointer',
  }

  // Drag handle — left side, 6-dot grip (matches Stacker pattern)
  const dragHandleStyle: CSSProperties = {
    position: 'absolute',
    left: -22,
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 28,
    background: 'white',
    borderRadius: 6,
    boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
    cursor: 'grab',
    opacity: isSelected ? 1 : 0,
    pointerEvents: isSelected ? 'auto' : 'none',
    transition: 'opacity 150ms ease-out',
    zIndex: 10,
  }

  // Delete button styles (top-right)
  const deleteButtonStyle: CSSProperties = {
    position: 'absolute',
    top: 4,
    right: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    background: 'white',
    borderRadius: '50%',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    cursor: 'pointer',
    pointerEvents: 'auto',
    opacity: 0,
    transition: 'opacity 150ms ease-out',
    zIndex: 10,
  }

  return (
    <div
      ref={setNodeRef}
      style={wrapperStyle}
      className="group"
    >
      {/* Drop indicator above this block */}
      <div style={{ marginBottom: isOverAbove ? 6 : 0, transition: 'margin 200ms ease-out' }}>
        <StackerDropIndicator isVisible={isOverAbove} />
      </div>

      <div
        style={contentStyle}
        onClick={(e) => { e.stopPropagation(); onSelect(blockId) }}
      >
        {children}

        {/* Drag handle — left side, 6-dot grip, visible when selected */}
        <button
          {...attributes}
          {...listeners}
          style={dragHandleStyle}
          onClick={(e) => e.stopPropagation()}
        >
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
            <circle cx="3" cy="3" r="1.5" fill="#9CA3AF" />
            <circle cx="7" cy="3" r="1.5" fill="#9CA3AF" />
            <circle cx="3" cy="8" r="1.5" fill="#9CA3AF" />
            <circle cx="7" cy="8" r="1.5" fill="#9CA3AF" />
            <circle cx="3" cy="13" r="1.5" fill="#9CA3AF" />
            <circle cx="7" cy="13" r="1.5" fill="#9CA3AF" />
          </svg>
        </button>

        {/* Delete button — top-right, visible on hover */}
        <button
          style={deleteButtonStyle}
          className="group-hover:!opacity-100 hover:!bg-red-50"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(blockId)
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default FaqDraggableBlock
