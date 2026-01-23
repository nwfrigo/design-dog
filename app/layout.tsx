import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Design Dog',
  description: 'AI-powered creative automation for brand copy',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white dark:bg-gray-950">{children}</body>
    </html>
  )
}
