'use client'

import { useState, useRef } from 'react'
import { useStore } from '@/store'
import { KIT_CONFIGS } from '@/config/kit-configs'

export function ContentSourceStep() {
  const {
    autoCreate,
    setAutoCreateStep,
    setAutoCreateContentSource,
  } = useStore()

  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const kitConfig = autoCreate.selectedKit ? KIT_CONFIGS[autoCreate.selectedKit] : null
  const { contentSource } = autoCreate

  const handleFileUpload = async (file: File) => {
    if (!file.type.includes('pdf')) {
      return
    }

    setIsUploading(true)

    try {
      // Read PDF and extract text (simplified - in production you'd use a proper PDF parser)
      const formData = new FormData()
      formData.append('file', file)

      // For now, just store the file name and let the API handle it
      // You could also use a PDF parsing library here
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string

        // Try to extract text from PDF via API
        try {
          const response = await fetch('/api/parse-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pdf: base64 }),
          })

          if (response.ok) {
            const data = await response.json()
            setAutoCreateContentSource({
              method: 'upload',
              pdfContent: data.text || '',
              uploadedFileName: file.name,
            })
          } else {
            // Fallback - just note that a file was uploaded
            setAutoCreateContentSource({
              method: 'upload',
              uploadedFileName: file.name,
              pdfContent: `[Uploaded PDF: ${file.name}]`,
            })
          }
        } catch {
          setAutoCreateContentSource({
            method: 'upload',
            uploadedFileName: file.name,
            pdfContent: `[Uploaded PDF: ${file.name}]`,
          })
        }

        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading file:', error)
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleMethodSelect = (method: 'upload' | 'manual') => {
    setAutoCreateContentSource({ method })
  }

  const handleContinue = () => {
    setAutoCreateStep('asset-selection')
  }

  const handleBack = () => {
    setAutoCreateStep('kit-selection')
  }

  const canContinue = () => {
    if (contentSource.method === 'upload') {
      return contentSource.uploadedFileName || contentSource.additionalContext.trim()
    }
    if (contentSource.method === 'manual') {
      return contentSource.manualDescription.trim() || contentSource.manualKeyPoints.trim()
    }
    return false
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
          Add your content
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {kitConfig?.contentPrompts.upload || 'Provide content to generate copy from'}
        </p>
      </div>

      {/* Method selection */}
      {!contentSource.method && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => handleMethodSelect('upload')}
            className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Upload materials
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
              I have a PDF or document to upload
            </span>
          </button>

          <button
            onClick={() => handleMethodSelect('manual')}
            className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Describe it manually
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
              I&apos;ll type in the details
            </span>
          </button>
        </div>
      )}

      {/* Upload method */}
      {contentSource.method === 'upload' && (
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Upload area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`
              flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors
              ${contentSource.uploadedFileName
                ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }
            `}
          >
            {isUploading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Processing...</span>
              </div>
            ) : contentSource.uploadedFileName ? (
              <>
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {contentSource.uploadedFileName}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Click to replace
                </span>
              </>
            ) : (
              <>
                <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-blue-600 dark:text-blue-400">Upload a PDF</span>
                  {' '}or drag and drop
                </span>
              </>
            )}
          </div>

          {/* Additional context */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional context (optional)
            </label>
            <textarea
              value={contentSource.additionalContext}
              onChange={(e) => setAutoCreateContentSource({ additionalContext: e.target.value })}
              placeholder="Add any extra details, tone preferences, or specific requirements..."
              className="w-full h-24 px-4 py-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Change method */}
          <button
            onClick={() => setAutoCreateContentSource({ method: null, uploadedFileName: null, pdfContent: null })}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ← Choose a different method
          </button>
        </div>
      )}

      {/* Manual method */}
      {contentSource.method === 'manual' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={contentSource.manualDescription}
              onChange={(e) => setAutoCreateContentSource({ manualDescription: e.target.value })}
              placeholder={kitConfig?.contentPrompts.manual || "Describe what you're promoting..."}
              className="w-full h-24 px-4 py-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Key points
            </label>
            <textarea
              value={contentSource.manualKeyPoints}
              onChange={(e) => setAutoCreateContentSource({ manualKeyPoints: e.target.value })}
              placeholder="List the main benefits, features, or takeaways (one per line)..."
              className="w-full h-24 px-4 py-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional notes (optional)
            </label>
            <textarea
              value={contentSource.additionalContext}
              onChange={(e) => setAutoCreateContentSource({ additionalContext: e.target.value })}
              placeholder="Tone preferences, audience info, or other requirements..."
              className="w-full h-20 px-4 py-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Change method */}
          <button
            onClick={() => setAutoCreateContentSource({ method: null })}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ← Choose a different method
          </button>
        </div>
      )}

      {/* Navigation */}
      {contentSource.method && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleContinue}
            disabled={!canContinue()}
            className={`
              px-6 py-2.5 rounded-lg text-sm font-medium transition-all
              ${canContinue()
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  )
}
