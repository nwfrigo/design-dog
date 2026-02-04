import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Design Dog',
  description: 'AI-powered creative automation for brand copy',
  icons: {
    icon: '/assets/brand/design_dog_favicon_1.svg',
  },
}

// Script to set theme before React hydrates (prevents flash)
// Explicitly handles theme - does NOT follow system preference
const themeScript = `
  (function() {
    var saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      if (!saved) {
        localStorage.setItem('theme', 'light');
      }
    }
  })();
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-white dark:bg-gray-950">{children}</body>
    </html>
  )
}
