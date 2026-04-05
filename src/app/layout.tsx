import type { Metadata, Viewport } from 'next'
import { Rajdhani, Sora } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const rajdhani = Rajdhani({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-display', display: 'swap' })
const sora = Sora({ subsets: ['latin'], weight: ['300','400','500','600'], variable: '--font-body', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'Gamewala Inventory', template: '%s | Gamewala' },
  description: 'Gamewala shop inventory & repair management',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'GW Inventory' },
  formatDetection: { telephone: false },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0A0A0B',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${rajdhani.variable} ${sora.variable}`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-brand-black text-brand-text font-body antialiased no-bounce select-none">
        <Toaster
          position="top-center"
          toastOptions={{
            style: { background: '#16161A', color: '#E8E8F0', border: '1px solid #2A2A32', fontSize: '14px' },
            success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#E8202A', secondary: '#fff' } },
          }}
        />
        {children}
      </body>
    </html>
  )
}
