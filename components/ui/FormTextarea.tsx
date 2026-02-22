'use client'

import { TextareaHTMLAttributes, forwardRef } from 'react'

export interface FormTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  /** Apply dimmed styling when field is hidden */
  dimmed?: boolean
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ dimmed, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        {...props}
        className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
          bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
          focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none
          ${dimmed ? 'opacity-50' : ''}`}
      />
    )
  }
)

FormTextarea.displayName = 'FormTextarea'
