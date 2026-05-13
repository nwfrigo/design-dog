'use client'

import { useCallback } from 'react'
import { useStore } from '@/store'

/**
 * Telemetry payload shape. All fields except event_name are optional.
 * Keep payloads small — props is for low-cardinality categorical
 * dimensions (theme, variant, etc.), not full asset state.
 */
export interface TelemetryEvent {
  event_name: string
  template_id?: string
  slot_id?: string
  asset_id?: string
  props?: Record<string, unknown>
}

/** Module-level convenience for server-side / non-React callers. The
 *  client hook below is preferred — it auto-injects `user_id` from the
 *  store. */
export function trackEvent(event: TelemetryEvent, userId?: string | null): void {
  if (typeof window === 'undefined') return
  const body = {
    ...event,
    user_id: userId ?? undefined,
  }
  // Fire-and-forget; errors swallowed so telemetry can never break a
  // user action.
  void fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {})
}

/**
 * Returns a stable `track` function that auto-injects the current user's
 * `exportedBy` name (or null) into every event. Use this from React
 * components / hooks; use `trackEvent` directly when you only have a
 * raw store snapshot.
 */
export function useTelemetry() {
  const exportedBy = useStore((s) => s.exportedBy)
  return useCallback(
    (event: TelemetryEvent) => trackEvent(event, exportedBy),
    [exportedBy],
  )
}
