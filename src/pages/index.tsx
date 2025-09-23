import { ThemeProvider } from '../context/ThemeContext'
import { AuthProvider } from '../context/AuthContext'
import { JournalProvider } from '../context/JournalContext'
import { Layout, PageContainer } from '../components/layout/Layout'
import { JournalEditor } from '../components/journal/JournalEditor'
import { LoginScreen } from '../components/auth/LoginScreen'
import { useAuth } from '../context/AuthContext'
import { useJournal } from '../context/JournalContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { JournalEntry } from '../types'

function JournalPage() {
  const { entries } = useJournal()
  const router = useRouter()
  const { edit } = router.query
  const [editEntry, setEditEntry] = useState<JournalEntry | undefined>(undefined)

  useEffect(() => {
    if (edit && typeof edit === 'string' && entries.length > 0) {
      const entryToEdit = entries.find(entry => entry.id === edit)
      setEditEntry(entryToEdit)
    } else {
      setEditEntry(undefined)
    }
  }, [edit, entries])

  return (
    <Layout>
      <PageContainer>
        <div className="max-w-6xl mx-auto">
          <JournalEditor entry={editEntry} />
        </div>
      </PageContainer>
    </Layout>
  )
}

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] dark:bg-[#0b0f13]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen />
  }

  return (
    <JournalProvider>
      <JournalPage />
    </JournalProvider>
  )
}

export default function Home() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}