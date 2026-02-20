'use client'

import { ReactNode, CSSProperties } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { StackerModule } from '@/types'
import { StackerDropIndicator } from './StackerDropIndicator'

const LOCKED_MODULE_TYPES = ['logo-chip', 'header', 'footer']

export interface StackerDraggableModuleProps {
  module: StackerModule
  children: ReactNode
  isSelected: boolean
  isOverAbove: boolean
  onSelect: (moduleId: string) => void
  onDelete: (moduleId: string) => void
}

// Locked module wrapper (no drag, just click-to-select)
function LockedModuleWrapper({
  module,
  children,
  isSelected,
  onSelect,
}: {
  module: StackerModule
  children: ReactNode
  isSelected: boolean
  onSelect: (moduleId: string) => void
}) {
  const contentStyle: CSSProperties = {
    position: 'relative',
    borderRadius: 4,
    outline: isSelected ? '2px solid #3B82F6' : 'none',
    outlineOffset: 4,
    cursor: 'pointer',
  }

  const lockIconStyle: CSSProperties = {
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
    pointerEvents: 'none',
    opacity: 0,
    transition: 'opacity 150ms ease-out',
  }

  return (
    <div className="group">
      <div
        style={contentStyle}
        onClick={() => onSelect(module.id)}
      >
        {children}
        <div
          style={lockIconStyle}
          className="group-hover:!opacity-100"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  )
}

// Draggable module wrapper (with dnd-kit sortable)
function DraggableModuleWrapper({
  module,
  children,
  isSelected,
  isOverAbove,
  onSelect,
  onDelete,
}: StackerDraggableModuleProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: module.id,
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
    outlineOffset: 4,
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
    top: -12,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 12px',
    background: 'white',
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    cursor: 'grab',
    pointerEvents: 'auto',
    opacity: 0,
    transition: 'opacity 150ms ease-out',
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
  }

  return (
    <div
      ref={setNodeRef}
      style={wrapperStyle}
      className="group"
    >
      {/* Drop indicator above this module */}
      <div style={{ marginBottom: isOverAbove ? 8 : 0, transition: 'margin 200ms ease-out' }}>
        <StackerDropIndicator isVisible={isOverAbove} />
      </div>

      <div
        style={contentStyle}
        onClick={() => onSelect(module.id)}
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
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
              <path d="M0 1h16M0 5h16M0 9h16" stroke="#9CA3AF" strokeWidth="1.5" />
            </svg>
          </button>

          {/* Delete button */}
          <button
            style={deleteButtonStyle}
            className="group-hover:!opacity-100 hover:!bg-red-50"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(module.id)
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// Main export - chooses between locked and draggable wrapper
export function StackerDraggableModule(props: StackerDraggableModuleProps) {
  const isLocked = LOCKED_MODULE_TYPES.includes(props.module.type)

  if (isLocked) {
    return (
      <LockedModuleWrapper
        module={props.module}
        isSelected={props.isSelected}
        onSelect={props.onSelect}
      >
        {props.children}
      </LockedModuleWrapper>
    )
  }

  return <DraggableModuleWrapper {...props} />
}

export default StackerDraggableModule
