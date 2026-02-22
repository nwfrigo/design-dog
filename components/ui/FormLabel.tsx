'use client'

import { LabelHTMLAttributes, ReactNode } from 'react'

export interface FormLabelProps extends Omit<LabelHTMLAttributes<HTMLLabelElement>, 'className'> {
  children: ReactNode
}

export function FormLabel({ children, ...props }: FormLabelProps) {
  return (
    <label
      {...props}
      className="text-xs font-medium text-gray-500 uppercase tracking-wide"
    >
      {children}
    </label>
  )
}
