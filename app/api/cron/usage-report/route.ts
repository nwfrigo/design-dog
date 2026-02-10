import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getUsageStats, resetWeeklyCounter } from '@/lib/usage-tracking'

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // In production, require the cron secret
    if (process.env.VERCEL_ENV === 'production' && cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Get usage stats
    const stats = await getUsageStats()

    if (!stats) {
      console.log('Usage report: Redis not configured or no stats available')
      return NextResponse.json({
        success: false,
        message: 'Redis not configured'
      })
    }

    // Check for Resend API key
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured')
      return NextResponse.json({
        success: false,
        message: 'Email service not configured'
      })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    // Sort templates by count (descending)
    const sortedTemplates = Object.entries(stats.byTemplate)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => `  - ${name}: ${count}`)
      .join('\n')

    // Format the email
    const emailHtml = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin-bottom: 24px;">
          Design Dog Weekly Usage Report
        </h1>

        <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <div style="display: flex; gap: 40px;">
            <div>
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">This Week</div>
              <div style="color: #1a1a1a; font-size: 36px; font-weight: 600;">${stats.weekly}</div>
            </div>
            <div>
              <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">All Time</div>
              <div style="color: #1a1a1a; font-size: 36px; font-weight: 600;">${stats.total}</div>
            </div>
          </div>
        </div>

        ${Object.keys(stats.byTemplate).length > 0 ? `
        <div style="margin-bottom: 24px;">
          <h2 style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin-bottom: 12px;">
            Exports by Template
          </h2>
          <div style="background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px;">
            <table style="width: 100%; border-collapse: collapse;">
              ${Object.entries(stats.byTemplate)
                .sort(([, a], [, b]) => b - a)
                .map(([name, count]) => `
                  <tr>
                    <td style="padding: 6px 0; color: #333; font-size: 14px;">${name}</td>
                    <td style="padding: 6px 0; color: #666; font-size: 14px; text-align: right; font-weight: 500;">${count}</td>
                  </tr>
                `).join('')}
            </table>
          </div>
        </div>
        ` : ''}

        <div style="border-top: 1px solid #e5e5e5; padding-top: 16px; color: #999; font-size: 12px;">
          Automated report from Design Dog &bull; ${new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>
    `

    // Send the email
    const { error } = await resend.emails.send({
      from: 'Design Dog <onboarding@resend.dev>',
      to: ['nick.frigo@gmail.com'],
      subject: `Design Dog Usage: ${stats.weekly} exports this week (${stats.total} total)`,
      html: emailHtml,
    })

    if (error) {
      console.error('Failed to send usage report email:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    // Reset weekly counter after successful email
    await resetWeeklyCounter()

    console.log(`Usage report sent: ${stats.weekly} weekly, ${stats.total} total`)

    return NextResponse.json({
      success: true,
      stats,
      message: 'Usage report sent successfully'
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
