'use client'

/**
 * TEMP launch entry — SPIKE. Opens the custom-size editor without the real
 * homepage entry (which is deferred for the Figma editor direction). Replace
 * with the designed "Custom Size" CTA when that lands. View at
 * /custom-size-lab/launch.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store'
import { saveDraftToStorage } from '@/lib/draft-storage'

export default function CustomSizeLaunch() {
  const goToEditorWithTemplate = useStore((s) => s.goToEditorWithTemplate)
  const router = useRouter()
  useEffect(() => {
    goToEditorWithTemplate('custom-size')
    // Persist a draft so /editor's draft-guard doesn't bounce us home.
    saveDraftToStorage(useStore.getState())
    router.push('/editor')
  }, [goToEditorWithTemplate, router])
  return <div style={{ padding: 40, fontFamily: 'Inter, system-ui, sans-serif', color: '#333' }}>Launching custom-size editor…</div>
}
