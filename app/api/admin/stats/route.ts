import { NextRequest, NextResponse } from 'next/server'
import { getExportStats } from '@/lib/db'

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get('dd-admin')
  if (!cookie || cookie.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const stats = await getExportStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
