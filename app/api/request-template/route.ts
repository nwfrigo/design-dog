import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  try {
    // Check for API key
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    const body = await request.json()
    const { name, email, description, channelName } = body

    // Validate required fields
    if (!name || !email || !description) {
      return NextResponse.json(
        { error: 'Name, email, and description are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Design Dog <onboarding@resend.dev>',
      to: ['nick.frigo@gmail.com'],
      subject: 'Design Dog - New Template Request',
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin-bottom: 24px;">
            New Template Request
          </h1>

          <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px; width: 120px;">Name:</td>
                <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Email:</td>
                <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px;">
                  <a href="mailto:${email}" style="color: #2563eb;">${email}</a>
                </td>
              </tr>
              ${channelName ? `
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Channel:</td>
                <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${channelName}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <div style="margin-bottom: 24px;">
            <h2 style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin-bottom: 12px;">
              Description
            </h2>
            <div style="background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px; white-space: pre-wrap; color: #333; font-size: 14px; line-height: 1.6;">
${description}
            </div>
          </div>

          <div style="border-top: 1px solid #e5e5e5; padding-top: 16px; color: #999; font-size: 12px;">
            Sent from Design Dog Template Request Form
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { error: error.message || 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    console.error('Request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
