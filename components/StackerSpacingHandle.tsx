'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

export interface StackerSpacingHandleProps {
  moduleId: string
  spacing: number
  onChange: (moduleId: string, spacing: number) => void
  scale: number // preview zoom factor (e.g., 1.0 for 100%)
}

export function StackerSpacingHandle({ moduleId, spacing, onChange, scale }: StackerSpacingHandleProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartY = useRef(0)
  const dragStartSpacing = useRef(0)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    dragStartY.current = e.clientY
    dragStartSpacing.current = spacing
  }, [spacing])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - dragStartY.current
      // Divide by scale to account for preview zoom
      const deltaPx = deltaY / scale
      const newSpacing = Math.round(Math.max(0, Math.min(96, dragStartSpacing.current + deltaPx)))
      onChange(moduleId, newSpacing)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, moduleId, onChange, scale])

  const showUI = isHovered || isDragging

  // Ensure minimum height for hover detection even when spacing is 0
  const minInteractiveHeight = 6

  return (
    <div
      style={{
        height: Math.max(spacing, minInteractiveHeight),
        marginTop: spacing < minInteractiveHeight ? -(minInteractiveHeight - spacing) / 2 : 0,
        marginBottom: spacing < minInteractiveHeight ? -(minInteractiveHeight - spacing) / 2 : 0,
        position: 'relative',
        cursor: isDragging ? 'ns-resize' : 'default',
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => !isDragging && setIsHovered(false)}
    >
      {/* Hover/drag UI */}
      {showUI && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          {/* Dashed guide lines */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 8,
              right: 8,
              borderTop: '1px dashed #EC4899',
              opacity: 0.4,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 8,
              right: 8,
              borderTop: '1px dashed #EC4899',
              opacity: 0.4,
            }}
          />

          {/* Pink pill with px value */}
          <div
            onMouseDown={handleMouseDown}
            style={{
              pointerEvents: 'auto',
              cursor: 'ns-resize',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              padding: '2px 8px',
              borderRadius: 9999,
              backgroundColor: '#EC4899',
              color: 'white',
              fontSize: 10,
              fontWeight: 600,
              fontFamily: 'system-ui, sans-serif',
              lineHeight: 1,
              userSelect: 'none',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          >
            {/* Vertical resize icon */}
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ flexShrink: 0 }}>
              <path d="M4 0L6 2.5H2L4 0Z" fill="currentColor" />
              <path d="M4 8L6 5.5H2L4 8Z" fill="currentColor" />
            </svg>
            {spacing}
          </div>
        </div>
      )}
    </div>
  )
}

export default StackerSpacingHandle
