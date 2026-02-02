'use client'

import { useStore } from '@/store'
import { KIT_CONFIGS } from '@/config/kit-configs'
import { KitSelectionStep } from './KitSelectionStep'
import { ContentSourceStep } from './ContentSourceStep'
import { AssetSelectionStep } from './AssetSelectionStep'
import { GeneratingStep } from './GeneratingStep'

export function QuickStartWizard() {
  const { autoCreate, closeAutoCreateWizard } = useStore()

  if (!autoCreate.isWizardOpen) return null

  const renderStep = () => {
    switch (autoCreate.currentStep) {
      case 'kit-selection':
        return <KitSelectionStep />
      case 'content-source':
        return <ContentSourceStep />
      case 'asset-selection':
        return <AssetSelectionStep />
      case 'generating':
      case 'complete':
        return <GeneratingStep />
      default:
        return <KitSelectionStep />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeAutoCreateWizard}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-[700px] max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Auto-Create
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Create multiple assets with AI assistance
              </p>
            </div>
          </div>
          <button
            onClick={closeAutoCreateWizard}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step indicator */}
        <StepIndicator currentStep={autoCreate.currentStep} selectedKit={autoCreate.selectedKit} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {renderStep()}
        </div>
      </div>
    </div>
  )
}

function StepIndicator({ currentStep, selectedKit }: { currentStep: string; selectedKit: string | null }) {
  const kitConfig = selectedKit ? KIT_CONFIGS[selectedKit as keyof typeof KIT_CONFIGS] : null

  const steps = [
    {
      id: 'kit-selection',
      label: 'Kit Type',
      subLabel: kitConfig?.label || null
    },
    { id: 'content-source', label: 'Content', subLabel: null },
    { id: 'asset-selection', label: 'Assets', subLabel: null },
    { id: 'generating', label: 'Generate', subLabel: null },
  ]

  const getCurrentIndex = () => {
    if (currentStep === 'complete') return 3
    return steps.findIndex(s => s.id === currentStep)
  }

  const currentIndex = getCurrentIndex()

  return (
    <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors
                  ${index < currentIndex
                    ? 'bg-blue-500 text-white'
                    : index === currentIndex
                      ? 'bg-blue-500 text-white ring-4 ring-blue-100 dark:ring-blue-900/50'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }
                `}
              >
                {index < currentIndex ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <div className="hidden sm:block">
                <span
                  className={`text-sm block ${
                    index <= currentIndex
                      ? 'text-gray-900 dark:text-gray-100 font-medium'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
                {step.subLabel && index <= currentIndex && (
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    {step.subLabel}
                  </span>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 sm:w-12 h-0.5 mx-2 sm:mx-3 ${
                  index < currentIndex
                    ? 'bg-blue-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
