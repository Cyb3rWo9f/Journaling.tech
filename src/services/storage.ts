import { JournalEntry, WeeklySummary, EntrySummary, User } from '@/types'

const STORAGE_KEYS = {
  ENTRIES: 'journal-entries',
  SUMMARIES: 'weekly-summaries',
  ENTRY_SUMMARIES: 'entry-summaries',
  USER: 'user-data',
  THEME: 'theme-preference'
} as const

class LocalStorageService {
  // Journal Entries
  getEntries(): JournalEntry[] {
    if (typeof window === 'undefined') return []
    
    try {
      const entries = localStorage.getItem(STORAGE_KEYS.ENTRIES)
      return entries ? JSON.parse(entries) : []
    } catch (error) {
      console.error('Error reading entries from localStorage:', error)
      return []
    }
  }

  saveEntry(entry: JournalEntry): void {
    if (typeof window === 'undefined') return
    
    try {
      const entries = this.getEntries()
      const existingIndex = entries.findIndex(e => e.id === entry.id)
      
      if (existingIndex >= 0) {
        entries[existingIndex] = entry
      } else {
        entries.push(entry)
      }
      
      localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries))
    } catch (error) {
      console.error('Error saving entry to localStorage:', error)
    }
  }

  deleteEntry(id: string): void {
    if (typeof window === 'undefined') return
    
    try {
      const entries = this.getEntries()
      const filteredEntries = entries.filter(e => e.id !== id)
      localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(filteredEntries))
    } catch (error) {
      console.error('Error deleting entry from localStorage:', error)
    }
  }

  getEntriesByDateRange(startDate: Date, endDate: Date): JournalEntry[] {
    const entries = this.getEntries()
    return entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= startDate && entryDate <= endDate
    })
  }

  // Weekly Summaries
  getSummaries(): WeeklySummary[] {
    if (typeof window === 'undefined') return []
    
    try {
      const summaries = localStorage.getItem(STORAGE_KEYS.SUMMARIES)
      return summaries ? JSON.parse(summaries) : []
    } catch (error) {
      console.error('Error reading summaries from localStorage:', error)
      return []
    }
  }

  saveSummary(summary: WeeklySummary): void {
    if (typeof window === 'undefined') return
    
    try {
      const summaries = this.getSummaries()
      const existingIndex = summaries.findIndex(s => s.id === summary.id)
      
      if (existingIndex >= 0) {
        summaries[existingIndex] = summary
      } else {
        summaries.push(summary)
      }
      
      localStorage.setItem(STORAGE_KEYS.SUMMARIES, JSON.stringify(summaries))
    } catch (error) {
      console.error('Error saving summary to localStorage:', error)
    }
  }

  // Entry Summaries
  getEntrySummaries(): EntrySummary[] {
    if (typeof window === 'undefined') return []
    
    try {
      const entrySummaries = localStorage.getItem(STORAGE_KEYS.ENTRY_SUMMARIES)
      return entrySummaries ? JSON.parse(entrySummaries) : []
    } catch (error) {
      console.error('Error reading entry summaries from localStorage:', error)
      return []
    }
  }

  saveEntrySummary(entrySummary: EntrySummary): void {
    if (typeof window === 'undefined') return
    
    try {
      const entrySummaries = this.getEntrySummaries()
      const existingIndex = entrySummaries.findIndex(s => s.id === entrySummary.id)
      
      if (existingIndex >= 0) {
        entrySummaries[existingIndex] = entrySummary
      } else {
        entrySummaries.push(entrySummary)
      }
      
      localStorage.setItem(STORAGE_KEYS.ENTRY_SUMMARIES, JSON.stringify(entrySummaries))
    } catch (error) {
      console.error('Error saving entry summary to localStorage:', error)
    }
  }

  // User Data
  getUser(): User | null {
    if (typeof window === 'undefined') return null
    
    try {
      const user = localStorage.getItem(STORAGE_KEYS.USER)
      return user ? JSON.parse(user) : null
    } catch (error) {
      console.error('Error reading user data from localStorage:', error)
      return null
    }
  }

  saveUser(user: User): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
    } catch (error) {
      console.error('Error saving user data to localStorage:', error)
    }
  }

  // Theme
  getTheme(): 'light' | 'dark' | 'system' {
    if (typeof window === 'undefined') return 'system'
    
    try {
      const theme = localStorage.getItem(STORAGE_KEYS.THEME)
      return (theme as 'light' | 'dark' | 'system') || 'system'
    } catch (error) {
      console.error('Error reading theme from localStorage:', error)
      return 'system'
    }
  }

  saveTheme(theme: 'light' | 'dark' | 'system'): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme)
    } catch (error) {
      console.error('Error saving theme to localStorage:', error)
    }
  }

  // Clear all data
  clearAll(): void {
    if (typeof window === 'undefined') return
    
    try {
      const keys = ['journal-entries', 'weekly-summaries', 'user-data', 'theme-preference']
      keys.forEach(key => {
        localStorage.removeItem(key)
      })
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }
}

export const storageService = new LocalStorageService()