'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface HeaderProps {
  onLogoClick: () => void
  centerContent?: React.ReactNode
  rightContent?: React.ReactNode
  scrollContainerRef?: React.RefObject<HTMLElement>
  maxWidth?: string
}

export function Header({
  onLogoClick,
  centerContent,
  rightContent,
  scrollContainerRef,
  maxWidth = 'max-w-[1600px]',
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  const handleScroll = useCallback(() => {
    const scrollTop = scrollContainerRef?.current
      ? scrollContainerRef.current.scrollTop
      : window.scrollY

    setIsScrolled(scrollTop > 50)
  }, [scrollContainerRef])

  useEffect(() => {
    const scrollElement = scrollContainerRef?.current || window

    // Initial check
    handleScroll()

    scrollElement.addEventListener('scroll', handleScroll, { passive: true })
    return () => scrollElement.removeEventListener('scroll', handleScroll)
  }, [handleScroll, scrollContainerRef])

  return (
    <header
      ref={headerRef}
      className="bg-white dark:bg-black border-b border-gray-100 dark:border-gray-900 flex-shrink-0 transition-all duration-200 ease-in-out sticky top-0 z-40"
      style={{ height: isScrolled ? 60 : 100 }}
    >
      <div className={`${maxWidth} mx-auto px-6 h-full flex items-center justify-between`}>
        {/* Logo area - fixed width container for smooth transition */}
        <button
          onClick={onLogoClick}
          className="hover:opacity-80 transition-all duration-200 ease-in-out relative h-8 overflow-visible"
          style={{ minWidth: 32 }}
        >
          {/* Full logo - light mode (in flow, determines button width when visible) */}
          <img
            src="/assets/brand/design-dog-logo-color-light-cority.svg"
            alt="Design Dog"
            className="h-8 dark:hidden transition-opacity duration-200 ease-in-out"
            style={{ opacity: isScrolled ? 0 : 1 }}
          />
          {/* Full logo - dark mode */}
          <img
            src="/assets/brand/design-dog-logo-color-cority.svg"
            alt="Design Dog"
            className="h-8 hidden dark:block transition-opacity duration-200 ease-in-out"
            style={{ opacity: isScrolled ? 0 : 1 }}
          />
          {/* Icon - overlaid, fades in when scrolled */}
          <img
            src="/assets/brand/design_dog_icon.svg"
            alt="Design Dog"
            className="h-8 w-8 transition-opacity duration-200 ease-in-out absolute top-0 left-0"
            style={{ opacity: isScrolled ? 1 : 0 }}
          />
        </button>

        {/* Center content */}
        <div className="flex items-center gap-4">
          {centerContent}
        </div>

        {/* Right side content */}
        <div className="flex items-center gap-3">
          {rightContent}
        </div>
      </div>
    </header>
  )
}
