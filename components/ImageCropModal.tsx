'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface ImageCropModalProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string
  frameWidth: number  // Actual template container width (e.g., 320)
  frameHeight: number // Actual template container height (e.g., 386)
  initialPosition: { x: number; y: number }
  initialZoom: number
  onSave: (position: { x: number; y: number }, zoom: number) => void
}

export function ImageCropModal({
  isOpen,
  onClose,
  imageSrc,
  frameWidth,
  frameHeight,
  initialPosition,
  initialZoom,
  onSave,
}: ImageCropModalProps) {
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const [position, setPosition] = useState(initialPosition)
  const [zoom, setZoom] = useState(initialZoom)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Load image dimensions
  useEffect(() => {
    if (!imageSrc) return
    const img = new Image()
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.src = imageSrc
  }, [imageSrc])

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPosition(initialPosition)
      setZoom(initialZoom)
    }
  }, [isOpen, initialPosition, initialZoom])

  // Calculate display dimensions
  // We want to show the full image with the frame overlaid
  // Scale everything so it fits nicely in the modal (max ~600px)
  const getDisplayDimensions = useCallback(() => {
    if (!imageDimensions) return null

    const maxModalSize = 500
    const padding = 60 // Space around the image for the cropped parts

    // At zoom 1, the image should just cover the frame (like objectFit: cover)
    // Calculate the base scale needed for image to cover frame
    const scaleToFitWidth = frameWidth / imageDimensions.width
    const scaleToFitHeight = frameHeight / imageDimensions.height
    const coverScale = Math.max(scaleToFitWidth, scaleToFitHeight)

    // At current zoom, the image is scaled by coverScale * zoom
    const imageScaleAtZoom = coverScale * zoom
    const scaledImageWidth = imageDimensions.width * imageScaleAtZoom
    const scaledImageHeight = imageDimensions.height * imageScaleAtZoom

    // Now scale everything to fit in modal
    // The image (at current zoom) should fit with some padding
    const displayScale = Math.min(
      (maxModalSize - padding) / scaledImageWidth,
      (maxModalSize - padding) / scaledImageHeight,
      1 // Don't scale up
    )

    return {
      imageWidth: scaledImageWidth * displayScale,
      imageHeight: scaledImageHeight * displayScale,
      frameWidth: frameWidth * displayScale,
      frameHeight: frameHeight * displayScale,
      displayScale,
      coverScale,
    }
  }, [imageDimensions, frameWidth, frameHeight, zoom])

  const displayDims = getDisplayDimensions()

  // Calculate max pan based on overflow
  const getMaxPan = useCallback(() => {
    if (!displayDims) return { x: 0, y: 0 }

    // How much the image overflows the frame on each side
    const overflowX = Math.max(0, (displayDims.imageWidth - displayDims.frameWidth) / 2)
    const overflowY = Math.max(0, (displayDims.imageHeight - displayDims.frameHeight) / 2)

    // Convert to position units (-50 to 50)
    // When position.x = 50, the image should be shifted left by overflowX
    // So maxPan in position units = 50 (always, the overflow determines actual pixels)
    return {
      x: overflowX > 0 ? 50 : 0,
      y: overflowY > 0 ? 50 : 0,
    }
  }, [displayDims])

  const maxPan = getMaxPan()

  // Handle mouse events for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !displayDims) return

    const overflowX = (displayDims.imageWidth - displayDims.frameWidth) / 2
    const overflowY = (displayDims.imageHeight - displayDims.frameHeight) / 2

    // Convert pixel movement to position units
    // Dragging RIGHT → frame moves RIGHT → position.x decreases
    // Dragging DOWN → frame moves DOWN → position.y decreases
    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y

    // Convert pixels to position units
    const positionDeltaX = overflowX > 0 ? (deltaX / overflowX) * 50 : 0
    const positionDeltaY = overflowY > 0 ? (deltaY / overflowY) * 50 : 0

    // Subtract delta - dragging right moves the frame right (more intuitive)
    const newX = Math.max(-maxPan.x, Math.min(maxPan.x, position.x - positionDeltaX))
    const newY = Math.max(-maxPan.y, Math.min(maxPan.y, position.y - positionDeltaY))

    setPosition({ x: newX, y: newY })
    setDragStart({ x: e.clientX, y: e.clientY })
  }, [isDragging, dragStart, position, displayDims, maxPan])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Handle zoom change
  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom)
    // Re-clamp position when zoom changes
    const newMaxPan = getMaxPan()
    setPosition(prev => ({
      x: Math.max(-newMaxPan.x, Math.min(newMaxPan.x, prev.x)),
      y: Math.max(-newMaxPan.y, Math.min(newMaxPan.y, prev.y)),
    }))
  }, [getMaxPan])

  const handleSave = useCallback(() => {
    onSave(position, zoom)
    onClose()
  }, [position, zoom, onSave, onClose])

  const handleReset = useCallback(() => {
    setPosition({ x: 0, y: 0 })
    setZoom(1)
  }, [])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-medium">Adjust Image</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Crop area */}
        <div
          ref={containerRef}
          className="relative flex items-center justify-center bg-gray-800 rounded-lg overflow-hidden"
          style={{ minHeight: 400 }}
        >
          {displayDims && imageDimensions ? (
            <div className="relative" style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
              {/* The image - draggable */}
              <div
                onMouseDown={handleMouseDown}
                style={{
                  width: displayDims.imageWidth,
                  height: displayDims.imageHeight,
                  position: 'relative',
                }}
              >
                <img
                  src={imageSrc}
                  alt=""
                  draggable={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    userSelect: 'none',
                  }}
                />

                {/* Dark overlay with cutout for frame area */}
                {(() => {
                  // Calculate frame position in pixels from center
                  const frameOffsetX = -(position.x / 50) * ((displayDims.imageWidth - displayDims.frameWidth) / 2)
                  const frameOffsetY = -(position.y / 50) * ((displayDims.imageHeight - displayDims.frameHeight) / 2)

                  // Frame bounds relative to image
                  const frameLeft = (displayDims.imageWidth - displayDims.frameWidth) / 2 + frameOffsetX
                  const frameTop = (displayDims.imageHeight - displayDims.frameHeight) / 2 + frameOffsetY
                  const frameRight = frameLeft + displayDims.frameWidth
                  const frameBottom = frameTop + displayDims.frameHeight

                  return (
                    <>
                      {/* Top overlay */}
                      <div className="absolute pointer-events-none bg-black/60" style={{
                        left: 0, top: 0, right: 0, height: frameTop
                      }} />
                      {/* Bottom overlay */}
                      <div className="absolute pointer-events-none bg-black/60" style={{
                        left: 0, bottom: 0, right: 0, height: displayDims.imageHeight - frameBottom
                      }} />
                      {/* Left overlay */}
                      <div className="absolute pointer-events-none bg-black/60" style={{
                        left: 0, top: frameTop, width: frameLeft, height: displayDims.frameHeight
                      }} />
                      {/* Right overlay */}
                      <div className="absolute pointer-events-none bg-black/60" style={{
                        right: 0, top: frameTop, width: displayDims.imageWidth - frameRight, height: displayDims.frameHeight
                      }} />
                    </>
                  )
                })()}

                {/* Frame border - shows what will be visible in the final asset */}
                {/* When position.x > 0 (showing left side), frame should be on LEFT of image */}
                <div
                  className="absolute pointer-events-none border-2 border-white border-dashed"
                  style={{
                    width: displayDims.frameWidth,
                    height: displayDims.frameHeight,
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% - ${(position.x / 50) * ((displayDims.imageWidth - displayDims.frameWidth) / 2)}px), calc(-50% - ${(position.y / 50) * ((displayDims.imageHeight - displayDims.frameHeight) / 2)}px))`,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="text-gray-400">Loading...</div>
          )}
        </div>

        {/* Frame dimensions label */}
        <div className="flex justify-center mt-2">
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
            {frameWidth} × {frameHeight}
          </span>
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center gap-4">
          {/* Zoom slider */}
          <div className="flex-1 flex items-center gap-3">
            <span className="text-gray-400 text-sm">Zoom</span>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
              className="flex-1 h-2 accent-blue-500 cursor-pointer"
            />
            <span className="text-gray-400 text-sm w-12 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Reset button */}
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
