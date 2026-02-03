'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

// Inline SVG icons to avoid external dependencies
function ZoomInIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  )
}

function ResetIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}

interface ZoomableImageProps {
  src: string
  alt?: string
  containerWidth: number
  containerHeight: number
  zoom: number
  position: { x: number; y: number }
  onZoomChange: (zoom: number) => void
  onPositionChange: (position: { x: number; y: number }) => void
  className?: string
  borderRadius?: number
  border?: string
  showControls?: boolean
  // Optional: Use these dimensions for clamping calculations instead of display dimensions
  // This allows the editor preview to be a different size than the actual template container
  targetContainerWidth?: number
  targetContainerHeight?: number
}

export function ZoomableImage({
  src,
  alt = '',
  containerWidth,
  containerHeight,
  zoom,
  position,
  onZoomChange,
  onPositionChange,
  className = '',
  borderRadius = 0,
  border,
  showControls = true,
  targetContainerWidth,
  targetContainerHeight,
}: ZoomableImageProps) {
  // Use target dimensions for clamping if provided, otherwise use display dimensions
  const clampWidth = targetContainerWidth ?? containerWidth
  const clampHeight = targetContainerHeight ?? containerHeight
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [showSlider, setShowSlider] = useState(false)
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)

  // Load image to get natural dimensions
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.src = src
  }, [src])

  // Simple clamping: position is -50 to +50 on each axis
  // The actual pixel pan is calculated at render time based on available overflow
  // We just need to limit position to valid range
  const clampPosition = useCallback((x: number, y: number, _currentZoom: number) => {
    return {
      x: Math.max(-50, Math.min(50, x)),
      y: Math.max(-50, Math.min(50, y)),
    }
  }, [])

  // Check if panning is available (always true with objectFit: cover - there's always some overflow)
  const canPan = useCallback(() => {
    return true
  }, [])

  // Handle mouse down for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!canPan()) return // No dragging if no overflow
    e.preventDefault()
    setIsDragging(true)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    })
  }, [canPan])

  // Handle mouse move for dragging
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return

    // Convert pixel movement to percentage (relative to container size)
    const deltaX = (e.clientX - dragStart.x) / containerWidth * 100
    const deltaY = (e.clientY - dragStart.y) / containerHeight * 100

    const newX = position.x + deltaX
    const newY = position.y + deltaY
    const clamped = clampPosition(newX, newY, zoom)
    onPositionChange(clamped)

    // Update drag start for continuous dragging
    setDragStart({ x: e.clientX, y: e.clientY })
  }, [isDragging, dragStart, zoom, position, containerWidth, containerHeight, clampPosition, onPositionChange])

  // Handle mouse up to stop dragging
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)
    setIsHovering(false)
  }, [])

  // Handle scroll wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    const newZoom = Math.max(1, Math.min(3, zoom + delta))
    onZoomChange(newZoom)

    // Clamp position after zoom change
    const clamped = clampPosition(position.x, position.y, newZoom)
    if (clamped.x !== position.x || clamped.y !== position.y) {
      onPositionChange(clamped)
    }
  }, [zoom, position, clampPosition, onZoomChange, onPositionChange])

  // Reset zoom and position
  const handleReset = useCallback(() => {
    onZoomChange(1)
    onPositionChange({ x: 0, y: 0 })
  }, [onZoomChange, onPositionChange])

  // Handle slider change
  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(e.target.value)
    onZoomChange(newZoom)

    // Clamp position after zoom change
    const clamped = clampPosition(position.x, position.y, newZoom)
    if (clamped.x !== position.x || clamped.y !== position.y) {
      onPositionChange(clamped)
    }
  }, [position, clampPosition, onZoomChange, onPositionChange])

  // Global mouse up listener for drag release
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false)
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [])

  const cursor = canPan() ? (isDragging ? 'grabbing' : 'grab') : 'default'

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image Container */}
      <div
        ref={containerRef}
        className="overflow-hidden"
        style={{
          width: containerWidth,
          height: containerHeight,
          borderRadius,
          border,
          cursor,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            // object-position: 0% = left/top edge, 50% = center, 100% = right/bottom edge
            objectPosition: `${50 - position.x}% ${50 - position.y}%`,
            // When zoomed: scale + translate to maintain the same visible content
            // After scale from center, content shifts away from center
            // Translate in SAME direction as position to compensate
            transform: zoom !== 1
              ? `scale(${zoom}) translate(${position.x * (zoom - 1)}%, ${position.y * (zoom - 1)}%)`
              : undefined,
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'all 0.15s ease-out',
            userSelect: 'none',
          }}
        />
      </div>

      {/* Controls - appear on hover */}
      {showControls && isHovering && (
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5 transition-opacity"
          style={{ zIndex: 10 }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Zoom slider toggle */}
          <button
            onClick={() => setShowSlider(!showSlider)}
            className="text-white/80 hover:text-white p-0.5 transition-colors"
            title="Zoom"
          >
            <ZoomInIcon size={14} />
          </button>

          {/* Zoom slider */}
          {showSlider && (
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={handleSliderChange}
                className="w-20 h-1 accent-white cursor-pointer"
              />
              <span className="text-white/80 text-xs w-8 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>
          )}

          {/* Reset button */}
          <button
            onClick={handleReset}
            className="text-white/80 hover:text-white p-0.5 transition-colors"
            title="Reset"
          >
            <ResetIcon size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

// Simplified version for inline use without external state (e.g., preview thumbnails)
interface SimpleZoomableImageProps {
  src: string
  alt?: string
  containerWidth: number
  containerHeight: number
  initialZoom?: number
  initialPosition?: { x: number; y: number }
  className?: string
  borderRadius?: number
  border?: string
  showControls?: boolean
  onChange?: (zoom: number, position: { x: number; y: number }) => void
}

export function SimpleZoomableImage({
  src,
  alt = '',
  containerWidth,
  containerHeight,
  initialZoom = 1,
  initialPosition = { x: 0, y: 0 },
  className = '',
  borderRadius = 0,
  border,
  showControls = true,
  onChange,
}: SimpleZoomableImageProps) {
  const [zoom, setZoom] = useState(initialZoom)
  const [position, setPosition] = useState(initialPosition)

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom)
    onChange?.(newZoom, position)
  }, [position, onChange])

  const handlePositionChange = useCallback((newPosition: { x: number; y: number }) => {
    setPosition(newPosition)
    onChange?.(zoom, newPosition)
  }, [zoom, onChange])

  // Update internal state when props change
  useEffect(() => {
    setZoom(initialZoom)
  }, [initialZoom])

  useEffect(() => {
    setPosition(initialPosition)
  }, [initialPosition])

  return (
    <ZoomableImage
      src={src}
      alt={alt}
      containerWidth={containerWidth}
      containerHeight={containerHeight}
      zoom={zoom}
      position={position}
      onZoomChange={handleZoomChange}
      onPositionChange={handlePositionChange}
      className={className}
      borderRadius={borderRadius}
      border={border}
      showControls={showControls}
    />
  )
}
