import { sql } from '@vercel/postgres'

export interface ExportLog {
  id: number
  template_type: string
  exported_by: string | null
  headline: string | null
  solution: string | null
  format: string
  scale: number
  thumbnail_url: string | null
  created_at: string
}

export interface ExportStats {
  total: number
  today: number
  thisWeek: number
  byTemplate: Record<string, number>
  byPerson: Record<string, number>
  dailyCounts: { date: string; count: number }[]
}

/**
 * Log an export event to Postgres. Fire-and-forget — never blocks exports.
 */
export function logExport(data: {
  templateType: string
  exportedBy?: string
  headline?: string
  solution?: string
  format?: string
  scale?: number
  thumbnailUrl?: string
}): void {
  sql`
    INSERT INTO export_logs (template_type, exported_by, headline, solution, format, scale, thumbnail_url)
    VALUES (
      ${data.templateType},
      ${data.exportedBy || null},
      ${data.headline ? data.headline.substring(0, 200) : null},
      ${data.solution || null},
      ${data.format || 'png'},
      ${data.scale || 1},
      ${data.thumbnailUrl || null}
    )
  `.catch((err) => {
    console.error('Failed to log export:', err)
  })
}

/**
 * Get paginated export logs with optional filters.
 */
export async function getExportLogs(opts: {
  page?: number
  limit?: number
  exportedBy?: string
  templateType?: string
  search?: string
  startDate?: string
  endDate?: string
}): Promise<{ logs: ExportLog[]; total: number }> {
  const page = opts.page || 1
  const limit = opts.limit || 50
  const offset = (page - 1) * limit

  const conditions: string[] = []
  const values: (string | number)[] = []
  let paramIndex = 1

  if (opts.exportedBy) {
    conditions.push(`exported_by = $${paramIndex++}`)
    values.push(opts.exportedBy)
  }
  if (opts.templateType) {
    conditions.push(`template_type = $${paramIndex++}`)
    values.push(opts.templateType)
  }
  if (opts.search) {
    conditions.push(`headline ILIKE $${paramIndex++}`)
    values.push(`%${opts.search}%`)
  }
  if (opts.startDate) {
    conditions.push(`created_at >= $${paramIndex++}`)
    values.push(opts.startDate)
  }
  if (opts.endDate) {
    conditions.push(`created_at <= $${paramIndex++}`)
    values.push(opts.endDate)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const countQuery = `SELECT COUNT(*) as count FROM export_logs ${where}`
  const dataQuery = `SELECT * FROM export_logs ${where} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`

  const allValues = [...values, limit, offset]

  const [countResult, dataResult] = await Promise.all([
    sql.query(countQuery, values),
    sql.query(dataQuery, allValues),
  ])

  return {
    logs: dataResult.rows as ExportLog[],
    total: parseInt(countResult.rows[0].count, 10),
  }
}

/**
 * Get aggregate stats for the admin dashboard.
 */
export async function getExportStats(): Promise<ExportStats> {
  const [totalResult, todayResult, weekResult, templateResult, personResult, dailyResult] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM export_logs`,
    sql`SELECT COUNT(*) as count FROM export_logs WHERE created_at >= CURRENT_DATE`,
    sql`SELECT COUNT(*) as count FROM export_logs WHERE created_at >= NOW() - INTERVAL '7 days'`,
    sql`SELECT template_type, COUNT(*) as count FROM export_logs GROUP BY template_type ORDER BY count DESC`,
    sql`SELECT exported_by, COUNT(*) as count FROM export_logs WHERE exported_by IS NOT NULL GROUP BY exported_by ORDER BY count DESC`,
    sql`SELECT DATE(created_at) as date, COUNT(*) as count FROM export_logs WHERE created_at >= NOW() - INTERVAL '30 days' GROUP BY DATE(created_at) ORDER BY date ASC`,
  ])

  const byTemplate: Record<string, number> = {}
  for (const row of templateResult.rows) {
    byTemplate[row.template_type] = parseInt(row.count, 10)
  }

  const byPerson: Record<string, number> = {}
  for (const row of personResult.rows) {
    byPerson[row.exported_by] = parseInt(row.count, 10)
  }

  const dailyCounts = dailyResult.rows.map((row) => ({
    date: row.date,
    count: parseInt(row.count, 10),
  }))

  return {
    total: parseInt(totalResult.rows[0].count, 10),
    today: parseInt(todayResult.rows[0].count, 10),
    thisWeek: parseInt(weekResult.rows[0].count, 10),
    byTemplate,
    byPerson,
    dailyCounts,
  }
}

/**
 * Get all team members from the database.
 */
export async function getTeamMembers(): Promise<{ id: number; name: string }[]> {
  const result = await sql`SELECT id, name FROM team_members ORDER BY name ASC`
  return result.rows as { id: number; name: string }[]
}

/**
 * Add a new team member. Returns the new member or null if name already exists.
 */
export async function addTeamMember(name: string): Promise<{ id: number; name: string } | null> {
  try {
    const result = await sql`
      INSERT INTO team_members (name) VALUES (${name.trim()})
      ON CONFLICT (name) DO NOTHING
      RETURNING id, name
    `
    return result.rows[0] as { id: number; name: string } | null
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Telemetry events
// ---------------------------------------------------------------------------

export interface EventRow {
  id: number
  event_name: string
  template_id: string | null
  slot_id: string | null
  asset_id: string | null
  user_id: string | null
  props: Record<string, unknown> | null
  created_at: string
}

export interface EventCounts {
  total: number
  byName: { event_name: string; count: number }[]
  byTemplate: { template_id: string; count: number }[]
  byUser: { user_id: string; count: number }[]
}

/**
 * Log a telemetry event. Fire-and-forget — never blocks the calling action.
 * Surface is intentionally generic — see `/api/track` for the wire format.
 */
export function logEvent(data: {
  eventName: string
  templateId?: string | null
  slotId?: string | null
  assetId?: string | null
  userId?: string | null
  props?: Record<string, unknown> | null
}): void {
  const propsJson = data.props ? JSON.stringify(data.props) : null
  sql`
    INSERT INTO events (event_name, template_id, slot_id, asset_id, user_id, props)
    VALUES (
      ${data.eventName},
      ${data.templateId || null},
      ${data.slotId || null},
      ${data.assetId || null},
      ${data.userId || null},
      ${propsJson}::jsonb
    )
  `.catch((err) => {
    console.error('Failed to log event:', err)
  })
}

/**
 * Group-by counts for the admin events page. Date filter is inclusive of start,
 * exclusive of end (ISO yyyy-mm-dd strings; null = no bound).
 */
export async function getEventCounts(opts: {
  start?: string | null
  end?: string | null
}): Promise<EventCounts> {
  // null params skip their bound. @vercel/postgres tag doesn't compose
  // nested fragments, so the WHERE clause is repeated inline per query.
  const start = opts.start || null
  const end = opts.end || null

  const totalRes = await sql`
    SELECT COUNT(*)::int AS count FROM events
    WHERE (${start}::timestamptz IS NULL OR created_at >= ${start}::timestamptz)
      AND (${end}::timestamptz IS NULL OR created_at < ${end}::timestamptz)
  `
  const byNameRes = await sql`
    SELECT event_name, COUNT(*)::int AS count FROM events
    WHERE (${start}::timestamptz IS NULL OR created_at >= ${start}::timestamptz)
      AND (${end}::timestamptz IS NULL OR created_at < ${end}::timestamptz)
    GROUP BY event_name ORDER BY count DESC
  `
  const byTemplateRes = await sql`
    SELECT COALESCE(template_id, '(none)') AS template_id, COUNT(*)::int AS count
    FROM events
    WHERE (${start}::timestamptz IS NULL OR created_at >= ${start}::timestamptz)
      AND (${end}::timestamptz IS NULL OR created_at < ${end}::timestamptz)
    GROUP BY template_id ORDER BY count DESC
  `
  const byUserRes = await sql`
    SELECT COALESCE(user_id, '(anon)') AS user_id, COUNT(*)::int AS count
    FROM events
    WHERE (${start}::timestamptz IS NULL OR created_at >= ${start}::timestamptz)
      AND (${end}::timestamptz IS NULL OR created_at < ${end}::timestamptz)
    GROUP BY user_id ORDER BY count DESC
    LIMIT 20
  `

  return {
    total: (totalRes.rows[0]?.count as number) ?? 0,
    byName: byNameRes.rows as { event_name: string; count: number }[],
    byTemplate: byTemplateRes.rows as { template_id: string; count: number }[],
    byUser: byUserRes.rows as { user_id: string; count: number }[],
  }
}
