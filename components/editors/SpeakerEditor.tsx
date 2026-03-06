'use client'

import { EyeIcon } from '@/components/shared/EyeIcon'

// ─────────────────────────────────────────────────────────────
// Types for state passed in from EditorScreen
// ─────────────────────────────────────────────────────────────

interface SpeakerEditorControlsProps {
  currentTemplate: string

  // CTA (email-speakers only)
  ctaText: string
  setCtaText: (v: string) => void
  showCta: boolean
  setShowCta: (v: boolean) => void

  // Speaker count (email-speakers only)
  speakerCount: number

  // Show/hide per speaker (website-webinar only)
  showSpeaker1: boolean
  showSpeaker2: boolean
  showSpeaker3: boolean
  setShowSpeaker1: (v: boolean) => void
  setShowSpeaker2: (v: boolean) => void
  setShowSpeaker3: (v: boolean) => void

  // Speaker 1
  speaker1Name: string
  setSpeaker1Name: (v: string) => void
  speaker1Role: string
  setSpeaker1Role: (v: string) => void
  speaker1ImageUrl: string | null
  speaker1ImagePosition: { x: number; y: number }
  speaker1ImageZoom: number
  setSpeaker1ImageZoom: (v: number) => void

  // Speaker 2
  speaker2Name: string
  setSpeaker2Name: (v: string) => void
  speaker2Role: string
  setSpeaker2Role: (v: string) => void
  speaker2ImageUrl: string | null
  speaker2ImagePosition: { x: number; y: number }
  speaker2ImageZoom: number
  setSpeaker2ImageZoom: (v: number) => void

  // Speaker 3
  speaker3Name: string
  setSpeaker3Name: (v: string) => void
  speaker3Role: string
  setSpeaker3Role: (v: string) => void
  speaker3ImageUrl: string | null
  speaker3ImagePosition: { x: number; y: number }
  speaker3ImageZoom: number
  setSpeaker3ImageZoom: (v: number) => void

  // Image library trigger (from parent)
  setActiveSpeakerForImage: (v: 1 | 2 | 3 | null) => void
  setShowImageLibrary: (v: boolean) => void
}

/**
 * Form controls for the speaker fields used by email-speakers
 * and website-webinar (speakers variant).
 *
 * Renders CTA text (email-speakers only), plus speaker 1/2/3
 * name, role, and image controls.
 */
