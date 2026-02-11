'use client'

import { useState, useCallback } from 'react'

interface TableGridPickerProps {
  onSelect: (rows: number, cols: number) => void
  maxRows?: number
  maxCols?: number
}

export function TableGridPicker({ onSelect, maxRows = 8, maxCols = 6 }: TableGridPickerProps) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)

  const handleMouseEnter = useCallback((row: number, col: number) => {
    setHoveredCell({ row, col })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHoveredCell(null)
  }, [])

  const handleClick = useCallback((row: number, col: number) => {
    onSelect(row, col)
  }, [onSelect])

  return (
    <div className="inline-block">
      <div
        className="grid gap-0.5 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: maxRows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-0.5">
            {Array.from({ length: maxCols }).map((_, colIndex) => {
              const row = rowIndex + 1
              const col = colIndex + 1
              const isHighlighted = hoveredCell && row <= hoveredCell.row && col <= hoveredCell.col

              return (
                <button
                  key={colIndex}
                  type="button"
                  className={`
                    w-5 h-5 border rounded-sm transition-colors
                    ${isHighlighted
                      ? 'bg-blue-500 border-blue-600'
                      : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-blue-400'
                    }
                  `}
                  onMouseEnter={() => handleMouseEnter(row, col)}
                  onClick={() => handleClick(row, col)}
                />
              )
            })}
          </div>
        ))}
      </div>
      {/* Size indicator */}
      <div className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        {hoveredCell ? `${hoveredCell.row} × ${hoveredCell.col}` : 'Select size'}
      </div>
    </div>
  )
}

// Dropdown wrapper for the table grid picker
interface TableGridDropdownProps {
  onSelect: (rows: number, cols: number) => void
  children: React.ReactNode
}

export function TableGridDropdown({ onSelect, children }: TableGridDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (rows: number, cols: number) => {
    onSelect(rows, cols)
    setIsOpen(false)
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1"
      >
        {children}
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown content */}
          <div className="absolute left-0 top-full mt-1 z-50">
            <TableGridPicker onSelect={handleSelect} />
          </div>
        </>
      )}
    </div>
  )
}
