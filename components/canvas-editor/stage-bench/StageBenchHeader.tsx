'use client'

import type { TemplateType } from '@/types'
import { TEMPLATE_LABELS } from '@/lib/template-config'
import { StageBenchTab } from '../StageBenchTab'

/**
 * StageBenchHeader — the breadcrumb tab strip + add-asset / delete-asset
 * controls that sits at the top of every Stage & Bench editor view.
 *
 * Template-agnostic: just renders one tab per asset in `selectedAssets`,
 * with the active one styled differently. Channel breadcrumb (e.g.
 * "email / Dark & Simple") is derived from the template's id prefix.
 */

function getChannelFromTemplate(t: TemplateType): string {
  return t.split('-')[0] ?? ''
}

export interface StageBenchHeaderProps {
  selectedAssets: TemplateType[]
  currentAssetIndex: number
  isEditingFromQueue: boolean
  onGoToAsset: (idx: number) => void
  onAddAsset: () => void
  onDeleteAsset: (idx: number) => void
  getAssetLabel: (assetType: TemplateType, index: number) => string
}

export function StageBenchHeader({
  selectedAssets,
  currentAssetIndex,
  isEditingFromQueue,
  onGoToAsset,
  onAddAsset,
  onDeleteAsset,
  getAssetLabel,
}: StageBenchHeaderProps) {
  return (
    <>
      {selectedAssets.map((asset, idx) => {
        const isActive = idx === currentAssetIndex
        const label = getAssetLabel(asset, idx)
        const channel = getChannelFromTemplate(asset)
        const baseLabel = TEMPLATE_LABELS[asset] ?? label
        return (
          <StageBenchTab
            key={`${asset}-${idx}`}
            active={isActive}
            onClick={() => onGoToAsset(idx)}
          >
            <span className="font-mono text-[12px] uppercase">
              <span className="text-content-secondary">{channel}</span>
              <span className="text-content-tertiary mx-1">/</span>
              <span className={isActive ? 'text-content-primary' : ''}>{baseLabel}</span>
            </span>
          </StageBenchTab>
        )
      })}
      <button
        type="button"
        onClick={onAddAsset}
        title="Add asset"
        className="ml-2 mb-2 p-1 text-content-secondary hover:text-content-primary transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
      {selectedAssets.length > 1 && !isEditingFromQueue && (
        <button
          type="button"
          onClick={() => onDeleteAsset(currentAssetIndex)}
          title="Delete this asset"
          className="ml-auto mb-2 flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium
            text-content-secondary hover:text-red-500 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      )}
    </>
  )
}
