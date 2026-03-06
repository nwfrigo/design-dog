'use client'

export function DeleteConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  itemType,
  itemLabel,
}: {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  itemType: string
  itemLabel?: string
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white dark:bg-surface-secondary rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-content-primary mb-2">
          Delete {itemType}{itemLabel ? ` ${itemLabel}` : ''}?
        </h3>
        <p className="text-sm text-gray-600 dark:text-content-secondary mb-6">
          This action cannot be undone. Are you sure you want to delete this {itemType.toLowerCase()}?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-content-secondary bg-gray-100 dark:bg-surface-tertiary rounded-lg hover:bg-gray-200 dark:hover:bg-interactive-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
