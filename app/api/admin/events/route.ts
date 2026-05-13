import { NextRequest, NextResponse } from 'next/server'
import { getEventCounts } from '@/lib/db'

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get('dd-admin')
  if (!cookie || cookie.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const start = request.nextUrl.searchParams.get('start')
    const end = request.nextUrl.searchParams.get('end')
    const counts = await getEventCounts({ start, end })
    return NextResponse.json(counts)
  } catch (error) {
    console.error('Failed to fetch event counts:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch event counts' },
      { status: 500 }
    )
  }
}
