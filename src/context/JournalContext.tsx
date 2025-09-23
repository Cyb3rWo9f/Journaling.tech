'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback, useState, useRef } from 'react'
import { JournalEntry, WeeklySummary, EntrySummary } from '@/types'
import { storageService } from '@/services/storage'
import { firebaseJournalService } from '@/services/firebase'
import { useAuth } from '@/context/AuthContext'
import { aiService } from '@/services/openai'
import { generateId, getWeekRange } from '@/utils'

interface JournalState {
  entries: JournalEntry[]
  summaries: WeeklySummary[]
  entrySummaries: EntrySummary[]
  currentEntry: JournalEntry | null
  isLoading: boolean
  isLoadingInBackground: boolean // New state for background fetching
  error: string | null
}

type JournalAction =
  | { type: 'SET_ENTRIES'; payload: JournalEntry[] }
  | { type: 'SET_SUMMARIES'; payload: WeeklySummary[] }
  | { type: 'SET_ENTRY_SUMMARIES'; payload: EntrySummary[] }
  | { type: 'SET_CURRENT_ENTRY'; payload: JournalEntry | null }
  | { type: 'ADD_ENTRY'; payload: JournalEntry }
  | { type: 'UPDATE_ENTRY'; payload: JournalEntry }
  | { type: 'DELETE_ENTRY'; payload: string }
  | { type: 'ADD_SUMMARY'; payload: WeeklySummary }
  | { type: 'ADD_ENTRY_SUMMARY'; payload: EntrySummary }
  | { type: 'DELETE_ENTRY_SUMMARY'; payload: string } // entryId to delete summaries for
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_BACKGROUND_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

