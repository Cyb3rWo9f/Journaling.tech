'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback, useState, useRef } from 'react'
import { JournalEntry, WeeklySummary, EntrySummary, EntryHoldStatus } from '@/types'
import { storageService } from '@/services/storage'
import { firebaseJournalService } from '@/services/firebase'
import { useAuth } from '@/context/AuthContext'
import { aiService } from '@/services/ai'
import { generateId, getWeekRange } from '@/utils'

interface JournalState {
  entries: JournalEntry[]
  summaries: WeeklySummary[]
  entrySummaries: EntrySummary[]
  entryHoldStatuses: EntryHoldStatus[]
  currentEntry: JournalEntry | null
  isLoading: boolean
  isLoadingInBackground: boolean // New state for background fetching
  error: string | null
}

type JournalAction =
  | { type: 'SET_ENTRIES'; payload: JournalEntry[] }
  | { type: 'SET_SUMMARIES'; payload: WeeklySummary[] }
  | { type: 'SET_ENTRY_SUMMARIES'; payload: EntrySummary[] }
  | { type: 'SET_HOLD_STATUSES'; payload: EntryHoldStatus[] }
  | { type: 'SET_CURRENT_ENTRY'; payload: JournalEntry | null }
  | { type: 'ADD_ENTRY'; payload: JournalEntry }
  | { type: 'UPDATE_ENTRY'; payload: JournalEntry }
  | { type: 'DELETE_ENTRY'; payload: string }
  | { type: 'ADD_SUMMARY'; payload: WeeklySummary }
  | { type: 'ADD_ENTRY_SUMMARY'; payload: EntrySummary }
  | { type: 'DELETE_ENTRY_SUMMARY'; payload: string } // entryId to delete summaries for
  | { type: 'ADD_HOLD_STATUS'; payload: EntryHoldStatus }
  | { type: 'REMOVE_HOLD_STATUS'; payload: string } // entryId
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_BACKGROUND_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

const initialState: JournalState = {
  entries: [],
  summaries: [],
  entrySummaries: [],
  entryHoldStatuses: [],
  currentEntry: null,
  isLoading: false,
  isLoadingInBackground: false,
  error: null,
}

