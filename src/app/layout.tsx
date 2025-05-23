// app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'
import Providers from './providers'
import SignalRProvider from '@/app/SignalRProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'VirtuPath AI',
  description: 'Your personal AI assistant for daily tasks and training.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          href="/virtupathai-favicon-192.png"
          type="image/png"
          sizes="192x192"
        />
        <link rel="preload" href="/footer-grid.svg" as="image" />
      </head>
      <body className={`${inter.className} overflow-x-hidden  max-w-full`}>
        <SignalRProvider>
          <Providers>
              {children}
          </Providers>
        </SignalRProvider> 
      </body>
    </html>
  )
}
