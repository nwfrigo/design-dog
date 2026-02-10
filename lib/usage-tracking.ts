import { Redis } from '@upstash/redis'

// Initialize Redis client (lazy - only connects when first used)
// Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars
let redis: Redis | null = null

function getRedis(): Redis | null {
  if (redis) return redis

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    console.warn('Usage tracking: Redis not configured (missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN)')
    return null
  }

  redis = new Redis({ url, token })
  return redis
}

/**
 * Track an export event. Fire-and-forget - never blocks or throws.
 * Increments both the total counter and per-template counter.
 */
export function trackExport(templateType: string): void {
  const client = getRedis()
  if (!client) return

  // Fire-and-forget: increment counters, ignore any errors
  Promise.all([
    client.incr('exports:total'),
    client.incr(`exports:template:${templateType}`),
    client.incr(`exports:weekly`), // Reset weekly by cron job
  ]).catch(() => {
    // Silently ignore errors - tracking should never break exports
  })
}

/**
 * Get current usage stats. Used by the cron job for email reports.
 */
export async function getUsageStats(): Promise<{
  total: number
  weekly: number
  byTemplate: Record<string, number>
} | null> {
  const client = getRedis()
  if (!client) return null

  try {
    // Get all export counters
    const [total, weekly] = await Promise.all([
      client.get<number>('exports:total'),
      client.get<number>('exports:weekly'),
    ])

    // Get all template-specific counters
    const templateKeys = await client.keys('exports:template:*')
    const byTemplate: Record<string, number> = {}

    if (templateKeys.length > 0) {
      const values = await client.mget<number[]>(...templateKeys)
      templateKeys.forEach((key, i) => {
        const templateName = key.replace('exports:template:', '')
        byTemplate[templateName] = values[i] || 0
      })
    }

    return {
      total: total || 0,
      weekly: weekly || 0,
      byTemplate,
    }
  } catch (error) {
    console.error('Failed to get usage stats:', error)
    return null
  }
}

/**
 * Reset the weekly counter. Called by cron job after sending report.
 */
export async function resetWeeklyCounter(): Promise<void> {
  const client = getRedis()
  if (!client) return

  try {
    await client.set('exports:weekly', 0)
  } catch (error) {
    console.error('Failed to reset weekly counter:', error)
  }
}