function journalReducer(state: JournalState, action: JournalAction): JournalState {
  switch (action.type) {
    case 'SET_ENTRIES':
      return { ...state, entries: action.payload }
    case 'SET_SUMMARIES':
      return { ...state, summaries: action.payload }
    case 'SET_ENTRY_SUMMARIES':
      return { ...state, entrySummaries: action.payload }
    case 'SET_HOLD_STATUSES':
      return { ...state, entryHoldStatuses: action.payload }
    case 'SET_CURRENT_ENTRY':
      return { ...state, currentEntry: action.payload }
    case 'ADD_ENTRY':
      return { ...state, entries: [...state.entries, action.payload] }
    case 'UPDATE_ENTRY':
      return {
        ...state,
        entries: state.entries.map(entry =>
          entry.id === action.payload.id ? action.payload : entry
        ),
        currentEntry: state.currentEntry?.id === action.payload.id ? action.payload : state.currentEntry
      }
    case 'DELETE_ENTRY':
      return {
        ...state,
        entries: state.entries.filter(entry => entry.id !== action.payload),
        currentEntry: state.currentEntry?.id === action.payload ? null : state.currentEntry
      }
    case 'ADD_SUMMARY':
      return { ...state, summaries: [...state.summaries, action.payload] }
    case 'ADD_ENTRY_SUMMARY':
      return { ...state, entrySummaries: [...state.entrySummaries, action.payload] }
    case 'DELETE_ENTRY_SUMMARY':
      return { 
        ...state, 
        entrySummaries: state.entrySummaries.filter(summary => summary.entryId !== action.payload) 
      }
    case 'ADD_HOLD_STATUS':
      return { 
        ...state, 
        entryHoldStatuses: [...state.entryHoldStatuses.filter(h => h.entryId !== action.payload.entryId), action.payload]
      }
    case 'REMOVE_HOLD_STATUS':
      return {
        ...state,
        entryHoldStatuses: state.entryHoldStatuses.filter(h => h.entryId !== action.payload)
      }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_BACKGROUND_LOADING':
      return { ...state, isLoadingInBackground: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    default:
      return state
  }
}

interface JournalContextType extends JournalState {
  createEntry: (title: string, content: string, mood?: JournalEntry['mood'], tags?: string[]) => Promise<JournalEntry>
  updateEntry: (entry: JournalEntry) => Promise<void>
  deleteEntry: (id: string) => Promise<void>
  loadEntries: () => Promise<void>
  loadSummaries: () => Promise<void>
  loadEntrySummaries: () => Promise<void>
  loadHoldStatuses: () => Promise<void>
  generateWeeklySummary: (weekStart: Date) => Promise<void>
  generateEntrySummary: (entryId: string) => Promise<void>
  retryHeldEntry: (entryId: string) => Promise<void>
  getEntriesForWeek: (date: Date) => JournalEntry[]
  autoSave: (entry: JournalEntry) => Promise<void>
}

const JournalContext = createContext<JournalContextType | undefined>(undefined)

export function JournalProvider({ children }: { children: React.ReactNode }) {
  const [state, baseDispatch] = useReducer(journalReducer, initialState)
  const { user } = useAuth()
  const [processedEntryIds, setProcessedEntryIds] = useState<Set<string>>(new Set())
  
  // Track if initial data has been loaded to prevent unnecessary auto-generation
  const hasLoadedInitialData = useRef(false)

  // Smart dispatch that automatically updates cache - SIMPLIFIED to avoid state closure issues
  const dispatch = useCallback((action: JournalAction) => {
    baseDispatch(action)
  }, [baseDispatch])

  // Load data on mount and when user changes
  useEffect(() => {
    if (user) {
      hasLoadedInitialData.current = false // Reset when user changes
      dispatch({ type: 'SET_LOADING', payload: true }) // Set loading before starting
      
      Promise.all([
        loadEntries(),
        loadSummaries(),
        loadEntrySummaries(),
        loadHoldStatuses()
      ]).then(() => {
        hasLoadedInitialData.current = true
        dispatch({ type: 'SET_LOADING', payload: false }) // Set loading false after ALL data loaded
        console.log('✅ All initial data loaded from Firebase')
      }).catch((error) => {
        console.error('Error loading initial data:', error)
        dispatch({ type: 'SET_LOADING', payload: false })
      })
    } else {
      // Clear state when user logs out
      hasLoadedInitialData.current = false
      dispatch({ type: 'SET_ENTRIES', payload: [] })
      dispatch({ type: 'SET_SUMMARIES', payload: [] })
      dispatch({ type: 'SET_ENTRY_SUMMARIES', payload: [] })
      dispatch({ type: 'SET_HOLD_STATUSES', payload: [] })
    }
  }, [user])

  // Cache management helpers
  const clearEntriesCache = useCallback(() => {
    if (!user) return
    const cacheKey = `journal_entries_${user.uid}`
    const cacheTimestampKey = `journal_entries_timestamp_${user.uid}`
    localStorage.removeItem(cacheKey)
    localStorage.removeItem(cacheTimestampKey)
    console.log('Entries cache cleared')
  }, [user])

  const updateEntriesCache = useCallback((entries: JournalEntry[]) => {
    if (!user) return
    const cacheKey = `journal_entries_${user.uid}`
    const cacheTimestampKey = `journal_entries_timestamp_${user.uid}`
    localStorage.setItem(cacheKey, JSON.stringify(entries))
    localStorage.setItem(cacheTimestampKey, Date.now().toString())
    console.log(`⚡ Entries cache updated with ${entries.length} entries`)
  }, [user])

  const loadEntries = useCallback(async () => {
    if (!user) return
    
    // Always try cache first - INSTANT loading
    const cacheKey = `journal_entries_${user.uid}`
    const cacheTimestampKey = `journal_entries_timestamp_${user.uid}`
    const cacheExpiry = 30 * 60 * 1000 // 30 minutes (longer cache)
    
    const cachedData = localStorage.getItem(cacheKey)
    const cacheTimestamp = localStorage.getItem(cacheTimestampKey)
    
    // Load from cache immediately if available
    if (cachedData) {
      console.log('⚡ Loading entries from cache instantly')
      const parsedData = JSON.parse(cachedData)
      dispatch({ type: 'SET_ENTRIES', payload: parsedData })
      
      // Check if cache is still fresh
      const isExpired = !cacheTimestamp || (Date.now() - parseInt(cacheTimestamp) > cacheExpiry)
      
      if (!isExpired) {
        console.log('✅ Cache is fresh, no need to fetch')
        return
      }
      
      // Cache is expired, fetch in background without loading state
      console.log('🔄 Cache expired, updating in background')
      fetchAndCacheEntries(false) // Background refresh - don't await
      return
    }
    
    // No cache available, fetch WITHOUT setting loading (initial load handles it)
    console.log('📡 No cache found, fetching entries from Firebase')
    await fetchAndCacheEntries(false) // Don't set loading - initial useEffect handles it
    
  }, [user])

  const fetchAndCacheEntries = useCallback(async (showBackgroundLoading: boolean = false) => {
    if (!user) return
    
    if (showBackgroundLoading) {
      dispatch({ type: 'SET_BACKGROUND_LOADING', payload: true })
    }
    dispatch({ type: 'SET_ERROR', payload: null })
    
    try {
      const entries = await firebaseJournalService.getEntries()
      
      // Cache the data
      const cacheKey = `journal_entries_${user.uid}`
      const cacheTimestampKey = `journal_entries_timestamp_${user.uid}`
      localStorage.setItem(cacheKey, JSON.stringify(entries))
      localStorage.setItem(cacheTimestampKey, Date.now().toString())
      
      dispatch({ type: 'SET_ENTRIES', payload: entries })
      console.log('Entries cached successfully')
      
    } catch (error) {
      // Fallback to localStorage if Firebase fails
      try {
        const localEntries = storageService.getEntries()
        dispatch({ type: 'SET_ENTRIES', payload: localEntries })
      } catch (localError) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load journal entries' })
      }
    } finally {
      if (showBackgroundLoading) {
        dispatch({ type: 'SET_BACKGROUND_LOADING', payload: false })
      }
    }
  }, [user])

  const loadSummaries = useCallback(async () => {
    if (!user) return
    
    try {
      // Try to load summaries from cache first
      const cacheKey = `journal_summaries_${user.uid}`
      const cacheTimestampKey = `journal_summaries_timestamp_${user.uid}`
      const cacheExpiry = 10 * 60 * 1000 // 10 minutes (longer for summaries)
      
      const cachedData = localStorage.getItem(cacheKey)
      const cacheTimestamp = localStorage.getItem(cacheTimestampKey)
      
      if (cachedData && cacheTimestamp) {
        const isExpired = Date.now() - parseInt(cacheTimestamp) > cacheExpiry
        
        if (!isExpired) {
          console.log('Loading summaries from cache')
          const parsedData = JSON.parse(cachedData)
          dispatch({ type: 'SET_SUMMARIES', payload: parsedData })
          return
        }
      }
      
      // Fetch from server if no valid cache
      const summaries = await firebaseJournalService.getSummaries()
      
      // Cache the summaries
      localStorage.setItem(cacheKey, JSON.stringify(summaries))
      localStorage.setItem(cacheTimestampKey, Date.now().toString())
      
      dispatch({ type: 'SET_SUMMARIES', payload: summaries })
      console.log('Summaries cached successfully')
      
    } catch (error) {
      // Fallback to localStorage if Firebase fails
      try {
        const localSummaries = storageService.getSummaries()
        dispatch({ type: 'SET_SUMMARIES', payload: localSummaries })
      } catch (localError) {
        console.error('Failed to load summaries:', localError)
      }
    }
  }, [user])

  const loadEntrySummaries = useCallback(async () => {
    if (!user) return
    
    // Cache keys for entry summaries
    const cacheKey = `entry_summaries_${user.uid}`
    const cacheTimestampKey = `entry_summaries_timestamp_${user.uid}`
    const cacheExpiry = 30 * 60 * 1000 // 30 minutes
    
    const cachedData = localStorage.getItem(cacheKey)
    const cacheTimestamp = localStorage.getItem(cacheTimestampKey)
    
    // Load from cache immediately if available
    if (cachedData) {
      console.log('⚡ Loading entry summaries from cache instantly')
      const parsedData = JSON.parse(cachedData)
      dispatch({ type: 'SET_ENTRY_SUMMARIES', payload: parsedData })
      
      // Check if cache is still fresh
      const isExpired = !cacheTimestamp || (Date.now() - parseInt(cacheTimestamp) > cacheExpiry)
      
      if (!isExpired) {
        console.log('✅ Entry summaries cache is fresh, no need to fetch')
        return
      }
      
      // Cache is expired, fetch in background
      console.log('🔄 Entry summaries cache expired, updating in background')
      fetchAndCacheEntrySummaries()
      return
    }
    
    // No cache available, fetch from Firebase
    console.log('📡 No entry summaries cache found, fetching from Firebase')
    await fetchAndCacheEntrySummaries()
  }, [user])
  
  const fetchAndCacheEntrySummaries = useCallback(async () => {
    if (!user) return
    
    try {
      console.log('📚 Fetching entry summaries from Firebase...')
      const summaries = await firebaseJournalService.getEntrySummaries()
      
      // Cache the data
      const cacheKey = `entry_summaries_${user.uid}`
      const cacheTimestampKey = `entry_summaries_timestamp_${user.uid}`
      localStorage.setItem(cacheKey, JSON.stringify(summaries))
      localStorage.setItem(cacheTimestampKey, Date.now().toString())
      
      dispatch({ type: 'SET_ENTRY_SUMMARIES', payload: summaries })
      console.log(`✅ Loaded and cached ${summaries.length} entry summaries`)
    } catch (error) {
      console.error('Error loading entry summaries:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load entry summaries' })
    }
  }, [user])

  const loadHoldStatuses = useCallback(async () => {
    if (!user) return
    
    try {
      console.log('⏸️ Loading hold statuses from Firebase...')
      const holdStatuses = await firebaseJournalService.getHoldStatuses()
      dispatch({ type: 'SET_HOLD_STATUSES', payload: holdStatuses })
      console.log(`✅ Loaded ${holdStatuses.length} hold statuses from Firebase`)
    } catch (error) {
      console.error('Error loading hold statuses:', error)
    }
  }, [user])

  const createEntry = useCallback(async (title: string, content: string, mood?: JournalEntry['mood'], tags?: string[]): Promise<JournalEntry> => {
    console.log('🔥 Creating new entry...')
    console.log('User authenticated:', !!user)
    console.log('Content length:', content.length)
    console.log('Tags:', tags)

    const now = new Date().toISOString()
    const date = now.split('T')[0] // YYYY-MM-DD format
    
    // Generate title from date if not provided
    const finalTitle = title.trim() || `Journal Entry - ${new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })}`

    const entryData = {
      title: finalTitle,
      content,
      date: now.split('T')[0], // YYYY-MM-DD format
      mood,
      tags: tags || [],
      createdAt: now,
      updatedAt: now,
    }

    try {
      // Try Firebase first
      if (user) {
        console.log('📤 Attempting Firebase save...')
        console.log('📊 Current entries count before save:', state.entries.length)
        const entry = await firebaseJournalService.createEntry(entryData)
        console.log('✅ Firebase save successful:', entry.id)
        dispatch({ type: 'ADD_ENTRY', payload: entry })
        console.log('📊 Entry added to state, new count should be:', state.entries.length + 1)
        return entry
      } else {
        console.log('📱 User not authenticated, using localStorage...')
        // Fallback to localStorage
        const entry: JournalEntry = {
          id: generateId(),
          ...entryData,
        }
        dispatch({ type: 'ADD_ENTRY', payload: entry })
        storageService.saveEntry(entry)
        console.log('✅ localStorage save successful:', entry.id)
        return entry
      }
    } catch (error) {
      console.error('❌ Firebase save failed, falling back to localStorage:', error)
      // Fallback to localStorage if Firebase fails
      const entry: JournalEntry = {
        id: generateId(),
        ...entryData,
      }
      dispatch({ type: 'ADD_ENTRY', payload: entry })
      storageService.saveEntry(entry)
      console.log('✅ localStorage fallback save successful:', entry.id)
      return entry
    }
  }, [user])

  const updateEntry = useCallback(async (entry: JournalEntry) => {
    console.log('📝 Updating entry...')
    console.log('Entry ID:', entry.id)
    console.log('User authenticated:', !!user)
    
    const updatedEntry = {
      ...entry,
      updatedAt: new Date().toISOString(),
    }

    try {
      // Try Firebase first
      if (user) {
        console.log('📤 Attempting Firebase update...')
        await firebaseJournalService.updateEntry(updatedEntry)
        console.log('✅ Firebase update successful')
        
        // Delete the old AI summary so it gets regenerated with updated content
        const existingSummary = state.entrySummaries.find(s => s.entryId === entry.id)
        if (existingSummary) {
          console.log('🗑️ Deleting old AI summary to regenerate with updated content...')
          try {
            await firebaseJournalService.deleteEntrySummary(entry.id)
            dispatch({ type: 'DELETE_ENTRY_SUMMARY', payload: entry.id })
            
            // Update localStorage cache
            const summariesCacheKey = `entry_summaries_${user.uid}`
            const cachedData = localStorage.getItem(summariesCacheKey)
            if (cachedData) {
              const summaries = JSON.parse(cachedData) as EntrySummary[]
              const updatedSummaries = summaries.filter(s => s.entryId !== entry.id)
              localStorage.setItem(summariesCacheKey, JSON.stringify(updatedSummaries))
              console.log('✅ Old AI summary deleted - will regenerate on Insights page')
            }
          } catch (summaryError) {
            console.error('Error deleting old summary:', summaryError)
          }
        }
      } else {
        console.log('📱 User not authenticated, using localStorage...')
        // Fallback to localStorage
        storageService.saveEntry(updatedEntry)
        console.log('✅ localStorage update successful')
      }
      dispatch({ type: 'UPDATE_ENTRY', payload: updatedEntry })
    } catch (error) {
      console.error('❌ Firebase update failed, falling back to localStorage:', error)
      // Fallback to localStorage if Firebase fails
      storageService.saveEntry(updatedEntry)
      dispatch({ type: 'UPDATE_ENTRY', payload: updatedEntry })
      console.log('✅ localStorage fallback update successful')
    }
  }, [user, state.entrySummaries])

  const deleteEntry = useCallback(async (id: string) => {
    try {
      // Try Firebase first
      if (user) {
        await firebaseJournalService.deleteEntry(id)
        // Also delete the corresponding AI summary
        try {
          await firebaseJournalService.deleteEntrySummary(id)
          console.log(`✅ Deleted AI summary for entry ${id}`)
        } catch (summaryError) {
          console.warn(`⚠️ Could not delete AI summary for entry ${id}:`, summaryError)
          // Continue with entry deletion even if summary deletion fails
        }
      } else {
        // Fallback to localStorage
        storageService.deleteEntry(id)
      }
      
      // Update state: remove entry and its summary
      dispatch({ type: 'DELETE_ENTRY', payload: id })
      dispatch({ type: 'DELETE_ENTRY_SUMMARY', payload: id })
      
      // CRITICAL: Update the cache to remove the deleted entry
      // This ensures the entry doesn't reappear on page refresh
      if (user) {
        const cacheKey = `journal_entries_${user.uid}`
        const cachedData = localStorage.getItem(cacheKey)
        if (cachedData) {
          const entries = JSON.parse(cachedData) as JournalEntry[]
          const updatedEntries = entries.filter(e => e.id !== id)
          localStorage.setItem(cacheKey, JSON.stringify(updatedEntries))
          localStorage.setItem(`journal_entries_timestamp_${user.uid}`, Date.now().toString())
          console.log(`🗑️ Cache updated: removed entry ${id}, ${updatedEntries.length} entries remaining`)
        }
        
        // Also clear the entry summaries cache
        const summariesCacheKey = `entry_summaries_${user.uid}`
        const summariesCache = localStorage.getItem(summariesCacheKey)
        if (summariesCache) {
          const summaries = JSON.parse(summariesCache) as EntrySummary[]
          const updatedSummaries = summaries.filter(s => s.entryId !== id)
          localStorage.setItem(summariesCacheKey, JSON.stringify(updatedSummaries))
          console.log(`🗑️ Summaries cache updated: removed summary for entry ${id}`)
        }
      }
      
    } catch (error) {
      console.error('Error deleting entry:', error)
      // Fallback to localStorage if Firebase fails
      storageService.deleteEntry(id)
      dispatch({ type: 'DELETE_ENTRY', payload: id })
      dispatch({ type: 'DELETE_ENTRY_SUMMARY', payload: id })
      throw error // Re-throw so the UI can handle it
    }
  }, [user])

  const autoSave = useCallback(async (entry: JournalEntry) => {
    const updatedEntry = {
      ...entry,
      updatedAt: new Date().toISOString(),
    }
    
    // Update state first for immediate UI response
    dispatch({ type: 'UPDATE_ENTRY', payload: updatedEntry })
    
    try {
      // Try Firebase first
      if (user) {
        await firebaseJournalService.updateEntry(updatedEntry)
      } else {
        // Fallback to localStorage
        storageService.saveEntry(updatedEntry)
      }
    } catch (error) {
      // Fallback to localStorage if Firebase fails
      storageService.saveEntry(updatedEntry)
    }
  }, [user])

  // Get entries for the last 7 days from a given date
  const getEntriesForLast7Days = useCallback((fromDate: Date): JournalEntry[] => {
    const end = new Date(fromDate)
    end.setHours(23, 59, 59, 999)
    
    const start = new Date(fromDate)
    start.setDate(start.getDate() - 6) // 7 days including today
    start.setHours(0, 0, 0, 0)
    
    // Use YYYY-MM-DD strings for comparison to avoid timezone issues
    const startDateStr = start.toISOString().split('T')[0]
    const endDateStr = end.toISOString().split('T')[0]
    
    const filtered = state.entries.filter(entry => {
      // Use entry.date (YYYY-MM-DD) directly, or fallback to createdAt
      const entryDateStr = entry.date || entry.createdAt.split('T')[0]
      return entryDateStr >= startDateStr && entryDateStr <= endDateStr
    })
    
    console.log(`📅 Entries for ${startDateStr} to ${endDateStr}: ${filtered.length}/${state.entries.length}`)
    return filtered
  }, [state.entries])

  // Keep the old function for backwards compatibility
  const getEntriesForWeek = useCallback((date: Date): JournalEntry[] => {
    return getEntriesForLast7Days(date)
  }, [getEntriesForLast7Days])

  const generateWeeklySummary = useCallback(async (weekStart: Date) => {
    if (!user) return
    
    // Don't set global loading state - let the component handle its own loading UI
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      // Get all entries not yet covered by a summary
      let weekEntries: JournalEntry[]
      let latestSummaryEndDate: Date | null = null
      
      if (state.summaries.length === 0) {
        // No summaries yet - use all entries
        weekEntries = [...state.entries]
      } else {
        // Get latest summary by weekEnd date
        const latestSummary = [...state.summaries].sort((a, b) => 
          new Date(b.weekEnd).getTime() - new Date(a.weekEnd).getTime()
        )[0]
        latestSummaryEndDate = new Date(latestSummary.weekEnd)
        
        // Get entries with dates AFTER the last summary's week end
        weekEntries = state.entries.filter(entry => {
          const entryDateStr = entry.date || entry.createdAt.split('T')[0]
          const summaryEndDateStr = latestSummaryEndDate!.toISOString().split('T')[0]
          return entryDateStr > summaryEndDateStr
        })
      }
      
      // Sort entries by date for determining week range
      const sortedEntries = [...weekEntries].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )

      if (weekEntries.length === 0) {
        throw new Error('No journal entries found for this week')
      }

      // Calculate date range from entries
      const start = new Date(sortedEntries[0].createdAt)
      start.setHours(0, 0, 0, 0)
      const end = new Date(sortedEntries[sortedEntries.length - 1].createdAt)
      end.setHours(23, 59, 59, 999)
      
      // Check if a summary already exists for this exact date range (prevent duplicates)
      const existingSummaryForRange = state.summaries.find(summary => {
        const summaryStart = new Date(summary.weekStart).toISOString().split('T')[0]
        const summaryEnd = new Date(summary.weekEnd).toISOString().split('T')[0]
        const newStart = start.toISOString().split('T')[0]
        const newEnd = end.toISOString().split('T')[0]
        return summaryStart === newStart && summaryEnd === newEnd
      })
      
      if (existingSummaryForRange) {
        console.log('⚠️ Weekly summary already exists for this date range, skipping')
        return
      }

      console.log(`🤖 Generating AI insights for ${weekEntries.length} entries from ${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}...`)
      const analysis = await aiService.analyzeWeeklyEntries(weekEntries)

      // Check if analysis failed
      if (!analysis) {
        const errorMessage = aiService.lastError || 'Failed to generate weekly summary'
        throw new Error(errorMessage)
      }

      const summaryData: Omit<WeeklySummary, 'id'> = {
        weekStart: start.toISOString(),
        weekEnd: end.toISOString(),
        entriesAnalyzed: weekEntries.length,
        themes: analysis.themes || [],
        emotionalPatterns: analysis.emotionalPatterns || [],
        achievements: analysis.achievements || [],
        improvements: analysis.improvements || [],
        suggestions: analysis.suggestions || [],
        motivationalInsight: analysis.motivationalInsight || '',
        actionSteps: analysis.actionSteps || [],
        createdAt: new Date().toISOString(),
      }

      // Save to Firebase
      const savedSummary = await firebaseJournalService.createSummary(summaryData)
      console.log('✅ Weekly summary saved to Firebase:', savedSummary.id)

      dispatch({ type: 'ADD_SUMMARY', payload: savedSummary })
      
      // Clear summaries cache so it reloads fresh
      const cacheKey = `journal_summaries_${user.uid}`
      localStorage.removeItem(cacheKey)
      
    } catch (error) {
      console.error('❌ Error generating weekly summary:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate weekly summary'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      throw error // Re-throw so the component can handle it
    }
  }, [user, state.entries, state.summaries])

  const generateEntrySummary = useCallback(async (entryId: string) => {
    const entry = state.entries.find(e => e.id === entryId)
    if (!entry) {
      console.error('Entry not found for summary generation:', entryId)
      return
    }

    // Check if summary already exists for this entry
    const existingSummary = state.entrySummaries.find(s => s.entryId === entryId)
    if (existingSummary) {
      console.log('Summary already exists for entry:', entryId)
      return
    }

    // Check if entry is on hold - get current retry count
    const existingHoldStatus = state.entryHoldStatuses.find(h => h.entryId === entryId)
    const currentRetryCount = existingHoldStatus?.retryCount || 0

    // Don't set global loading state - this runs in background
    dispatch({ type: 'SET_ERROR', payload: null })

    console.log('🤖 Generating AI summary for entry:', entry.title)
    const analysis = await aiService.analyzeIndividualEntry(entry)

    // Check if analysis failed (returns null on error)
    if (!analysis) {
      const errorMessage = aiService.lastError || 'Failed to generate entry summary'
      console.error('❌ Error generating entry summary:', errorMessage)
      
      // Determine error type for hold status
      let reason: 'api_error' | 'rate_limit' | 'timeout' | 'invalid_response' | 'unknown' = 'unknown'
      let errorCode: string = ''
      
      // Extract status code from error message (e.g., "API error: 401 - Unauthorized")
      const statusMatch = errorMessage.match(/(\d{3})/)
      if (statusMatch) {
        errorCode = statusMatch[1]
      }
      
      if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('rate limit')) {
        reason = 'rate_limit'
        errorCode = errorCode || '429'
      } else if (errorMessage.toLowerCase().includes('timeout')) {
        reason = 'timeout'
      } else if (errorMessage.includes('401') || errorMessage.toLowerCase().includes('unauthorized')) {
        reason = 'api_error'
        errorCode = errorCode || '401'
      } else if (errorMessage.includes('API') || errorMessage.includes('fetch') || errorMessage.includes('network')) {
        reason = 'api_error'
      } else if (errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('parse')) {
        reason = 'invalid_response'
      }
      
      // Create hold status - only include errorCode if it has a value (Firebase doesn't accept undefined)
      const holdStatus: EntryHoldStatus = {
        id: existingHoldStatus?.id || generateId(),
        entryId: entryId,
        reason: reason,
        errorMessage: errorMessage,
        ...(errorCode && { errorCode }), // Only include if not empty
        retryCount: currentRetryCount + 1,
        lastAttempt: new Date().toISOString(),
        createdAt: existingHoldStatus?.createdAt || new Date().toISOString(),
      }
      
      // Save to Firebase
      try {
        await firebaseJournalService.createOrUpdateHoldStatus(holdStatus)
        console.log('⏸️ Entry placed on hold:', entryId, 'Reason:', reason)
      } catch (saveError) {
        console.error('Error saving hold status:', saveError)
      }
      
      dispatch({ type: 'ADD_HOLD_STATUS', payload: holdStatus })
      return // Exit early - don't continue to success path
    }

    // Success - create entry summary
    const entrySummary: EntrySummary = {
      id: generateId(),
      entryId: entry.id,
      keyThemes: analysis.keyThemes || [],
      emotionalInsights: analysis.emotionalInsights || [],
      personalGrowth: analysis.personalGrowth || [],
      patterns: analysis.patterns || [],
      suggestions: analysis.suggestions || [],
      motivationalNote: analysis.motivationalNote || '',
      reflection: analysis.reflection || '',
      createdAt: new Date().toISOString(),
    }

    // Save to Firebase first
    try {
      await firebaseJournalService.createEntrySummary(entrySummary)
      console.log('💾 Entry summary saved to Firebase:', entrySummary.id)
      
      // Update localStorage cache with new summary
      if (user) {
        const cacheKey = `entry_summaries_${user.uid}`
        const cachedData = localStorage.getItem(cacheKey)
        if (cachedData) {
          const summaries = JSON.parse(cachedData) as EntrySummary[]
          summaries.push(entrySummary)
          localStorage.setItem(cacheKey, JSON.stringify(summaries))
          localStorage.setItem(`entry_summaries_timestamp_${user.uid}`, Date.now().toString())
          console.log('💾 Entry summary added to cache')
        }
      }
      
      // Remove hold status if it exists (successful generation)
      if (existingHoldStatus) {
        await firebaseJournalService.removeHoldStatus(entryId)
        dispatch({ type: 'REMOVE_HOLD_STATUS', payload: entryId })
        console.log('✅ Removed hold status for entry:', entryId)
      }
    } catch (error) {
      console.error('Error saving entry summary to Firebase:', error)
      // Continue with local state update even if Firebase save fails
    }

    dispatch({ type: 'ADD_ENTRY_SUMMARY', payload: entrySummary })
    console.log('✅ Entry summary generated successfully:', entrySummary.id)
  }, [state.entries, state.entrySummaries, state.entryHoldStatuses])

  // Retry a held entry
  const retryHeldEntry = useCallback(async (entryId: string) => {
    console.log('🔄 Retrying held entry:', entryId)
    await generateEntrySummary(entryId)
  }, [generateEntrySummary])

  // Check for completed weeks and auto-generate summaries
  const checkAndGenerateWeeklySummaries = useCallback(async () => {
    const now = new Date()
    const currentWeek = getWeekRange(now)
    
    // TEST MODE: For testing purposes, use current week if it has 2+ entries
    // Change this back to the loop below for production
    const testMode = false // Set to false for production - DISABLED to prevent unnecessary AI requests
    
    if (testMode) {
      const weekEntries = getEntriesForWeek(now)
      const existingSummary = state.summaries.find(s => 
        new Date(s.weekStart).getTime() === currentWeek.start.getTime()
      )
      
      // Generate summary if we have 2+ entries and no existing summary (for testing)
      if (weekEntries.length >= 2 && !existingSummary) {
        console.log(`🧪 TEST MODE: Generating AI summary for current week with ${weekEntries.length} entries`)
        await generateWeeklySummary(currentWeek.start)
        return
      }
    }
    
    // PRODUCTION MODE: Look back 4 weeks to check for completed weeks
    for (let weeksBack = 1; weeksBack <= 4; weeksBack++) {
      const checkDate = new Date(now)
      checkDate.setDate(checkDate.getDate() - (weeksBack * 7))
      
      const weekRange = getWeekRange(checkDate)
      const weekEntries = getEntriesForWeek(checkDate)
      
      // Check if this week has 7 days of entries and no existing summary
      const hasSevenDays = checkSevenDaysOfEntries(weekEntries, weekRange)
      const existingSummary = state.summaries.find(s => 
        new Date(s.weekStart).getTime() === weekRange.start.getTime()
      )
      
      if (hasSevenDays && !existingSummary) {
        console.log(`Generating AI summary for week starting ${weekRange.start.toDateString()}`)
        await generateWeeklySummary(weekRange.start)
      }
    }
  }, [state.summaries, getEntriesForWeek, generateWeeklySummary])

  // Helper function to check if a week has entries for 7 different days
  const checkSevenDaysOfEntries = (entries: JournalEntry[], weekRange: { start: Date; end: Date }) => {
    if (entries.length < 7) return false
    
    const uniqueDays = new Set()
    entries.forEach(entry => {
      const entryDate = new Date(entry.date)
      if (entryDate >= weekRange.start && entryDate <= weekRange.end) {
        uniqueDays.add(entryDate.toDateString())
      }
    })
    
    return uniqueDays.size >= 7
  }

  // Check for completed weeks whenever entries change - DISABLED to prevent unnecessary AI requests
  useEffect(() => {
    // Disabled automatic weekly summary generation to prevent unnecessary AI requests
    // Enable this only if you want automatic weekly summaries
    // if (state.entries.length > 0 && state.summaries.length >= 0) {
    //   checkAndGenerateWeeklySummaries()
    // }
    console.log('📊 Weekly summary auto-generation is disabled to prevent unnecessary AI requests')
  }, [state.entries.length, checkAndGenerateWeeklySummaries])

  // Update cache whenever entries change (to keep cache in sync)
  useEffect(() => {
    if (user && state.entries.length > 0) {
      updateEntriesCache(state.entries)
    }
  }, [user, state.entries, updateEntriesCache])

  // Auto-generate entry summaries is DISABLED here
  // AI insights will be generated on the Insights page for better UX
  useEffect(() => {
    console.log('📊 Auto AI summary generation disabled - will generate on Insights page')
  }, [state.entries.length])

  const contextValue: JournalContextType = {
    ...state,
    createEntry,
    updateEntry,
    deleteEntry,
    loadEntries,
    loadSummaries,
    loadEntrySummaries,
    loadHoldStatuses,
    generateWeeklySummary,
    generateEntrySummary,
    retryHeldEntry,
    getEntriesForWeek,
    autoSave,
  }

  return (
    <JournalContext.Provider value={contextValue}>
      {children}
    </JournalContext.Provider>
  )
}

export function useJournal() {
  const context = useContext(JournalContext)
  if (context === undefined) {
    throw new Error('useJournal must be used within a JournalProvider')
  }
  return context
}