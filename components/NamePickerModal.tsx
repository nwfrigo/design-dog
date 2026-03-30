'use client'

import { useState, useEffect } from 'react'

const USER_KEY = 'design-dog-user'

interface NamePickerModalProps {
  onSelect: (name: string) => void
}

export function NamePickerModal({ onSelect }: NamePickerModalProps) {
  const [members, setMembers] = useState<{ id: number; name: string }[]>([])
  const [selected, setSelected] = useState('')
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/team-members')
      .then((res) => res.json())
      .then((data) => {
        setMembers(data.members || [])
        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
      })
  }, [])

  const handleConfirm = async () => {
    if (isAddingNew && newName.trim()) {
      setIsSubmitting(true)
      try {
        await fetch('/api/team-members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newName.trim() }),
        })
        saveAndSelect(newName.trim())
      } catch {
        saveAndSelect(newName.trim())
      }
    } else if (selected) {
      saveAndSelect(selected)
    }
  }

  const saveAndSelect = (name: string) => {
    localStorage.setItem(USER_KEY, name)
    onSelect(name)
  }

  const canSubmit = isAddingNew ? newName.trim().length > 0 : selected.length > 0

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-secondary rounded-xl shadow-2xl w-full max-w-xs mx-4 p-5">
        <p className="text-xs font-mono text-gray-400 dark:text-content-secondary mb-3 leading-relaxed">
          select or add your name
        </p>

        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {!isAddingNew ? (
              <div className="space-y-1.5 mb-4">
                {members.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setSelected(member.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg border text-xs font-mono transition-colors ${
                      selected === member.name
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-500 dark:text-content-secondary'
                    }`}
                  >
                    {member.name}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setIsAddingNew(true)
                    setSelected('')
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-xs font-mono text-gray-400 dark:text-content-secondary hover:text-gray-500 transition-colors"
                >
                  + add
                </button>
              </div>
            ) : (
              <div className="mb-4">
                <button
                  onClick={() => {
                    setIsAddingNew(false)
                    setNewName('')
                  }}
                  className="text-xs font-mono text-gray-400 dark:text-content-secondary hover:text-gray-500 dark:hover:text-gray-400 mb-2 flex items-center gap-1 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  back
                </button>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="first last"
                  autoFocus
                  maxLength={100}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && canSubmit) handleConfirm()
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-primary text-xs font-mono text-gray-600 dark:text-content-secondary placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={!canSubmit || isSubmitting}
              className="w-full py-2 rounded-lg bg-blue-600 text-white text-xs font-mono hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'saving...' : 'continue'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Get the stored user name from localStorage.
 */
export function getStoredUser(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(USER_KEY)
}

/**
 * Clear the stored user (for changing identity).
 */
export function clearStoredUser(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(USER_KEY)
}

/**
 * Small badge component showing current user with option to change.
 */
export function UserBadge({ name, onChange }: { name: string; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-mono text-gray-400 dark:text-content-secondary transition-colors"
      title="Change identity"
    >
      <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      {name}
    </button>
  )
}
