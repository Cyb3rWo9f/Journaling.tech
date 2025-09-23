import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Analytics } from '@vercel/analytics/react'
import { AuthProvider } from '@/context/AuthContext'
import { JournalProvider } from '@/context/JournalContext'
import { ThemeProvider } from '@/context/ThemeContext'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <JournalProvider>
          <Component {...pageProps} />
          <Analytics />
        </JournalProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}