const initialState: JournalState = {
  entries: [],
  summaries: [],
  entrySummaries: [],
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
  generateWeeklySummary: (weekStart: Date) => Promise<void>
  generateEntrySummary: (entryId: string) => Promise<void>
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
      Promise.all([
        loadEntries(),
        loadSummaries(),
        loadEntrySummaries()
      ]).then(() => {
        hasLoadedInitialData.current = true
        console.log('✅ All initial data loaded from Firebase')
      })
    } else {
      // Clear state when user logs out
      hasLoadedInitialData.current = false
      dispatch({ type: 'SET_ENTRIES', payload: [] })
      dispatch({ type: 'SET_SUMMARIES', payload: [] })
      dispatch({ type: 'SET_ENTRY_SUMMARIES', payload: [] })
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
      fetchAndCacheEntries(false)
      return
    }
    
    // No cache available, show loading and fetch
    console.log('📡 No cache found, fetching with loading state')
    await fetchAndCacheEntries(true)
    
  }, [user])

  const fetchAndCacheEntries = useCallback(async (showLoading: boolean = true) => {
    if (!user) return
    
    if (showLoading) {
      dispatch({ type: 'SET_LOADING', payload: true })
    } else {
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
      if (showLoading) {
        dispatch({ type: 'SET_LOADING', payload: false })
      } else {
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
    
    try {
      console.log('📚 Loading entry summaries from Firebase...')
      const summaries = await firebaseJournalService.getEntrySummaries()
      dispatch({ type: 'SET_ENTRY_SUMMARIES', payload: summaries })
      console.log(`✅ Loaded ${summaries.length} entry summaries from Firebase`)
    } catch (error) {
      console.error('Error loading entry summaries:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load entry summaries' })
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
  }, [user])

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
      
    } catch (error) {
      console.error('Error deleting entry:', error)
      // Fallback to localStorage if Firebase fails
      storageService.deleteEntry(id)
      dispatch({ type: 'DELETE_ENTRY', payload: id })
      dispatch({ type: 'DELETE_ENTRY_SUMMARY', payload: id })
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

  const getEntriesForWeek = useCallback((date: Date): JournalEntry[] => {
    const { start, end } = getWeekRange(date)
    return storageService.getEntriesByDateRange(start, end)
  }, [])

  const generateWeeklySummary = useCallback(async (weekStart: Date) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      const { start, end } = getWeekRange(weekStart)
      const weekEntries = getEntriesForWeek(weekStart)

      if (weekEntries.length === 0) {
        throw new Error('No journal entries found for this week')
      }

      const analysis = await aiService.analyzeWeeklyEntries(weekEntries)

      const summary: WeeklySummary = {
        id: generateId(),
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

      dispatch({ type: 'ADD_SUMMARY', payload: summary })
      storageService.saveSummary(summary)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate weekly summary'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [getEntriesForWeek])

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

    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      console.log('🤖 Generating AI summary for entry:', entry.title)
      const analysis = await aiService.analyzeIndividualEntry(entry)

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
      } catch (error) {
        console.error('Error saving entry summary to Firebase:', error)
        // Continue with local state update even if Firebase save fails
      }

      dispatch({ type: 'ADD_ENTRY_SUMMARY', payload: entrySummary })
      console.log('✅ Entry summary generated successfully:', entrySummary.id)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate entry summary'
      console.error('Error generating entry summary:', errorMessage)
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.entries, state.entrySummaries])

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

  // Auto-generate entry summaries for new entries (throttled)
  useEffect(() => {
    // Only run after initial data has been loaded to avoid processing existing entries
    if (!hasLoadedInitialData.current) {
      console.log('⏳ Waiting for initial data to load before processing summaries')
      return
    }
    
    // Wait for both entries and summaries to be loaded before processing
    if (state.entries.length === 0) return
    
    // Only process the 3 most recent entries without summaries to avoid overwhelming
    const entriesWithoutSummaries = state.entries
      .filter(entry => {
        const hasSummary = state.entrySummaries.some(s => s.entryId === entry.id)
        const alreadyProcessed = processedEntryIds.has(entry.id)
        
        // Check if the existing summary is a default/placeholder summary
        const existingSummary = state.entrySummaries.find(s => s.entryId === entry.id)
        const isDefaultSummary = existingSummary && (
          existingSummary.motivationalNote === "Your willingness to examine your inner world is a beautiful strength." ||
          (existingSummary.keyThemes.length === 2 && 
           existingSummary.keyThemes.includes("Self-Reflection") && 
           existingSummary.keyThemes.includes("Personal Experience")) ||
          existingSummary.motivationalNote.includes("beautiful strength")
        )
        
        // Debug logging to understand what's happening
        if (hasSummary && !isDefaultSummary) {
          console.log(`⏭️ Skipping entry ${entry.id} - already has AI summary`)
        } else if (hasSummary && isDefaultSummary) {
          console.log(`🔄 Entry ${entry.id} has default summary, will regenerate with AI`)
        }
        if (alreadyProcessed) {
          console.log(`⏭️ Skipping entry ${entry.id} - already processed`)
        }
        
        // Allow processing if no summary, or if summary is a default/placeholder
        return (!hasSummary || isDefaultSummary) && !alreadyProcessed
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3) // Limit to 3 most recent entries
    
    if (entriesWithoutSummaries.length > 0) {
      console.log(`🤖 Processing ${entriesWithoutSummaries.length} entries for AI summaries:`, 
        entriesWithoutSummaries.map(e => ({ id: e.id, title: e.title })))
      
      // Mark entries as being processed to prevent duplicates
      const newProcessedIds = new Set(processedEntryIds)
      entriesWithoutSummaries.forEach(entry => {
        newProcessedIds.add(entry.id)
      })
      setProcessedEntryIds(newProcessedIds)
      
      // Process one entry every 5 seconds to avoid API rate limits
      entriesWithoutSummaries.forEach((entry, index) => {
        setTimeout(() => {
          generateEntrySummary(entry.id)
        }, index * 5000) // 5 second intervals
      })
    } else {
      console.log('✅ No entries need AI summary generation')
    }
  }, [state.entries, state.entrySummaries, processedEntryIds]) // More specific dependencies

  const contextValue: JournalContextType = {
    ...state,
    createEntry,
    updateEntry,
    deleteEntry,
    loadEntries,
    loadSummaries,
    loadEntrySummaries,
    generateWeeklySummary,
    generateEntrySummary,
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