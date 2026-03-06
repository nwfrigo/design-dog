'use client'

import { useState, useEffect } from 'react'

/**
 * Detects the current theme (dark/light) by watching the document's class list
 * for the 'dark' class. Returns true when dark mode is active.
 */
export function useThemeDetection(): boolean {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'))
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return isDark
}
