'use client'

import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/store'
import { KIT_CONFIGS } from '@/config/kit-configs'
import type { AnalysisInfo, EditedContent, ExtractedContent } from '@/types'

export function AutoCreateContentScreen() {
  const {
    autoCreate,
    setAutoCreateContentSource,
    goToAutoCreateAssets,
    setCurrentScreen,
    skipToAssetEditor,
  } = useStore()

  const [isUploading, setIsUploading] = useState(false)
  const [analysisExpanded, setAnalysisExpanded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const kitConfig = autoCreate.selectedKit ? KIT_CONFIGS[autoCreate.selectedKit] : null
  const { contentSource } = autoCreate

  // Get analysis state from store (persisted)
  const analysisInfo = contentSource.analysisInfo
  const editedContent = contentSource.editedContent || {
    title: '',
    mainMessage: '',
    keyPoints: [],
    callToAction: '',
  }
  const editedFields = new Set(contentSource.editedFields || [])

  // Auto-expand analysis if we have data on mount
  useEffect(() => {
    if (analysisInfo && !analysisInfo.error) {
      setAnalysisExpanded(true)
    }
  }, [])

  // Sync edited content to pdfContent for generation
  // Include rawSummary from original extraction to preserve document context
  useEffect(() => {
    if (analysisInfo?.extracted && !analysisInfo.error && contentSource.editedContent) {
      const content = buildContextFromEdited(contentSource.editedContent, analysisInfo.extracted)
      if (content && contentSource.method === 'upload') {
        setAutoCreateContentSource({ pdfContent: content })
      }
    }
  }, [contentSource.editedContent, analysisInfo, contentSource.method, setAutoCreateContentSource])

  // Update edited content in store
  const updateEditedContent = (updates: Partial<EditedContent>) => {
    setAutoCreateContentSource({
      editedContent: { ...editedContent, ...updates },
    })
  }

  // Update edited fields in store
  const addEditedField = (field: string) => {
    if (!editedFields.has(field)) {
      setAutoCreateContentSource({
        editedFields: [...contentSource.editedFields, field],
      })
    }
  }

  // Initialize edited content from extracted content
  const initializeEditedContent = (extracted: ExtractedContent) => {
    setAutoCreateContentSource({
      editedContent: {
        title: extracted.title || '',
        mainMessage: extracted.mainMessage || '',
        keyPoints: extracted.keyPoints || [],
        callToAction: extracted.callToAction || '',
      },
      editedFields: [],
    })
  }

  const handleFieldEdit = (field: keyof EditedContent, value: string | string[]) => {
    updateEditedContent({ [field]: value })
    addEditedField(field)
  }

  const handleKeyPointEdit = (index: number, value: string) => {
    const newPoints = [...editedContent.keyPoints]
    newPoints[index] = value
    handleFieldEdit('keyPoints', newPoints)
  }

  const handleAddKeyPoint = () => {
    handleFieldEdit('keyPoints', [...editedContent.keyPoints, ''])
  }

  const handleRemoveKeyPoint = (index: number) => {
    const newPoints = editedContent.keyPoints.filter((_, i) => i !== index)
    handleFieldEdit('keyPoints', newPoints)
  }

  const handleFileUpload = async (file: File) => {
    if (!file.type.includes('pdf')) {
      setAutoCreateContentSource({
        analysisInfo: {
          fileSizeBytes: 0,
          fileSizeMB: '0',
          fileFormat: 'unknown',
          error: 'Invalid file type. Only PDF files are supported.',
        },
      })
      setAnalysisExpanded(true)
      return
    }

    // Check file size before uploading (3.4MB limit due to base64 overhead + Vercel's 4.5MB body limit)
    const maxFileSizeMB = 3.4
    const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024
    if (file.size > maxFileSizeBytes) {
      const actualSizeMB = (file.size / 1024 / 1024).toFixed(1)
      setAutoCreateContentSource({
        analysisInfo: {
          fileSizeBytes: file.size,
          fileSizeMB: actualSizeMB,
          fileFormat: 'PDF',
          error: `File too large (${actualSizeMB}MB). Maximum size is ${maxFileSizeMB}MB. Try compressing your PDF or provide key details manually.`,
        },
      })
      setAnalysisExpanded(true)
      return
    }

    setIsUploading(true)
    setAutoCreateContentSource({ analysisInfo: null })

    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string

        try {
          const response = await fetch('/api/parse-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pdf: base64 }),
          })

          const data = await response.json()

          if (response.ok) {
            setAutoCreateContentSource({
              method: 'upload',
              pdfContent: data.text || '',
              uploadedFileName: file.name,
            })

            const info: AnalysisInfo = {
              fileSizeBytes: data.debug?.fileSizeBytes || 0,
              fileSizeMB: data.debug?.fileSizeMB || '0',
              fileFormat: 'PDF',
              extracted: data.extracted,
            }
            setAutoCreateContentSource({ analysisInfo: info })

            if (data.extracted) {
              initializeEditedContent(data.extracted)
            }
            setAnalysisExpanded(true)
          } else {
            // Handle specific error codes
            let errorMessage = data.error || 'Unknown error analyzing PDF'
            if (response.status === 413) {
              errorMessage = 'File too large for server. Try compressing your PDF or provide key details manually.'
            }

            setAutoCreateContentSource({
              method: 'upload',
              uploadedFileName: file.name,
              pdfContent: `[Uploaded PDF: ${file.name}]`,
              analysisInfo: {
                fileSizeBytes: file.size,
                fileSizeMB: (file.size / 1024 / 1024).toFixed(2),
                fileFormat: 'PDF',
                error: errorMessage,
                errorDetails: data.debug?.errorDetails,
              },
            })
            setAnalysisExpanded(true)
          }
        } catch (err) {
          setAutoCreateContentSource({
            method: 'upload',
            uploadedFileName: file.name,
            pdfContent: `[Uploaded PDF: ${file.name}]`,
            analysisInfo: {
              fileSizeBytes: 0,
              fileSizeMB: '0',
              fileFormat: 'PDF',
              error: 'Network error or failed to connect to analysis service',
              errorDetails: err instanceof Error ? err.message : String(err),
            },
          })
          setAnalysisExpanded(true)
        }

        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading file:', error)
      setAutoCreateContentSource({
        analysisInfo: {
          fileSizeBytes: 0,
          fileSizeMB: '0',
          fileFormat: 'PDF',
          error: 'Failed to read file',
          errorDetails: error instanceof Error ? error.message : String(error),
        },
      })
      setAnalysisExpanded(true)
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
    goToAutoCreateAssets()
  }

  const handleSkipToAssets = () => {
    skipToAssetEditor()
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
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Generate Asset Copy with AI
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {kitConfig?.contentPrompts.upload || 'Provide content for AI to generate copy from'}
        </p>
      </div>

      {/* Method selection */}
      {!contentSource.method && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => handleMethodSelect('upload')}
            className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all"
          >
            <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <span className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
              Upload materials
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 text-center">
              I have a PDF or document to upload
            </span>
          </button>

          <button
            onClick={() => handleMethodSelect('manual')}
            className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all"
          >
            <div className="w-14 h-14 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <span className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
              Describe with a prompt
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 text-center">
              I&apos;ll type in the details
            </span>
          </button>
        </div>
      )}

      {/* Upload method */}
      {contentSource.method === 'upload' && (
        <div className="space-y-6">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`
              flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl cursor-pointer transition-colors
              ${contentSource.uploadedFileName
                ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }
            `}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-3 text-gray-500">
                <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm">Analyzing document...</span>
              </div>
            ) : contentSource.uploadedFileName ? (
              <>
                <div className="w-14 h-14 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {contentSource.uploadedFileName}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Click to replace
                </span>
              </>
            ) : (
              <>
                <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="text-base text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-blue-600 dark:text-blue-400">Upload a PDF</span>
                  {' '}or drag and drop
                </span>
              </>
            )}
          </div>

          {/* Analysis Panel */}
          {analysisInfo && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
              {/* Header */}
              <button
                onClick={() => setAnalysisExpanded(!analysisExpanded)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Analysis
                      </span>
                      {analysisInfo.error && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
                          Error
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Review and edit AI analysis before generating assets
                    </p>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${analysisExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {analysisExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700">
                  {/* Error display */}
                  {analysisInfo.error && (
                    <div className="p-5">
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                          Analysis Error
                        </p>
                        <p className="text-sm text-red-600/80 dark:text-red-400/80">
                          {analysisInfo.error}
                        </p>
                        <p className="text-xs text-red-500/70 dark:text-red-400/60 mt-2">
                          You can still proceed by adding details in the text field below.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Success - Editable Content */}
                  {!analysisInfo.error && (
                    <div className="p-5 space-y-5">
                      {/* Metadata row */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {analysisInfo.fileFormat}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                          </svg>
                          {analysisInfo.fileSizeMB} MB
                        </span>
                      </div>

                      {/* Title */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Title
                          </label>
                          {editedFields.has('title') && (
                            <span className="text-[10px] font-medium text-blue-500 dark:text-blue-400">
                              Edited
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={editedContent.title}
                          onChange={(e) => handleFieldEdit('title', e.target.value)}
                          placeholder="Not detected — add manually"
                          className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-800
                            hover:border-gray-300 dark:hover:border-gray-600 transition-colors
                            placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                      </div>

                      {/* Overview (formerly Main Message) */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Overview
                          </label>
                          {editedFields.has('mainMessage') && (
                            <span className="text-[10px] font-medium text-blue-500 dark:text-blue-400">
                              Edited
                            </span>
                          )}
                        </div>
                        <textarea
                          value={editedContent.mainMessage}
                          onChange={(e) => handleFieldEdit('mainMessage', e.target.value)}
                          placeholder="Not detected — add manually"
                          rows={3}
                          className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg resize-none
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-800
                            hover:border-gray-300 dark:hover:border-gray-600 transition-colors
                            placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                      </div>

                      {/* Key Points */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Key Points
                          </label>
                          {editedFields.has('keyPoints') && (
                            <span className="text-[10px] font-medium text-blue-500 dark:text-blue-400">
                              Edited
                            </span>
                          )}
                        </div>
                        <div className="space-y-2">
                          {editedContent.keyPoints.length === 0 ? (
                            <button
                              onClick={handleAddKeyPoint}
                              className="w-full px-4 py-3 text-sm text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg
                                hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            >
                              + Add a key point
                            </button>
                          ) : (
                            <>
                              {editedContent.keyPoints.map((point, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <span className="mt-3 text-blue-500 dark:text-blue-400">•</span>
                                  <input
                                    type="text"
                                    value={point}
                                    onChange={(e) => handleKeyPointEdit(index, e.target.value)}
                                    placeholder="Enter key point..."
                                    className="flex-1 px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg
                                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-800
                                      hover:border-gray-300 dark:hover:border-gray-600 transition-colors
                                      placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                  <button
                                    onClick={() => handleRemoveKeyPoint(index)}
                                    className="mt-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                    title="Remove point"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={handleAddKeyPoint}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400
                                  hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add another point
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Call to Action */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Call to Action
                          </label>
                          {editedFields.has('callToAction') && (
                            <span className="text-[10px] font-medium text-blue-500 dark:text-blue-400">
                              Edited
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={editedContent.callToAction}
                          onChange={(e) => handleFieldEdit('callToAction', e.target.value)}
                          placeholder="Not detected — add manually"
                          className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-800
                            hover:border-gray-300 dark:hover:border-gray-600 transition-colors
                            placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional context (optional)
            </label>
            <textarea
              value={contentSource.additionalContext}
              onChange={(e) => setAutoCreateContentSource({ additionalContext: e.target.value })}
              placeholder="Add any extra details, tone preferences, or specific requirements..."
              className="w-full h-28 px-4 py-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={() => {
              setAutoCreateContentSource({
                method: null,
                uploadedFileName: null,
                pdfContent: null,
                analysisInfo: null,
                editedContent: null,
                editedFields: [],
              })
            }}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ← Choose a different method
          </button>
        </div>
      )}

      {/* Manual method */}
      {contentSource.method === 'manual' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={contentSource.manualDescription}
              onChange={(e) => setAutoCreateContentSource({ manualDescription: e.target.value })}
              placeholder={kitConfig?.contentPrompts.manual || "Describe what you're promoting..."}
              className="w-full h-28 px-4 py-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full h-28 px-4 py-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full h-24 px-4 py-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={() => setAutoCreateContentSource({ method: null })}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ← Choose a different method
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-end mt-10 pt-6 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <button
              onClick={handleSkipToAssets}
              className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              I&apos;ll write it myself
            </button>
            <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              You can always write with generative AI in the editor, or come back to this stage.
            </span>
          </div>

          {contentSource.method && (
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
              Continue to Assets
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Build context string from edited content for asset generation
// Include additional fields from original extraction (rawSummary, targetAudience, etc.)
function buildContextFromEdited(edited: EditedContent, extracted?: ExtractedContent): string {
  const parts: string[] = []

  if (edited.title) {
    parts.push(`Title: ${edited.title}`)
  }
  if (edited.mainMessage) {
    parts.push(`Overview: ${edited.mainMessage}`)
  }
  if (edited.keyPoints && edited.keyPoints.length > 0) {
    const validPoints = edited.keyPoints.filter(p => p.trim())
    if (validPoints.length > 0) {
      parts.push(`Key Points:\n${validPoints.map(p => `- ${p}`).join('\n')}`)
    }
  }
  if (edited.callToAction) {
    parts.push(`Call to Action: ${edited.callToAction}`)
  }

  // Include additional context from original extraction
  if (extracted) {
    if (extracted.targetAudience) {
      parts.push(`Target Audience: ${extracted.targetAudience}`)
    }
    if (extracted.dates) {
      parts.push(`Important Dates: ${extracted.dates}`)
    }
    if (extracted.speakers && extracted.speakers.length > 0) {
      parts.push(`Speakers/Authors: ${extracted.speakers.join(', ')}`)
    }
    if (extracted.rawSummary) {
      parts.push(`\nDocument Summary:\n${extracted.rawSummary}`)
    }
  }

  return parts.join('\n\n')
}
