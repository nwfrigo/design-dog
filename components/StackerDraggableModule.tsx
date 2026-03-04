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
  onDuplicate?: (moduleId: string) => void
  onToggleVisibility?: (moduleId: string) => void
  isHidden?: boolean
  readOnly?: boolean // When true, renders without any interactive controls
}

// Locked module wrapper (no drag, just click-to-select)
function LockedModuleWrapper({
  module,
  children,
  isSelected,
  onSelect,
  onToggleVisibility,
  isHidden,
}: {
  module: StackerModule
  children: ReactNode
  isSelected: boolean
  onSelect: (moduleId: string) => void
  onToggleVisibility?: (moduleId: string) => void
  isHidden?: boolean
}) {
  const isFooter = module.type === 'footer'

  const contentStyle: CSSProperties = {
    position: 'relative',
    borderRadius: 4,
    outline: isSelected ? '1px solid #3B82F6' : 'none',
    outlineOffset: 4,
    cursor: 'pointer',
    opacity: isHidden ? 0.35 : 1,
    transition: 'opacity 150ms ease-out',
  }

  const lockIconStyle: CSSProperties = {
    position: 'absolute',
    top: 4,
    right: isFooter && onToggleVisibility ? 36 : 4,
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

  const eyeButtonStyle: CSSProperties = {
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
    <div className="group">
      <div
        style={contentStyle}
        onClick={(e) => { e.stopPropagation(); onSelect(module.id) }}
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
        {/* Eye toggle — footer only */}
        {isFooter && onToggleVisibility && (
          <button
            style={eyeButtonStyle}
            className="group-hover:!opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              onToggleVisibility(module.id)
            }}
          >
            {isHidden ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        )}
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
  onDuplicate,
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
    outline: isSelected ? '1px solid #3B82F6' : 'none',
    outlineOffset: 4,
    cursor: 'pointer',
  }

  // Action button shared styles (top-right, visible on hover)
  const actionButtonBase: CSSProperties = {
    position: 'absolute',
    top: 4,
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

  const deleteButtonStyle: CSSProperties = {
    ...actionButtonBase,
    right: 4,
  }

  const duplicateButtonStyle: CSSProperties = {
    ...actionButtonBase,
    right: 36,
  }

  // Drag handle on the left — only visible when selected
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
        onClick={(e) => { e.stopPropagation(); onSelect(module.id) }}
      >
        {children}

        {/* Drag handle — left side, only when selected */}
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

        {/* Duplicate button — top-right (second), visible on hover */}
        {onDuplicate && (
          <button
            style={duplicateButtonStyle}
            className="group-hover:!opacity-100 hover:!bg-blue-50"
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate(module.id)
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* Delete button — top-right, visible on hover */}
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
  )
}

// Read-only wrapper (no controls, just renders content)
function ReadOnlyModuleWrapper({
  children,
}: {
  children: ReactNode
}) {
  return <div>{children}</div>
}

// Main export - chooses between locked, draggable, or read-only wrapper
export function StackerDraggableModule(props: StackerDraggableModuleProps) {
  // Read-only mode: no interactive controls at all
  if (props.readOnly) {
    return <ReadOnlyModuleWrapper>{props.children}</ReadOnlyModuleWrapper>
  }

  const isLocked = LOCKED_MODULE_TYPES.includes(props.module.type)

  if (isLocked) {
    return (
      <LockedModuleWrapper
        module={props.module}
        isSelected={props.isSelected}
        onSelect={props.onSelect}
        onToggleVisibility={props.onToggleVisibility}
        isHidden={props.isHidden}
      >
        {props.children}
      </LockedModuleWrapper>
    )
  }

  return <DraggableModuleWrapper {...props} />
}

export default StackerDraggableModule
