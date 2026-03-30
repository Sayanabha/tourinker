import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tourinker — Your Travel Journal',
  description: 'Log every day of your travels with AI-powered journaling',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Tourinker' },
}

export const viewport: Viewport = {
  themeColor: '#1c1917',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.className} bg-stone-50 text-stone-900 antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}