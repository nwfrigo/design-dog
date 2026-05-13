import { NextRequest, NextResponse } from 'next/server'
import { logEvent } from '@/lib/db'

/**
 * Telemetry endpoint — fire-and-forget event logging.
 *
 * POST body:
 *   {
 *     event_name: string,    // required, e.g. 'slot_edited'
 *     template_id?: string,  // e.g. 'website-webinar'
 *     slot_id?: string,      // e.g. 'speaker1Name'
 *     asset_id?: string,     // queue item id or anonymous draft id
 *     user_id?: string,      // exportedBy name; null = anonymous
 *     props?: Record<string, unknown>  // event-specific payload
 *   }
 *
 * No auth — events flow from any client. Body size validated minimally.
 * Returns 204 on success. Errors are swallowed at the DB layer so a
 * down database doesn't break the editor.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (typeof body?.event_name !== 'string' || body.event_name.length === 0) {
      return NextResponse.json({ error: 'event_name required' }, { status: 400 })
    }

    logEvent({
      eventName: body.event_name.slice(0, 50),
      templateId: typeof body.template_id === 'string' ? body.template_id.slice(0, 100) : null,
      slotId: typeof body.slot_id === 'string' ? body.slot_id.slice(0, 100) : null,
      assetId: typeof body.asset_id === 'string' ? body.asset_id.slice(0, 100) : null,
      userId: typeof body.user_id === 'string' ? body.user_id.slice(0, 100) : null,
      props: body.props && typeof body.props === 'object' ? body.props : null,
    })

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    // Body parse error or similar. Don't surface — telemetry shouldn't
    // ever crash a caller.
    console.error('Failed to ingest event:', err)
    return new NextResponse(null, { status: 204 })
  }
}
