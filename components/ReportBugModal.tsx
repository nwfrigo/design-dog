'use client'

import { useState, useEffect } from 'react'

interface ReportBugModalProps {
  screenName: string
  onClose: () => void
}

export function ReportBugModal({ screenName, onClose }: ReportBugModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Capture browser metadata on mount
  const [metadata, setMetadata] = useState({
    userAgent: '',
    screenSize: '',
    timestamp: '',
  })

  useEffect(() => {
    setMetadata({
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth} × ${window.innerHeight}`,
      timestamp: new Date().toISOString(),
    })
  }, [])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, isSubmitting])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const response = await fetch('/api/report-bug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          description,
          screenName,
          ...metadata,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit report')
      }

      setSubmitStatus('success')
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = name.trim() && email.trim() && description.trim()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!isSubmitting ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Report a Bug
            </h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Help us improve Design Dog
          </p>
        </div>

        {/* Content */}
        {submitStatus === 'success' ? (
          <div className="p-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Bug Report Submitted
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Thanks for reporting this bug! We'll look into it.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="bug-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="bug-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-colors"
                placeholder="Your name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="bug-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="bug-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="bug-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Bug Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="bug-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                rows={4}
                className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 resize-none transition-colors"
                placeholder="What happened? What did you expect to happen?"
                required
              />
            </div>

            {/* Error message */}
            {submitStatus === 'error' && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
              </div>
            )}

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// The subtle text link that opens the modal
export function ReportBugLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
    >
      Report Bug
    </button>
  )
}
