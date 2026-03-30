import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Only protect /admin page routes (not /api/admin — those check cookies themselves)
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const cookie = request.cookies.get('dd-admin')

    if (!cookie || cookie.value !== 'authenticated') {
      // Redirect to admin login page
      const loginUrl = new URL('/admin', request.url)
      loginUrl.searchParams.set('login', '1')

      // If already on admin with login param, let it through (the page handles login UI)
      if (request.nextUrl.searchParams.get('login') === '1') {
        return NextResponse.next()
      }

      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
