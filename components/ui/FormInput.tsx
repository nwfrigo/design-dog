'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

export interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  /** Apply dimmed styling when field is hidden */
  dimmed?: boolean
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ dimmed, ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
          bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${dimmed ? 'opacity-50' : ''}`}
      />
    )
  }
)

FormInput.displayName = 'FormInput'
