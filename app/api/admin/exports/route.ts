import { NextRequest, NextResponse } from 'next/server'
import { getExportLogs } from '@/lib/db'

export async function GET(request: NextRequest) {
  // Cookie check (middleware handles redirect, but double-check here)
  const cookie = request.cookies.get('dd-admin')
  if (!cookie || cookie.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)

  try {
    const result = await getExportLogs({
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '50', 10),
      exportedBy: searchParams.get('exportedBy') || undefined,
      templateType: searchParams.get('templateType') || undefined,
      search: searchParams.get('search') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch export logs:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}
