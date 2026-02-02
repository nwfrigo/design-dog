'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/store'
import { AssetSidebar } from './AssetSidebar'
import { EditorScreen } from '../EditorScreen'

// Renamed to AutoCreateEditor but keeping QuickStartEditor export for backwards compatibility
export function AutoCreateEditor() {
  const {
    generatedAssets,
    loadGeneratedAssetIntoEditor,
    updateGeneratedAsset,
    templateType,
    verbatimCopy,
    eyebrow,
    solution,
    logoColor,
    showEyebrow,
    showSubhead,
    showBody,
    thumbnailImageUrl,
    subheading,
    showLightHeader,
    showSubheading,
    showSolutionSet,
    showGridDetail2,
    gridDetail1Text,
    gridDetail2Text,
    gridDetail3Type,
    gridDetail3Text,
    gridDetail4Type,
    gridDetail4Text,
    showRow3,
    showRow4,
    metadata,
    ctaText,
    colorStyle,
    headingSize,
    alignment,
    ctaStyle,
    showMetadata,
    showCta,
    layout,
    newsletterImageSize,
    newsletterImageUrl,
    speakerCount,
    speaker1Name,
    speaker1Role,
    speaker1ImageUrl,
    speaker1ImagePosition,
    speaker1ImageZoom,
    speaker2Name,
    speaker2Role,
    speaker2ImageUrl,
    speaker2ImagePosition,
    speaker2ImageZoom,
    speaker3Name,
    speaker3Role,
    speaker3ImageUrl,
    speaker3ImagePosition,
    speaker3ImageZoom,
    generatedVariations,
  } = useStore()

  // Track current asset ID
  const assetIds = Object.keys(generatedAssets)
  const [currentAssetId, setCurrentAssetId] = useState<string | null>(
    assetIds.length > 0 ? assetIds[0] : null
  )

  // Load first asset on mount
  useEffect(() => {
    if (assetIds.length > 0 && !currentAssetId) {
      const firstId = assetIds[0]
      setCurrentAssetId(firstId)
      loadGeneratedAssetIntoEditor(firstId)
    }
  }, [assetIds, currentAssetId, loadGeneratedAssetIntoEditor])

  // Save current state back to generatedAssets when switching or when editor state changes
  const saveCurrentState = () => {
    if (!currentAssetId || !generatedAssets[currentAssetId]) return

    updateGeneratedAsset(currentAssetId, {
      copy: { ...verbatimCopy },
      eyebrow,
      solution,
      logoColor,
      showEyebrow,
      showSubhead,
      showBody,
      thumbnailImageUrl,
      subheading,
      showLightHeader,
      showSubheading,
      showSolutionSet,
      showGridDetail2,
      gridDetail1Text,
      gridDetail2Text,
      gridDetail3Type,
      gridDetail3Text,
      gridDetail4Type,
      gridDetail4Text,
      showRow3,
      showRow4,
      metadata,
      ctaText,
      colorStyle,
      headingSize,
      alignment,
      ctaStyle,
      showMetadata,
      showCta,
      layout,
      newsletterImageSize,
      newsletterImageUrl,
      speakerCount,
      speaker1Name,
      speaker1Role,
      speaker1ImageUrl,
      speaker1ImagePosition,
      speaker1ImageZoom,
      speaker2Name,
      speaker2Role,
      speaker2ImageUrl,
      speaker2ImagePosition,
      speaker2ImageZoom,
      speaker3Name,
      speaker3Role,
      speaker3ImageUrl,
      speaker3ImagePosition,
      speaker3ImageZoom,
      variations: generatedVariations,
    })
  }

  const handleSelectAsset = (assetId: string) => {
    if (assetId === currentAssetId) return

    // Save current state before switching
    saveCurrentState()

    // Switch to new asset
    setCurrentAssetId(assetId)
    loadGeneratedAssetIntoEditor(assetId)
  }

  // Auto-save when editor state changes (debounced via effect)
  useEffect(() => {
    // Save state when any editor value changes
    const timeoutId = setTimeout(() => {
      saveCurrentState()
    }, 500)

    return () => clearTimeout(timeoutId)
    // Only re-run when the verbatimCopy headline changes (as a proxy for editor changes)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verbatimCopy.headline, templateType])

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* Asset sidebar */}
      <AssetSidebar
        currentAssetId={currentAssetId}
        onSelectAsset={handleSelectAsset}
      />

      {/* Main editor area */}
      <div className="flex-1 overflow-auto">
        <EditorScreen />
      </div>
    </div>
  )
}

// Backwards compatibility export
export const QuickStartEditor = AutoCreateEditor
