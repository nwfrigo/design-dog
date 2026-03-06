interface ToggleSwitchProps {
  label: string
  checked: boolean
  onChange: () => void
  className?: string
}

export function ToggleSwitch({ label, checked, onChange, className = '' }: ToggleSwitchProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <label className="text-xs text-gray-500 dark:text-content-secondary">{label}</label>
      <button
        type="button"
        onClick={onChange}
        className={`relative w-9 h-5 rounded-full transition-colors ${
          checked ? 'bg-blue-500' : 'bg-gray-300 dark:bg-surface-tertiary'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-4' : ''
          }`}
        />
      </button>
    </div>
  )
}
