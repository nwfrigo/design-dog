import { NextResponse } from 'next/server'

export async function GET() {
  const hasResendKey = !!process.env.RESEND_API_KEY
  const keyLength = process.env.RESEND_API_KEY?.length || 0
  const keyPrefix = process.env.RESEND_API_KEY?.substring(0, 5) || 'none'

  return NextResponse.json({
    hasResendKey,
    keyLength,
    keyPrefix,
    nodeEnv: process.env.NODE_ENV,
  })
}
