import { NextRequest, NextResponse } from 'next/server'
import { getTeamMembers, addTeamMember } from '@/lib/db'

export async function GET() {
  try {
    const members = await getTeamMembers()
    return NextResponse.json({ members })
  } catch (error) {
    console.error('Failed to fetch team members:', error)
    return NextResponse.json({ members: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    if (name.trim().length > 100) {
      return NextResponse.json({ error: 'Name too long' }, { status: 400 })
    }

    const member = await addTeamMember(name)

    if (!member) {
      // Name already exists — fetch and return it
      const members = await getTeamMembers()
      const existing = members.find((m) => m.name.toLowerCase() === name.trim().toLowerCase())
      return NextResponse.json({ member: existing || { name: name.trim() } })
    }

    return NextResponse.json({ member })
  } catch (error) {
    console.error('Failed to add team member:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add member' },
      { status: 500 }
    )
  }
}
