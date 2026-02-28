'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/store'
import { StackerPreviewEditor } from './StackerPreviewEditor'
import type { StackerModule } from '@/types'

type ExportFormat = 'png' | 'pdf'

export function StackerExportScreen() {
  const {
    setCurrentScreen,
    // Stacker state
    stackerLogoChipModule,
    stackerHeaderModule,
    stackerContentModules,
    stackerFooterModule,
    stackerDocumentTitle,
  } = useStore()

  // Local state for export
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf')

  // Editable filename (initialized from document title)
  const [filename, setFilename] = useState('')

  // Initialize filename from document title
  useEffect(() => {
    const sanitized = (stackerDocumentTitle || 'stacker-document')
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() || 'stacker-document'
    setFilename(sanitized)
  }, [stackerDocumentTitle])

  // Combine all modules (filter out any undefined)
  const allModules: StackerModule[] = [
    stackerLogoChipModule,
    stackerHeaderModule,
    ...stackerContentModules,
    stackerFooterModule,
  ].filter(Boolean) as StackerModule[]

  const handleBack = () => {
    setCurrentScreen('stacker-editor')
  }

  const handleExport = async () => {
    setIsExporting(true)
    setExportError(null)
    setExportSuccess(false)

    try {
      // Build export params
      const finalFilename = filename.trim() || 'stacker-document'
      const exportParams = {
        template: 'stacker-pdf',
        scale: 2,
        modules: allModules,
        format: exportFormat,
        filename: finalFilename,
      }

      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportParams),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Export failed')
      }

      // Get the blob and download
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${finalFilename}.${exportFormat}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (error) {
      console.error('Export failed:', error)
      setExportError(error instanceof Error ? error.message : 'Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-content-secondary hover:text-gray-900 dark:hover:text-content-primary transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Edit
        </button>

        <div className="flex items-center gap-3">
          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
              bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Exporting...
              </>
            ) : exportSuccess ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Downloaded!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export {exportFormat.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {exportError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {exportError}
        </div>
      )}

      {/* Main Content */}
      <div className="flex gap-8">
        {/* Document Preview - Left/Main */}
        <div className="flex-1">
          <div className="bg-gray-100 dark:bg-surface-secondary rounded-xl p-6">
            <div className="max-w-[612px] mx-auto">
              <div className="rounded-lg overflow-hidden shadow-lg ring-1 ring-gray-200 dark:ring-line-subtle">
                <StackerPreviewEditor
                  modules={allModules}
                  selectedModuleId={null}
                  onModulesChange={() => {}}
                  onSelectModule={() => {}}
                  onDeleteModule={() => {}}
                  onAddModule={() => {}}
                  previewZoom={100}
                  readOnly={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Export Settings - Right Sidebar */}
        <div className="w-[300px] flex-shrink-0">
          <div className="sticky top-0 space-y-6">
            {/* Document Info */}
            <div className="p-4 bg-gray-50 dark:bg-surface-secondary rounded-lg space-y-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-content-primary">
                Export Settings
              </h3>

              {/* Format Selector */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-content-secondary mb-2">
                  Format
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setExportFormat('pdf')}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      exportFormat === 'pdf'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white dark:bg-surface-primary text-gray-700 dark:text-content-secondary border-gray-300 dark:border-line-subtle hover:border-gray-400 dark:hover:border-line-focus'
                    }`}
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => setExportFormat('png')}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      exportFormat === 'png'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white dark:bg-surface-primary text-gray-700 dark:text-content-secondary border-gray-300 dark:border-line-subtle hover:border-gray-400 dark:hover:border-line-focus'
                    }`}
                  >
                    PNG
                  </button>
                </div>
              </div>

              {/* Filename */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">
                  Filename
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value.replace(/[^a-zA-Z0-9\s-]/g, ''))}
                    className="flex-1 px-2 py-1.5 text-sm text-gray-900 dark:text-content-primary
                      bg-white dark:bg-surface-primary border border-gray-300 dark:border-line-subtle
                      rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="stacker-document"
                  />
                  <span className="text-sm text-gray-500 dark:text-content-secondary">.{exportFormat}</span>
                </div>
              </div>
            </div>

            {/* Export Info */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  {exportFormat === 'pdf' ? (
                    <>Your document will be exported as a PDF, ideal for printing or sharing as a document.</>
                  ) : (
                    <>Your document will be exported as a high-resolution PNG image, suitable for sharing or embedding in presentations.</>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StackerExportScreen
