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
    outline: isSelected ? '2px solid #3B82F6' : 'none',
    outlineOffset: 2,
    cursor: 'pointer',
  }

  // Hover overlay with controls
  const overlayStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 10,
  }

  // Drag handle styles (center-top, pill-shaped)
  const dragHandleStyle: CSSProperties = {
    position: 'absolute',
    top: -10,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3px 10px',
    background: 'white',
    borderRadius: 10,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    cursor: 'grab',
    pointerEvents: 'auto',
    opacity: 0,
    transition: 'opacity 150ms ease-out',
  }

  // Delete button styles (top-right)
  const deleteButtonStyle: CSSProperties = {
    position: 'absolute',
    top: 2,
    right: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    background: 'white',
    borderRadius: '50%',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    cursor: 'pointer',
    pointerEvents: 'auto',
    opacity: 0,
    transition: 'opacity 150ms ease-out',
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
        onClick={() => onSelect(blockId)}
      >
        {children}

        {/* Hover overlay with controls */}
        <div style={overlayStyle}>
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            style={dragHandleStyle}
            className="group-hover:!opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <svg width="14" height="8" viewBox="0 0 16 10" fill="none">
              <path d="M0 1h16M0 5h16M0 9h16" stroke="#9CA3AF" strokeWidth="1.5" />
            </svg>
          </button>

          {/* Delete button */}
          <button
            style={deleteButtonStyle}
            className="group-hover:!opacity-100 hover:!bg-red-50"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(blockId)
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default FaqDraggableBlock
