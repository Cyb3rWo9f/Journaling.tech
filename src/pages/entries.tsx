import { ThemeProvider } from '../context/ThemeContext'
import { AuthProvider } from '../context/AuthContext'
import { JournalProvider } from '../context/JournalContext'
import { Layout, PageContainer } from '../components/layout/Layout'
import { EntriesPage } from '@/components/journal/EntriesPage'
import { LoginScreen } from '../components/auth/LoginScreen'
import { useAuth } from '../context/AuthContext'

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
      <Layout>
        <PageContainer>
          <EntriesPage />
        </PageContainer>
      </Layout>
    </JournalProvider>
  )
}

export default function Entries() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}