export function SpeakerEditorControls(props: SpeakerEditorControlsProps) {
  const {
    currentTemplate,
    ctaText,
    setCtaText,
    showCta,
    setShowCta,
    speakerCount,
    showSpeaker1,
    showSpeaker2,
    showSpeaker3,
    setShowSpeaker1,
    setShowSpeaker2,
    setShowSpeaker3,
    speaker1Name,
    setSpeaker1Name,
    speaker1Role,
    setSpeaker1Role,
    speaker1ImageUrl,
    speaker1ImagePosition,
    speaker1ImageZoom,
    setSpeaker1ImageZoom,
    speaker2Name,
    setSpeaker2Name,
    speaker2Role,
    setSpeaker2Role,
    speaker2ImageUrl,
    speaker2ImagePosition,
    speaker2ImageZoom,
    setSpeaker2ImageZoom,
    speaker3Name,
    setSpeaker3Name,
    speaker3Role,
    setSpeaker3Role,
    speaker3ImageUrl,
    speaker3ImagePosition,
    speaker3ImageZoom,
    setSpeaker3ImageZoom,
    setActiveSpeakerForImage,
    setShowImageLibrary,
  } = props

  return (
    <div className="space-y-4">
      {/* CTA Text - only for email-speakers (website-webinar has its own CTA section) */}
      {currentTemplate === 'email-speakers' && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              CTA Text
            </label>
            <EyeIcon visible={showCta} onClick={() => setShowCta(!showCta)} />
          </div>
          <input
            type="text"
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            placeholder="e.g., Responsive"
            className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-line-subtle rounded-lg
              bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${!showCta ? 'opacity-50' : ''}`}
          />
        </div>
      )}

      {/* Speaker 1 */}
      <div className={`p-3 bg-gray-100 dark:bg-surface-secondary rounded-lg space-y-3 ${currentTemplate === 'website-webinar' && !showSpeaker1 ? 'opacity-50' : ''}`}>
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Speaker 1</label>
          {currentTemplate === 'website-webinar' && (
            <EyeIcon visible={showSpeaker1} onClick={() => setShowSpeaker1(!showSpeaker1)} />
          )}
        </div>
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div
              className="w-12 h-12 rounded-full bg-gray-300 dark:bg-surface-tertiary overflow-hidden cursor-pointer relative"
              onClick={() => { setActiveSpeakerForImage(1); setShowImageLibrary(true) }}
              style={{ backgroundImage: speaker1ImageUrl ? `url(${speaker1ImageUrl})` : undefined, backgroundSize: `${speaker1ImageZoom * 100}%`, backgroundPosition: `${50 + speaker1ImagePosition.x}% ${50 + speaker1ImagePosition.y}%` }}
            >
              {!speaker1ImageUrl && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">+</div>
              )}
            </div>
            {speaker1ImageUrl && (
              <div className="mt-1 flex flex-col gap-1">
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={speaker1ImageZoom}
                  onChange={(e) => setSpeaker1ImageZoom(parseFloat(e.target.value))}
                  className="w-12 h-1"
                  title="Zoom"
                />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <input
              type="text"
              value={speaker1Name}
              onChange={(e) => setSpeaker1Name(e.target.value)}
              placeholder="Name"
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-line-subtle rounded bg-white dark:bg-surface-primary"
            />
            <input
              type="text"
              value={speaker1Role}
              onChange={(e) => setSpeaker1Role(e.target.value)}
              placeholder="Role, Company"
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-line-subtle rounded bg-white dark:bg-surface-primary"
            />
          </div>
        </div>
      </div>

      {/* Speaker 2 */}
      {(currentTemplate === 'website-webinar' || speakerCount >= 2) && (
        <div className={`p-3 bg-gray-100 dark:bg-surface-secondary rounded-lg space-y-3 ${currentTemplate === 'website-webinar' && !showSpeaker2 ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Speaker 2</label>
            {currentTemplate === 'website-webinar' && (
              <EyeIcon visible={showSpeaker2} onClick={() => setShowSpeaker2(!showSpeaker2)} />
            )}
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div
                className="w-12 h-12 rounded-full bg-gray-300 dark:bg-surface-tertiary overflow-hidden cursor-pointer relative"
                onClick={() => { setActiveSpeakerForImage(2); setShowImageLibrary(true) }}
                style={{ backgroundImage: speaker2ImageUrl ? `url(${speaker2ImageUrl})` : undefined, backgroundSize: `${speaker2ImageZoom * 100}%`, backgroundPosition: `${50 + speaker2ImagePosition.x}% ${50 + speaker2ImagePosition.y}%` }}
              >
                {!speaker2ImageUrl && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">+</div>
                )}
              </div>
              {speaker2ImageUrl && (
                <div className="mt-1 flex flex-col gap-1">
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={speaker2ImageZoom}
                    onChange={(e) => setSpeaker2ImageZoom(parseFloat(e.target.value))}
                    className="w-12 h-1"
                    title="Zoom"
                  />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={speaker2Name}
                onChange={(e) => setSpeaker2Name(e.target.value)}
                placeholder="Name"
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-line-subtle rounded bg-white dark:bg-surface-primary"
              />
              <input
                type="text"
                value={speaker2Role}
                onChange={(e) => setSpeaker2Role(e.target.value)}
                placeholder="Role, Company"
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-line-subtle rounded bg-white dark:bg-surface-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* Speaker 3 */}
      {(currentTemplate === 'website-webinar' || speakerCount >= 3) && (
        <div className={`p-3 bg-gray-100 dark:bg-surface-secondary rounded-lg space-y-3 ${currentTemplate === 'website-webinar' && !showSpeaker3 ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Speaker 3</label>
            {currentTemplate === 'website-webinar' && (
              <EyeIcon visible={showSpeaker3} onClick={() => setShowSpeaker3(!showSpeaker3)} />
            )}
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div
                className="w-12 h-12 rounded-full bg-gray-300 dark:bg-surface-tertiary overflow-hidden cursor-pointer relative"
                onClick={() => { setActiveSpeakerForImage(3); setShowImageLibrary(true) }}
                style={{ backgroundImage: speaker3ImageUrl ? `url(${speaker3ImageUrl})` : undefined, backgroundSize: `${speaker3ImageZoom * 100}%`, backgroundPosition: `${50 + speaker3ImagePosition.x}% ${50 + speaker3ImagePosition.y}%` }}
              >
                {!speaker3ImageUrl && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">+</div>
                )}
              </div>
              {speaker3ImageUrl && (
                <div className="mt-1 flex flex-col gap-1">
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={speaker3ImageZoom}
                    onChange={(e) => setSpeaker3ImageZoom(parseFloat(e.target.value))}
                    className="w-12 h-1"
                    title="Zoom"
                  />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={speaker3Name}
                onChange={(e) => setSpeaker3Name(e.target.value)}
                placeholder="Name"
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-line-subtle rounded bg-white dark:bg-surface-primary"
              />
              <input
                type="text"
                value={speaker3Role}
                onChange={(e) => setSpeaker3Role(e.target.value)}
                placeholder="Role, Company"
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-line-subtle rounded bg-white dark:bg-surface-primary"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
