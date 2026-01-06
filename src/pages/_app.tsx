import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { AuthProvider } from '@/context/AuthContext'
import { JournalProvider } from '@/context/JournalContext'
import { ThemeProvider } from '@/context/ThemeContext'

// Import logger to disable console in production
import '@/utils/logger'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <JournalProvider>
          <Component {...pageProps} />
          <Analytics />
          <SpeedInsights />
        </JournalProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}