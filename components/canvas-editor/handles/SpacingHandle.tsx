'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export interface SpacingHandleProps {
  spacing: number
  onChange: (value: number) => void
  scale: number

  /** Drag direction that increases spacing. Default 'down'. */
  direction?: 'down' | 'up'

  /**
   * Layout mode.
   * - 'inline': handle takes layout space; assumes parent CSS transform scales the box.
   * - 'overlay': handle floats above prior content via negative margin; manually scales height.
   */
  mode?: 'inline' | 'overlay'

  min?: number
  max?: number

  /** Append "px" after the value in the pill. Default false. */
  showUnit?: boolean
  /** Hover hit area minimum even when spacing is 0. Default 6. */
  minInteractiveHeight?: number

  /** Optional inline "Add Module" button (Stacker only). */
  onAddModule?: () => void
}

export function SpacingHandle({
  spacing,
  onChange,
  scale,
  direction = 'down',
  mode = 'inline',
  min = 0,
  max = 96,
  showUnit = false,
  minInteractiveHeight = 6,
  onAddModule,
}: SpacingHandleProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartY = useRef(0)
  const dragStartSpacing = useRef(0)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
      dragStartY.current = e.clientY
      dragStartSpacing.current = spacing
    },
    [spacing],
  )

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - dragStartY.current
      const deltaPx = deltaY / scale
      const signed = direction === 'down' ? deltaPx : -deltaPx
      const next = Math.round(
        Math.max(min, Math.min(max, dragStartSpacing.current + signed)),
      )
      onChange(next)
    }

    const handleMouseUp = () => setIsDragging(false)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, direction, scale, min, max, onChange])

  const showUI = isHovered || isDragging

  const containerStyle: React.CSSProperties = (() => {
    if (mode === 'overlay') {
      const h = Math.max(spacing * scale, minInteractiveHeight)
      return {
        height: h,
        marginTop: -h,
        position: 'relative',
        cursor: isDragging ? 'ns-resize' : 'default',
        zIndex: 10,
      }
    }
    const h = Math.max(spacing, minInteractiveHeight)
    const margin = spacing < minInteractiveHeight ? -(minInteractiveHeight - spacing) / 2 : 0
    return {
      height: h,
      marginTop: margin,
      marginBottom: margin,
      position: 'relative',
      cursor: isDragging ? 'ns-resize' : 'default',
    }
  })()

  return (
    <div
      style={containerStyle}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => !isDragging && setIsHovered(false)}
    >
      {showUI && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            pointerEvents: 'none',
          }}
        >
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

          {onAddModule && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAddModule()
              }}
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 10px',
                border: '1px dashed #D1D5DB',
                borderRadius: 9999,
                background: 'white',
                cursor: 'pointer',
                transition: 'all 150ms',
                fontSize: 10,
                fontWeight: 500,
                fontFamily: 'system-ui, sans-serif',
                color: '#9CA3AF',
                whiteSpace: 'nowrap',
                lineHeight: 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#60A5FA'
                e.currentTarget.style.background = 'rgba(239, 246, 255, 1)'
                e.currentTarget.style.color = '#3B82F6'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#D1D5DB'
                e.currentTarget.style.background = 'white'
                e.currentTarget.style.color = '#9CA3AF'
              }}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                <path d="M12 4v16m8-8H4" />
              </svg>
              {spacing >= 16 && <span>Add Module</span>}
            </button>
          )}

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
            <svg
              width="8"
              height="8"
              viewBox="0 0 8 8"
              fill="none"
              style={{ flexShrink: 0 }}
            >
              <path d="M4 0L6 2.5H2L4 0Z" fill="currentColor" />
              <path d="M4 8L6 5.5H2L4 8Z" fill="currentColor" />
            </svg>
            {showUnit ? `${spacing}px` : spacing}
          </div>
        </div>
      )}
    </div>
  )
}
