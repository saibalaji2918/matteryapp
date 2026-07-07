import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Eternal - Matrimonial Profile Platform',
  description: 'A secure, privacy-first matrimonial platform for family-managed profiles.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
