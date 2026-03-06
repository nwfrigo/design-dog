interface ImagePreviewWithCropProps {
  imageUrl: string
  imagePosition: { x: number; y: number }
  imageZoom: number
  onAdjust: () => void
  onRemove: () => void
  width?: number
  height?: number
  grayscale?: boolean
  alt?: string
}

export function ImagePreviewWithCrop({
  imageUrl,
  imagePosition,
  imageZoom,
  onAdjust,
  onRemove,
  width = 240,
  height = 135,
  grayscale,
  alt = 'Selected image',
}: ImagePreviewWithCropProps) {
  return (
    <div className="relative">
      {/* Image preview - click to adjust */}
      <div
        onClick={onAdjust}
        className="cursor-pointer overflow-hidden rounded-lg border border-gray-300 hover:border-blue-400 transition-colors"
        style={{ width, height }}
      >
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover"
          style={{
            objectPosition: `${50 - imagePosition.x}% ${50 - imagePosition.y}%`,
            transform: imageZoom !== 1 ? `scale(${imageZoom})` : undefined,
            filter: grayscale ? 'grayscale(100%)' : undefined,
          }}
        />
      </div>
      {/* Adjust button */}
      <button
        onClick={onAdjust}
        className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/60 rounded text-white text-xs hover:bg-black/80 transition-colors z-20"
      >
        Adjust
      </button>
      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors z-20"
        title="Remove image"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
