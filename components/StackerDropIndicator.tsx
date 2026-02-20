'use client'

import { CSSProperties } from 'react'

export interface StackerDropIndicatorProps {
  isVisible: boolean
}

export function StackerDropIndicator({ isVisible }: StackerDropIndicatorProps) {
  const style: CSSProperties = {
    height: 3,
    background: '#3B82F6', // blue-500
    borderRadius: 2,
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 150ms ease-out',
    pointerEvents: 'none',
  }

  return <div style={style} />
}

export default StackerDropIndicator
