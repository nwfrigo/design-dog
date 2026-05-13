'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { INFO_MODAL_STORAGE_KEY } from './config'
import { InfoModalDialog } from './InfoModalDialog'
import { InfoToast } from './InfoToast'

type State = 'hidden' | 'modal' | 'toast'

/**
 * Mounted once globally in `app/layout.tsx`. Three states:
 * - `modal` — open on first load (until user closes once).
 * - `toast` — collapsed chip at bottom-left. Re-opens the modal on click.
 * - `hidden` — only on /admin pages (or pre-hydration).
 *
 * State transitions:
 *   first load (no flag)                   → modal
 *   close button on modal                  → toast (+ writes localStorage flag)
 *   click on toast                         → modal (does not unset flag)
 *   any state, pathname.startsWith('/admin')→ hidden
 *
 * Permanent fixture for the 1.5 launch — no auto-vanish. Delete the
 * `components/InfoModal/` directory + `public/assets/info-modal/` +
 * the mount in `app/layout.tsx` when the window has run its course.
 */
export function InfoModal() {
  const pathname = usePathname()
  const [state, setState] = useState<State>('hidden')
  const [mounted, setMounted] = useState(false)

  // Compute initial state after mount (localStorage isn't available SSR).
  useEffect(() => {
    setMounted(true)
    const seen = typeof window !== 'undefined'
      ? window.localStorage.getItem(INFO_MODAL_STORAGE_KEY)
      : null
    setState(seen ? 'toast' : 'modal')
  }, [])

  if (!mounted) return null
  if (pathname?.startsWith('/admin')) return null
  if (state === 'hidden') return null

  const handleClose = () => {
    try {
      window.localStorage.setItem(INFO_MODAL_STORAGE_KEY, '1')
    } catch {
      // localStorage can throw in private-browsing / quota-exceeded. Toast
      // still renders this session; flag just won't persist.
    }
    setState('toast')
  }

  const handleReopen = () => setState('modal')

  if (state === 'modal') return <InfoModalDialog onClose={handleClose} />
  return <InfoToast onClick={handleReopen} />
}
