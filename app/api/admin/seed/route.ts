import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { SEED_TEAM_MEMBERS } from '@/lib/team-members'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS export_logs (
        id SERIAL PRIMARY KEY,
        template_type VARCHAR(100) NOT NULL,
        exported_by VARCHAR(100),
        headline TEXT,
        solution VARCHAR(50),
        format VARCHAR(10) DEFAULT 'png',
        scale INTEGER DEFAULT 1,
        thumbnail_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Add thumbnail_url column if it doesn't exist (for existing tables)
    await sql`ALTER TABLE export_logs ADD COLUMN IF NOT EXISTS thumbnail_url TEXT`

    await sql`CREATE INDEX IF NOT EXISTS idx_export_logs_created_at ON export_logs(created_at DESC)`
    await sql`CREATE INDEX IF NOT EXISTS idx_export_logs_exported_by ON export_logs(exported_by)`
    await sql`CREATE INDEX IF NOT EXISTS idx_export_logs_template ON export_logs(template_type)`

    await sql`
      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Seed team members
    for (const name of SEED_TEAM_MEMBERS) {
      await sql`INSERT INTO team_members (name) VALUES (${name}) ON CONFLICT (name) DO NOTHING`
    }

    return NextResponse.json({ success: true, message: 'Database seeded successfully' })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Seed failed' },
      { status: 500 }
    )
  }
}
