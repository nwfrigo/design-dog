import { NextResponse } from 'next/server'
import { getExportLogs, getExportSnapshot } from '@/lib/db'

/**
 * My Work sidebar data.
 *
 * GET ?by=<name>            — that person's export history, newest first.
 *                             List rows carry `has_snapshot`, never the blob.
 * GET ?snapshot=<id>        — one export's restorable editor snapshot, fetched
 *                             only when the user actually clicks Clone/Edit.
 *
 * Same trust model as the rest of the app: identity is the picked name, so
 * this is personalization, not access control — the admin dashboard already
 * shows every export to everyone.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const snapshotId = searchParams.get('snapshot')
  if (snapshotId) {
    const id = Number(snapshotId)
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }
    try {
      const result = await getExportSnapshot(id)
      if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      return NextResponse.json(result)
    } catch (error) {
      console.error('Snapshot fetch failed:', error)
      return NextResponse.json({ error: 'Snapshot fetch failed' }, { status: 500 })
    }
  }

  const by = searchParams.get('by')
  if (!by) return NextResponse.json({ error: 'Missing by' }, { status: 400 })
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  try {
    const { logs, total } = await getExportLogs({ exportedBy: by, page, limit: 60 })
    return NextResponse.json({ logs, total })
  } catch (error) {
    console.error('My exports fetch failed:', error)
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })
  }
}
