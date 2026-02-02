'use client'

import { useRouter } from 'next/navigation'
import { useStore } from '@/store'
import { TEMPLATE_LABELS } from '@/lib/template-config'
import { KIT_CONFIGS } from '@/config/kit-configs'

export function AutoCreateGeneratingScreen() {
  const router = useRouter()
  const {
    autoCreate,
    generatedAssets,
    proceedToAutoCreateEditor,
    setCurrentScreen,
    retryFailedAsset,
    saveDraft,
  } = useStore()

  const { generationProgress, currentStep, selectedKit } = autoCreate
  const { total, completed } = generationProgress
  const isComplete = currentStep === 'complete'
  const kitConfig = selectedKit ? KIT_CONFIGS[selectedKit] : null

  const assetList = Object.values(generatedAssets)
  const successCount = assetList.filter(a => a.status === 'complete').length
  const errorCount = assetList.filter(a => a.status === 'error').length
  const generatingCount = assetList.filter(a => a.status === 'generating').length

  const progressPercent = total > 0 ? (completed / total) * 100 : 0

  const handleContinue = () => {
    if (successCount > 0) {
      proceedToAutoCreateEditor()
      saveDraft()
      router.push('/editor')
    } else {
      setCurrentScreen('select')
    }
  }

  const handleRetry = async (assetId: string) => {
    await retryFailedAsset(assetId)
  }

  const handleBack = () => {
    setCurrentScreen('auto-create-assets')
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header with breadcrumb */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span>Auto-Create</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span>{kitConfig?.label || 'Kit'}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-blue-600 dark:text-blue-400 font-medium">Generating</span>
        </div>
      </div>

      {/* Status header */}
      <div className="text-center mb-10">
        {isComplete ? (
          <>
            {successCount > 0 ? (
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {successCount > 0 ? 'Generation Complete!' : 'Generation Failed'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {successCount > 0
                ? `Successfully generated ${successCount} ${successCount === 1 ? 'asset' : 'assets'}${errorCount > 0 ? ` (${errorCount} failed - you can retry below)` : ''}`
                : 'All assets failed to generate. You can retry each one below.'}
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <svg className="animate-spin w-20 h-20 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Generating your assets...
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {completed} of {total} complete
            </p>
          </>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-10">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isComplete && errorCount > 0 && successCount === 0
                ? 'bg-red-500'
                : isComplete
                  ? 'bg-green-500'
                  : 'bg-blue-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Asset status list */}
      <div className="space-y-3 mb-10">
        {assetList.map((asset) => (
          <div
            key={asset.id}
            className={`
              flex items-center gap-4 p-4 rounded-xl transition-colors
              ${asset.status === 'complete'
                ? 'bg-green-50 dark:bg-green-900/20'
                : asset.status === 'error'
                  ? 'bg-red-50 dark:bg-red-900/20'
                  : asset.status === 'generating'
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : 'bg-gray-50 dark:bg-gray-800/50'
              }
            `}
          >
            {/* Status icon */}
            <div className="flex-shrink-0">
              {asset.status === 'complete' ? (
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : asset.status === 'error' ? (
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              ) : asset.status === 'generating' ? (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600" />
              )}
            </div>

            {/* Template name */}
            <div className="flex-1 min-w-0">
              <span className={`text-base font-medium ${
                asset.status === 'error'
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-gray-900 dark:text-gray-100'
              }`}>
                {TEMPLATE_LABELS[asset.templateType] || asset.templateType}
              </span>
              {asset.status === 'error' && asset.error && (
                <p className="text-sm text-red-500 dark:text-red-400 mt-0.5">
                  {asset.error}
                </p>
              )}
            </div>

            {/* Status label or Retry button */}
            {asset.status === 'error' ? (
              <button
                onClick={() => handleRetry(asset.id)}
                className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                Retry
              </button>
            ) : (
              <span className={`text-sm font-medium ${
                asset.status === 'complete'
                  ? 'text-green-600 dark:text-green-400'
                  : asset.status === 'generating'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-400'
              }`}>
                {asset.status === 'complete' ? 'Done' :
                 asset.status === 'generating' ? 'Generating...' :
                 'Pending'}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Navigation */}
      {isComplete && generatingCount === 0 && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            ← Back to Assets
          </button>
          <button
            onClick={handleContinue}
            className={`
              px-8 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2
              ${successCount > 0
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg'
                : 'bg-gray-600 text-white hover:bg-gray-700'
              }
            `}
          >
            {successCount > 0 ? (
              <>
                Continue to Editor
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            ) : (
              'Back to Templates'
            )}
          </button>
        </div>
      )}
    </div>
  )
}
