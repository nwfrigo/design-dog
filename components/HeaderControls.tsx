'use client'

import { useState } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ReportBugModal, ReportBugLink } from '@/components/ReportBugModal'

interface HeaderControlsProps {
  screenName?: string
}

/**
 * Reusable header controls with theme toggle and bug report.
 * Use this in any screen that needs consistent header functionality.
 */
export function HeaderControls({ screenName = 'Setup Screen' }: HeaderControlsProps) {
  const [showBugModal, setShowBugModal] = useState(false)

  return (
    <>
      <div className="flex items-center gap-3">
        <ReportBugLink onClick={() => setShowBugModal(true)} />
        <ThemeToggle />
      </div>

      {showBugModal && (
        <ReportBugModal
          screenName={screenName}
          onClose={() => setShowBugModal(false)}
        />
      )}
    </>
  )
}
