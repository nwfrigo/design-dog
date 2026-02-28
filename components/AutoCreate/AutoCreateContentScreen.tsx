'use client'

import { useState, useRef, useEffect } from 'react'
import { upload } from '@vercel/blob/client'
import { useStore } from '@/store'
import { KIT_CONFIGS } from '@/config/kit-configs'
import type { AnalysisInfo, EditedContent, ExtractedContent } from '@/types'

type FileType = 'pdf' | 'docx' | 'pptx' | 'txt' | 'md'

const LOADING_PHASES = {
  upload: [
    'Uploading your file...',
    'Preparing content for analysis...',
  ],
  extract: [
    'Reading your document...',
    'Extracting key information...',
    'Understanding your content...',
  ],
  analyze: [
    'Analyzing content structure...',
    'Identifying key themes...',
    'Extracting important details...',
    'Almost there...',
  ],
}

function getFileType(filename: string): FileType | null {
  const ext = filename.toLowerCase().split('.').pop()
  switch (ext) {
    case 'pdf': return 'pdf'
    case 'docx':
    case 'doc': return 'docx'
    case 'pptx':
    case 'ppt': return 'pptx'
    case 'txt': return 'txt'
    case 'md': return 'md'
    default: return null
  }
}

function getFileIcon(fileType: FileType) {
  switch (fileType) {
    case 'pdf':
      return (
        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4z"/>
        </svg>
      )
    case 'docx':
      return (
        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM9 13h6v2H9v-2zm0 3h6v2H9v-2z"/>
        </svg>
      )
    case 'pptx':
      return (
        <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM9 13h2v4H9v-4zm3 0h2v4h-2v-4z"/>
        </svg>
      )
    case 'txt':
    case 'md':
      return (
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
  }
}

function detectUrl(text: string): string | null {
  const trimmed = text.trim()
  const firstLine = trimmed.split('\n')[0].trim()
  const urlPattern = /^https?:\/\/[^\s]+$/i
  if (urlPattern.test(firstLine)) return firstLine
  const domainPattern = /^(www\.)?[a-z0-9][-a-z0-9]*(\.[a-z]{2,})+[^\s]*$/i
  if (domainPattern.test(firstLine)) return `https://${firstLine}`
  return null
}

export function AutoCreateContentScreen() {
  const {
    autoCreate,
    setAutoCreateContentSource,
    goToAutoCreateAssets,
  } = useStore()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const kitConfig = autoCreate.selectedKit ? KIT_CONFIGS[autoCreate.selectedKit] : null
  const { contentSource } = autoCreate

  // Local input state
  const [textContent, setTextContent] = useState(contentSource.additionalContext || '')
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [attachedFileType, setAttachedFileType] = useState<FileType | null>(
    contentSource.uploadedFileType as FileType | null
  )

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingPhase, setProcessingPhase] = useState<keyof typeof LOADING_PHASES | null>(null)
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Analysis panel
  const [analysisExpanded, setAnalysisExpanded] = useState(false)
  const analysisInfo = contentSource.analysisInfo
  const editedContent = contentSource.editedContent || {
    title: '',
    mainMessage: '',
    keyPoints: [],
    callToAction: '',
  }
  const editedFields = new Set(contentSource.editedFields || [])

  // Theme detection
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'))
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // Auto-expand analysis if we have data on mount
  useEffect(() => {
    if (analysisInfo && !analysisInfo.error) {
      setAnalysisExpanded(true)
    }
  }, [])

  // Sync edited content to pdfContent for generation
  useEffect(() => {
    if (analysisInfo?.extracted && !analysisInfo.error && contentSource.editedContent) {
      const content = buildContextFromEdited(contentSource.editedContent, analysisInfo.extracted)
      if (content) {
        setAutoCreateContentSource({ pdfContent: content })
      }
    }
  }, [contentSource.editedContent, analysisInfo, setAutoCreateContentSource])

  // Cycle through loading phrases
  useEffect(() => {
    if (!isProcessing || !processingPhase) {
      setPhraseIndex(0)
      return
    }
    const phrases = LOADING_PHASES[processingPhase]
    if (!phrases || phrases.length <= 1) return
    const interval = setInterval(() => {
      setPhraseIndex(prev => (prev + 1) % phrases.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [isProcessing, processingPhase])

  const currentPhrase = processingPhase
    ? LOADING_PHASES[processingPhase][phraseIndex] || LOADING_PHASES[processingPhase][0]
    : ''

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [textContent])

  // URL detection
  const detectedUrl = detectUrl(textContent)

  // Can continue: has text (>20 chars) OR has an attached/previously uploaded file
  const canContinue = textContent.trim().length > 20 || attachedFile !== null || !!contentSource.uploadedFileName

  // --- Edited content helpers ---
  const updateEditedContent = (updates: Partial<EditedContent>) => {
    setAutoCreateContentSource({
      editedContent: { ...editedContent, ...updates },
    })
  }

  const addEditedField = (field: string) => {
    if (!editedFields.has(field)) {
      setAutoCreateContentSource({
        editedFields: [...contentSource.editedFields, field],
      })
    }
  }

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

  // --- File handling ---
  const handleFileSelect = (file: File) => {
    const fileType = getFileType(file.name)
    if (fileType) {
      setAttachedFile(file)
      setAttachedFileType(fileType)
      setError(null)
    } else {
      setError('Unsupported file type. Please upload PDF, Word, PowerPoint, TXT, or MD files.')
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
    e.target.value = ''
  }

  const handleRemoveFile = () => {
    setAttachedFile(null)
    setAttachedFileType(null)
    setError(null)
    // Clear previous upload state
    setAutoCreateContentSource({
      uploadedFileName: null,
      uploadedFileType: null,
      pdfContent: null,
      analysisInfo: null,
      editedContent: null,
      editedFields: [],
    })
    setAnalysisExpanded(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // --- Submit: process file/text and analyze ---
  const handleSubmit = async () => {
    if (!canContinue || isProcessing) return

    setIsProcessing(true)
    setError(null)

    try {
      let rawContent = ''

      if (attachedFile && attachedFileType) {
        // --- File path ---
        const maxFileSizeMB = 25
        if (attachedFile.size > maxFileSizeMB * 1024 * 1024) {
          throw new Error(`File too large (${(attachedFile.size / 1024 / 1024).toFixed(1)}MB). Maximum is ${maxFileSizeMB}MB.`)
        }

        if (attachedFileType === 'txt' || attachedFileType === 'md') {
          // Read text files directly
          rawContent = await attachedFile.text()
          setAutoCreateContentSource({
            uploadedFileName: attachedFile.name,
            uploadedFileType: attachedFileType,
          })
        } else if (attachedFileType === 'pdf') {
          // PDF: upload to blob → parse-pdf for structured extraction
          setProcessingPhase('upload')
          setPhraseIndex(0)

          const blob = await upload(`pdfs/${Date.now()}-${attachedFile.name}`, attachedFile, {
            access: 'public',
            handleUploadUrl: '/api/upload-pdf',
          })

          setProcessingPhase('extract')
          setPhraseIndex(0)

          const response = await fetch('/api/parse-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pdfUrl: blob.url, fileSize: attachedFile.size }),
          })

          const data = await response.json()

          if (response.ok) {
            const info: AnalysisInfo = {
              fileSizeBytes: attachedFile.size,
              fileSizeMB: (attachedFile.size / 1024 / 1024).toFixed(2),
              fileFormat: 'PDF',
              extracted: data.extracted,
            }
            setAutoCreateContentSource({
              method: 'unified',
              pdfContent: data.text || '',
              uploadedFileName: attachedFile.name,
              uploadedFileType: 'pdf',
              analysisInfo: info,
              additionalContext: textContent,
            })
            if (data.extracted) {
              initializeEditedContent(data.extracted)
            }
            setAnalysisExpanded(true)
          } else {
            setAutoCreateContentSource({
              method: 'unified',
              uploadedFileName: attachedFile.name,
              uploadedFileType: 'pdf',
              pdfContent: `[Uploaded PDF: ${attachedFile.name}]`,
              analysisInfo: {
                fileSizeBytes: attachedFile.size,
                fileSizeMB: (attachedFile.size / 1024 / 1024).toFixed(2),
                fileFormat: 'PDF',
                error: data.error || 'Unknown error analyzing PDF',
                errorCode: data.errorCode || 'unknown',
                errorDetails: data.debug?.errorDetails,
              },
              additionalContext: textContent,
            })
            setAnalysisExpanded(true)
          }

          setIsProcessing(false)
          setProcessingPhase(null)
          return // PDF flow handles everything via parse-pdf
        } else {
          // Word/PPT: upload to blob → parse-content for text extraction
          setProcessingPhase('upload')
          setPhraseIndex(0)

          const blob = await upload(`content/${Date.now()}-${attachedFile.name}`, attachedFile, {
            access: 'public',
            handleUploadUrl: '/api/upload-content',
          })

          setProcessingPhase('extract')
          setPhraseIndex(0)

          const parseResponse = await fetch('/api/parse-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileUrl: blob.url, fileType: attachedFileType }),
          })

          if (!parseResponse.ok) {
            const errorData = await parseResponse.json()
            throw new Error(errorData.error || 'Failed to parse file')
          }

          const parseData = await parseResponse.json()
          rawContent = parseData.content || ''
          setAutoCreateContentSource({
            uploadedFileName: attachedFile.name,
            uploadedFileType: attachedFileType,
          })
        }
      } else if (detectedUrl) {
        // --- URL path ---
        setProcessingPhase('extract')
        setPhraseIndex(0)

        const fetchResponse = await fetch('/api/fetch-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: detectedUrl }),
        })

        if (!fetchResponse.ok) {
          throw new Error('Failed to fetch URL content. Try uploading the file instead.')
        }

        const fetchData = await fetchResponse.json()
        if (!fetchData.success || !fetchData.content) {
          throw new Error('Could not extract content from URL. Try uploading the file instead.')
        }

        rawContent = fetchData.content
      } else {
        // --- Text-only path: no analysis needed, go straight through ---
        setAutoCreateContentSource({
          method: 'unified',
          pdfContent: textContent,
          additionalContext: '',
        })
        setIsProcessing(false)
        setProcessingPhase(null)
        goToAutoCreateAssets()
        return
      }

      // --- Analyze extracted content for structured fields ---
      if (rawContent.trim().length < 20) {
        throw new Error('Not enough content was extracted. Try a different file or add more text.')
      }

      setProcessingPhase('analyze')
      setPhraseIndex(0)

      const analyzeResponse = await fetch('/api/analyze-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: rawContent }),
      })

      const analyzeData = await analyzeResponse.json()

      if (analyzeResponse.ok) {
        const fileFormat = attachedFileType
          ? attachedFileType.toUpperCase()
          : 'URL'
        const info: AnalysisInfo = {
          fileSizeBytes: attachedFile?.size || 0,
          fileSizeMB: attachedFile ? (attachedFile.size / 1024 / 1024).toFixed(2) : '0',
          fileFormat,
          extracted: analyzeData.extracted,
        }
        setAutoCreateContentSource({
          method: 'unified',
          pdfContent: analyzeData.text || rawContent,
          analysisInfo: info,
          additionalContext: textContent,
        })
        if (analyzeData.extracted) {
          initializeEditedContent(analyzeData.extracted)
        }
        setAnalysisExpanded(true)
      } else {
        // Analysis failed — use raw content as fallback
        setAutoCreateContentSource({
          method: 'unified',
          pdfContent: rawContent,
          analysisInfo: {
            fileSizeBytes: attachedFile?.size || 0,
            fileSizeMB: attachedFile ? (attachedFile.size / 1024 / 1024).toFixed(2) : '0',
            fileFormat: attachedFileType?.toUpperCase() || 'URL',
            error: analyzeData.error || 'Could not analyze content',
          },
          additionalContext: textContent,
        })
        setAnalysisExpanded(true)
      }
    } catch (err) {
      console.error('Content processing error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsProcessing(false)
      setProcessingPhase(null)
    }
  }

  // Derived state for navigation logic
  const hasFile = !!attachedFile || !!contentSource.uploadedFileName
  const hasSuccessfulAnalysis = !!analysisInfo && !analysisInfo.error
  const showContinue = hasSuccessfulAnalysis || (!hasFile && canContinue)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      if (hasSuccessfulAnalysis) {
        // If we already have successful analysis, Cmd+Enter → continue to assets
        handleContinue()
      } else {
        handleSubmit()
      }
    }
  }

  const handleContinue = () => {
    // If text-only (no file, no URL, no analysis), set content and continue
    if (!analysisInfo && !contentSource.pdfContent) {
      setAutoCreateContentSource({
        method: 'unified',
        pdfContent: textContent,
        additionalContext: '',
      })
    } else if (textContent && !attachedFile && !contentSource.uploadedFileName) {
      // User typed text and hasn't uploaded — use as pdfContent
      setAutoCreateContentSource({
        method: 'unified',
        pdfContent: textContent,
        additionalContext: '',
      })
    }
    goToAutoCreateAssets()
  }

  return (
    <div
      className="max-w-3xl mx-auto"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Generate Asset Copy with AI
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {kitConfig?.contentPrompts.upload || 'Provide content for AI to generate copy from'}
        </p>
      </div>

      {/* Unified input box */}
      <div className="relative">
        <div
          className={`
            border rounded-2xl transition-all
            ${error
              ? 'border-red-300 dark:border-red-700'
              : 'border-gray-300 dark:border-gray-600 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20'
            }
          `}
          style={{ backgroundColor: isDark ? '#000000' : 'white' }}
        >
          {/* Attached file pill */}
          {(attachedFile || contentSource.uploadedFileName) && (
            <div className="px-4 pt-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
                {attachedFileType && getFileIcon(attachedFileType)}
                {!attachedFileType && contentSource.uploadedFileType && getFileIcon(contentSource.uploadedFileType as FileType)}
                <span className="text-gray-700 dark:text-gray-300 max-w-[200px] truncate">
                  {attachedFile?.name || contentSource.uploadedFileName}
                </span>
                <button
                  onClick={handleRemoveFile}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              attachedFile || contentSource.uploadedFileName
                ? 'Add context or instructions (optional)...'
                : kitConfig?.contentPrompts.placeholder || 'Describe what you need, paste content, or attach a file...'
            }
            className="w-full px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-none bg-transparent min-h-[80px]"
            rows={3}
            disabled={isProcessing}
          />

          {/* Bottom bar */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            {/* Attachment button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors disabled:opacity-50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Submit button */}
            <button
              onClick={hasSuccessfulAnalysis ? handleContinue : handleSubmit}
              disabled={!canContinue || isProcessing}
              className={`
                p-2 rounded-lg transition-all
                ${canContinue && !isProcessing
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}
              `}
            >
              {isProcessing ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* URL detection notice */}
        {detectedUrl && !attachedFile && !contentSource.uploadedFileName && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                URL detected. We&apos;ll try to fetch the content. If it requires login, please download and upload the file instead.
              </p>
            </div>
          </div>
        )}

        {/* Helper text */}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">
          {attachedFile || contentSource.uploadedFileName
            ? 'Your text will be used as additional context for interpreting the attached content.'
            : detectedUrl
            ? 'Public URLs will be fetched automatically. Private links require file upload.'
            : 'Supports PDF, Word, PowerPoint, TXT, and Markdown files. Or just type your content.'
          }
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-500 dark:text-gray-400">⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-500 dark:text-gray-400">Enter</kbd> to continue
        </p>
      </div>

      {/* Analysis Panel */}
      {analysisInfo && (
        <div className="mt-6 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
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
                  {analysisInfo.errorCode === 'rate_limit' || analysisInfo.errorCode === 'overloaded' ? (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">
                            {analysisInfo.errorCode === 'rate_limit' ? 'File too large for current plan' : 'AI service temporarily busy'}
                          </p>
                          <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                            {analysisInfo.error}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              onClick={() => {
                                handleRemoveFile()
                                textareaRef.current?.focus()
                              }}
                              className="px-3 py-1.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors"
                            >
                              Paste text instead
                            </button>
                            <button
                              onClick={() => {
                                setAnalysisExpanded(false)
                                setAutoCreateContentSource({ analysisInfo: null })
                                handleSubmit()
                              }}
                              className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              Try again
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                            Could not analyze this file
                          </p>
                          <p className="text-sm text-red-600/80 dark:text-red-400/80">
                            {analysisInfo.error}
                          </p>
                          <p className="text-xs text-red-500/60 dark:text-red-400/50 mt-2">
                            You can still proceed by typing or pasting your content in the text field above.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
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
                    {analysisInfo.fileSizeBytes > 0 && (
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                        {analysisInfo.fileSizeMB} MB
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Title</label>
                      {editedFields.has('title') && (
                        <span className="text-[10px] font-medium text-blue-500 dark:text-blue-400">Edited</span>
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

                  {/* Overview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Overview</label>
                      {editedFields.has('mainMessage') && (
                        <span className="text-[10px] font-medium text-blue-500 dark:text-blue-400">Edited</span>
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
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Key Points</label>
                      {editedFields.has('keyPoints') && (
                        <span className="text-[10px] font-medium text-blue-500 dark:text-blue-400">Edited</span>
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
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Call to Action</label>
                      {editedFields.has('callToAction') && (
                        <span className="text-[10px] font-medium text-blue-500 dark:text-blue-400">Edited</span>
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

      {/* Continue button */}
      {showContinue && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className={`
              px-6 py-2.5 rounded-lg text-sm font-medium transition-all
              ${canContinue
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            Continue to Assets
          </button>
        </div>
      )}

      {/* Skip button */}
      <div className="flex flex-col items-center mt-6">
        <button
          onClick={goToAutoCreateAssets}
          className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
        >
          Skip and go to assets
        </button>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 text-center">
          You can always write with generative AI in the editor, or come back to this stage.
        </span>
      </div>

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
              <div className="absolute inset-3 rounded-full bg-blue-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="h-8 flex items-center justify-center">
              <p
                key={currentPhrase}
                className="text-lg font-medium text-gray-700 dark:text-gray-300 animate-fade-in"
              >
                {currentPhrase}
              </p>
            </div>
            <div className="flex justify-center gap-1.5 mt-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-blue-500"
                  style={{
                    animation: 'pulse 1.5s ease-in-out infinite',
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

// Build context string from edited content for asset generation
function buildContextFromEdited(edited: EditedContent, extracted?: ExtractedContent): string {
  const parts: string[] = []

  if (edited.title) parts.push(`Title: ${edited.title}`)
  if (edited.mainMessage) parts.push(`Overview: ${edited.mainMessage}`)
  if (edited.keyPoints && edited.keyPoints.length > 0) {
    const validPoints = edited.keyPoints.filter(p => p.trim())
    if (validPoints.length > 0) {
      parts.push(`Key Points:\n${validPoints.map(p => `- ${p}`).join('\n')}`)
    }
  }
  if (edited.callToAction) parts.push(`Call to Action: ${edited.callToAction}`)

  if (extracted) {
    if (extracted.targetAudience) parts.push(`Target Audience: ${extracted.targetAudience}`)
    if (extracted.dates) parts.push(`Important Dates: ${extracted.dates}`)
    if (extracted.speakers && extracted.speakers.length > 0) {
      parts.push(`Speakers/Authors: ${extracted.speakers.join(', ')}`)
    }
    if (extracted.rawSummary) parts.push(`\nDocument Summary:\n${extracted.rawSummary}`)
  }

  return parts.join('\n\n')
}
