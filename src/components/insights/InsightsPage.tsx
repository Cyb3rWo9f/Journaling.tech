'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/router'
import { 
  Calendar, Heart, Sparkles, Eye, PenSquare, ChevronDown, ChevronUp, TrendingUp, Zap, Star,
  Smile, Laugh, Flame, Lightbulb, Sun, ThumbsUp, Target, Coffee, Battery, Meh,
  AlertCircle, Cloud, Music, Frown, Angry, CloudRain, BookOpen, Clock, Tag, Brain, Award, ArrowRight, RefreshCw, CheckCircle, PauseCircle
} from 'lucide-react'
import { useJournal } from '@/context/JournalContext'
import { JournalEntry, WeeklySummary, EntrySummary, EntryHoldStatus } from '@/types'

// Mood configuration with icons and colors
const moodConfig: { [key: string]: { icon: React.ElementType, color: string, bgColor: string } } = {
  happy: { icon: Smile, color: 'text-green-500', bgColor: 'bg-green-500' },
  joyful: { icon: Laugh, color: 'text-emerald-500', bgColor: 'bg-emerald-500' },
  grateful: { icon: Heart, color: 'text-pink-500', bgColor: 'bg-pink-500' },
  excited: { icon: Zap, color: 'text-yellow-500', bgColor: 'bg-yellow-500' },
  energetic: { icon: Flame, color: 'text-orange-500', bgColor: 'bg-orange-500' },
  inspired: { icon: Lightbulb, color: 'text-purple-500', bgColor: 'bg-purple-500' },
  peaceful: { icon: Sun, color: 'text-blue-400', bgColor: 'bg-blue-400' },
  content: { icon: ThumbsUp, color: 'text-teal-500', bgColor: 'bg-teal-500' },
  motivated: { icon: Target, color: 'text-indigo-500', bgColor: 'bg-indigo-500' },
  relaxed: { icon: Coffee, color: 'text-amber-600', bgColor: 'bg-amber-600' },
  creative: { icon: Sparkles, color: 'text-violet-500', bgColor: 'bg-violet-500' },
  focused: { icon: Battery, color: 'text-cyan-500', bgColor: 'bg-cyan-500' },
  neutral: { icon: Meh, color: 'text-gray-500', bgColor: 'bg-gray-500' },
  tired: { icon: Battery, color: 'text-gray-400', bgColor: 'bg-gray-400' },
  stressed: { icon: AlertCircle, color: 'text-orange-600', bgColor: 'bg-orange-600' },
  anxious: { icon: Cloud, color: 'text-yellow-600', bgColor: 'bg-yellow-600' },
  melancholy: { icon: Music, color: 'text-slate-500', bgColor: 'bg-slate-500' },
  sad: { icon: Frown, color: 'text-blue-600', bgColor: 'bg-blue-600' },
  frustrated: { icon: Angry, color: 'text-red-500', bgColor: 'bg-red-500' },
  overwhelmed: { icon: CloudRain, color: 'text-gray-600', bgColor: 'bg-gray-600' },
}

// Timeline item type
type TimelineItem = 
  | { type: 'entry'; entry: JournalEntry; summary?: EntrySummary; date: Date }
  | { type: 'weekly'; summary: WeeklySummary; date: Date }

export function InsightsPage() {
  const { entries, entrySummaries, summaries, entryHoldStatuses, isLoading, generateEntrySummary, generateWeeklySummary, retryHeldEntry } = useJournal()
  const router = useRouter()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [generatingWeekly, setGeneratingWeekly] = useState(false)
  const [expandedWeeklyId, setExpandedWeeklyId] = useState<string | null>(null)
  const [weeklyActiveTab, setWeeklyActiveTab] = useState<{ [key: string]: 'overview' | 'patterns' | 'actions' }>({})
  const [autoGeneratingIds, setAutoGeneratingIds] = useState<Set<string>>(new Set())
  const [highlightedEntryId, setHighlightedEntryId] = useState<string | null>(null)
  const [retryingId, setRetryingId] = useState<string | null>(null)
  const processedAutoGenRef = useRef<Set<string>>(new Set())

  const getWeeklyActiveTab = (id: string) => weeklyActiveTab[id] || 'overview'
  const setWeeklyTab = (id: string, tab: 'overview' | 'patterns' | 'actions') => {
    setWeeklyActiveTab(prev => ({ ...prev, [id]: tab }))
  }

  // Handle URL highlight parameter for scrolling to specific entry insight
  useEffect(() => {
    const { highlight } = router.query
    if (highlight && typeof highlight === 'string') {
      setHighlightedEntryId(highlight)
      setExpandedId(highlight) // Auto-expand the entry
      
      // Scroll to the highlighted entry after a short delay
      setTimeout(() => {
        const element = document.getElementById(`insight-${highlight}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 500)
      
      // Clear highlight after 5 seconds
      const timer = setTimeout(() => {
        setHighlightedEntryId(null)
        // Remove highlight from URL
        router.replace('/insights', undefined, { shallow: true })
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [router.query])

  // Auto-generate AI summaries for entries without them (with delays)
  // Auto-generate AI summaries one at a time to avoid rate limits
  // This runs in the background and doesn't block page load
  useEffect(() => {
    // Don't run if still loading initial data
    if (isLoading) {
      console.log('⏳ Still loading data, waiting before auto-generating summaries...')
      return
    }
    
    console.log(`📊 Auto-generation check: ${entries.length} entries, ${entrySummaries.length} summaries loaded (from cache or Firebase)`)
    
    // Find the FIRST entry without a summary that hasn't been processed yet and is NOT on hold
    const entryWithoutSummary = entries
      .filter(entry => {
        const hasSummary = entrySummaries.some(s => s.entryId === entry.id)
        const alreadyProcessed = processedAutoGenRef.current.has(entry.id)
        const isOnHold = entryHoldStatuses.some(h => h.entryId === entry.id)
        if (hasSummary) {
          console.log(`✅ Entry "${entry.title}" (${entry.id.slice(0, 8)}...) already has summary - skipping`)
        }
        if (isOnHold) {
          console.log(`⏸️ Entry "${entry.title}" is on hold, skipping auto-generation`)
        }
        return !hasSummary && !alreadyProcessed && !isOnHold
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      [0] // Only take the first one

    if (!entryWithoutSummary) {
      console.log('📊 All entries have summaries or are on hold')
      return
    }

    console.log(`🤖 Auto-generating AI summary for: ${entryWithoutSummary.title}`)

    // Mark as being processed immediately to prevent duplicate requests
    processedAutoGenRef.current.add(entryWithoutSummary.id)
    
    // Start generating after a short delay
    const timeoutId = setTimeout(async () => {
      setAutoGeneratingIds(prev => new Set([...prev, entryWithoutSummary.id]))
      
      // Set a max timeout of 45 seconds
      const maxTimeoutId = setTimeout(() => {
        console.log(`⏱️ Timeout reached for entry ${entryWithoutSummary.id}`)
        setAutoGeneratingIds(prev => {
          const next = new Set(prev)
          next.delete(entryWithoutSummary.id)
          return next
        })
      }, 45000)
      
      try {
        await generateEntrySummary(entryWithoutSummary.id)
        console.log(`✅ Auto-generated summary for: ${entryWithoutSummary.title}`)
      } catch (error) {
        console.error(`❌ Failed to generate summary:`, error)
      } finally {
        clearTimeout(maxTimeoutId)
        setAutoGeneratingIds(prev => {
          const next = new Set(prev)
          next.delete(entryWithoutSummary.id)
          return next
        })
      }
    }, 1000) // 1 second initial delay
    
    return () => clearTimeout(timeoutId)
  }, [entries, entrySummaries, entryHoldStatuses, generateEntrySummary, isLoading])

  // Auto-generate weekly insight when conditions are met
  const weeklyAutoGenRef = useRef<boolean>(false)
  const lastGenerationAttemptRef = useRef<number>(0)
  
  useEffect(() => {
    // Don't run if still loading or already generating
    if (isLoading || generatingWeekly) return
    
    // Prevent duplicate generation within 30 seconds
    const now = Date.now()
    if (now - lastGenerationAttemptRef.current < 30000) {
      console.log('⏳ Skipping auto-generation - too soon since last attempt')
      return
    }
    
    // Prevent duplicate generation
    if (weeklyAutoGenRef.current) return
    
    // Check if we have 7 days of journaling and entries to process
    // We need to calculate this here since canGenerateWeekly is defined later
    if (entries.length === 0) return
    
    // Get unique dates from entries
    const uniqueDates = new Set<string>()
    entries.forEach(entry => {
      const dateStr = entry.date || entry.createdAt.split('T')[0]
      uniqueDates.add(dateStr)
    })
    
    let daysCount = 0
    let hasEntriesForWeekly = false
    let entriesForWeekly: typeof entries = []
    
    if (summaries.length === 0) {
      daysCount = Math.min(uniqueDates.size, 7)
      hasEntriesForWeekly = entries.length > 0
      entriesForWeekly = entries
    } else {
      const latestSummary = [...summaries].sort((a, b) => 
        new Date(b.weekEnd).getTime() - new Date(a.weekEnd).getTime()
      )[0]
      const summaryEndDateStr = new Date(latestSummary.weekEnd).toISOString().split('T')[0]
      
      let daysAfterSummary = 0
      uniqueDates.forEach(dateStr => {
        if (dateStr > summaryEndDateStr) {
          daysAfterSummary++
        }
      })
      daysCount = Math.min(daysAfterSummary, 7)
      entriesForWeekly = entries.filter(entry => {
        const entryDateStr = entry.date || entry.createdAt.split('T')[0]
        return entryDateStr > summaryEndDateStr
      })
      hasEntriesForWeekly = entriesForWeekly.length > 0
    }
    
    // Only auto-generate if we have 7 days AND entries to process
    if (daysCount >= 7 && hasEntriesForWeekly && entriesForWeekly.length > 0) {
      console.log('🤖 Auto-generating weekly insight (7 days reached)')
      weeklyAutoGenRef.current = true
      lastGenerationAttemptRef.current = now
      
      const timeoutId = setTimeout(async () => {
        setGeneratingWeekly(true)
        try {
          await generateWeeklySummary(new Date())
          console.log('✅ Auto-generated weekly insight')
        } catch (error) {
          console.error('❌ Failed to auto-generate weekly insight:', error)
          weeklyAutoGenRef.current = false // Allow retry on error
        } finally {
          setGeneratingWeekly(false)
        }
      }, 2000) // 2 second delay to ensure entry summaries are processed first
      
      return () => clearTimeout(timeoutId)
    }
  }, [entries, summaries, isLoading, generatingWeekly, generateWeeklySummary])

  // Create unified timeline items (entries + weekly summaries)
  const timelineItems = useMemo((): TimelineItem[] => {
    const items: TimelineItem[] = []
    
    // Add entries
    entries.forEach(entry => {
      items.push({
        type: 'entry',
        entry,
        summary: entrySummaries.find(s => s.entryId === entry.id),
        date: new Date(entry.createdAt)
      })
    })
    
    // Add weekly summaries - use weekEnd date for positioning
    // Weekly summaries should appear after entries from the same period
    summaries.forEach(summary => {
      items.push({
        type: 'weekly',
        summary,
        date: new Date(summary.weekEnd) // Position at end of the week it covers
      })
    })
    
    // Sort by date descending (newest first)
    // For same date, entries come before weekly summaries
    return items.sort((a, b) => {
      const dateDiff = b.date.getTime() - a.date.getTime()
      if (dateDiff !== 0) return dateDiff
      // If same date, entries come first (above weekly summaries)
      if (a.type === 'entry' && b.type === 'weekly') return -1
      if (a.type === 'weekly' && b.type === 'entry') return 1
      return 0
    })
  }, [entries, entrySummaries, summaries])

  // Weekly summaries sorted by date (newest first)
  const sortedWeeklySummaries = useMemo(() => {
    return [...summaries].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [summaries])

  // Group all timeline items by date (including weekly summaries)
  const groupedByDate = useMemo(() => {
    const groups: { [key: string]: TimelineItem[] } = {}
    timelineItems.forEach(item => {
      const date = item.date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
      if (!groups[date]) groups[date] = []
      groups[date].push(item)
    })
    return groups
  }, [timelineItems])

  // Get all entries (for weekly insight generation, we use all entries not covered by a summary)
  const entriesForWeeklyInsight = useMemo(() => {
    if (summaries.length === 0) {
      // No summaries yet - all entries are eligible
      return entries
    }
    
    // Get latest summary by weekEnd date (the end of the period it covers)
    const latestSummary = [...summaries].sort((a, b) => 
      new Date(b.weekEnd).getTime() - new Date(a.weekEnd).getTime()
    )[0]
    const summaryEndDate = new Date(latestSummary.weekEnd)
    const summaryEndDateStr = summaryEndDate.toISOString().split('T')[0]
    
    console.log('📊 Latest summary covers up to:', summaryEndDateStr)
    
    // Return entries with dates AFTER the last summary's week end
    return entries.filter(entry => {
      const entryDateStr = entry.date || entry.createdAt.split('T')[0]
      return entryDateStr > summaryEndDateStr
    })
  }, [entries, summaries])

  // Calculate days of journaling progress (count unique days with entries in current week)
  const daysOfJournaling = useMemo(() => {
    console.log('📊 Calculating daysOfJournaling:', { entriesCount: entries.length, summariesCount: summaries.length })
    
    if (entries.length === 0) {
      console.log('📊 No entries found')
      return 0
    }
    
    // Get unique dates from entries (regardless of time)
    const uniqueDates = new Set<string>()
    entries.forEach(entry => {
      const dateStr = entry.date || entry.createdAt.split('T')[0]
      uniqueDates.add(dateStr)
    })
    
    console.log('📊 Unique entry dates:', Array.from(uniqueDates).sort())
    
    if (summaries.length === 0) {
      // No weekly summary yet - count unique days with entries (up to 7)
      const daysCount = Math.min(uniqueDates.size, 7)
      console.log('📊 Days of journaling (unique dates):', daysCount)
      return daysCount
    }
    
    // Has previous summaries - count days with entries AFTER the last summary's weekEnd
    const latestSummary = [...summaries].sort((a, b) => 
      new Date(b.weekEnd).getTime() - new Date(a.weekEnd).getTime()
    )[0]
    const summaryEndDateStr = new Date(latestSummary.weekEnd).toISOString().split('T')[0]
    
    // Count unique dates after the last summary's week end
    let daysAfterSummary = 0
    uniqueDates.forEach(dateStr => {
      if (dateStr > summaryEndDateStr) {
        daysAfterSummary++
      }
    })
    
    console.log('📊 Summary weekEnd:', summaryEndDateStr, '| Days with entries after:', daysAfterSummary)
    return Math.min(daysAfterSummary, 7)
  }, [summaries, entries])

  // Check if a weekly summary was recently generated (within last 24 hours)
  const recentlyGeneratedSummary = useMemo(() => {
    if (summaries.length === 0) return null
    
    const latestSummary = [...summaries].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0]
    
    const now = new Date()
    const summaryDate = new Date(latestSummary.createdAt)
    const hoursSinceGenerated = (now.getTime() - summaryDate.getTime()) / (1000 * 60 * 60)
    
    // Consider "recently generated" if within last 24 hours
    if (hoursSinceGenerated < 24) {
      return latestSummary
    }
    return null
  }, [summaries])

  // Check if can generate weekly insight - need 7 unique days with entries
  // If user has 7 days, they should be able to generate regardless of recent generation
  const canGenerateWeekly = daysOfJournaling >= 7 && entriesForWeeklyInsight.length > 0
  
  // Show "recently generated" card only when NOT ready to generate a new one
  const showRecentlyGeneratedCard = recentlyGeneratedSummary && !canGenerateWeekly
  
  // For progress display
  const entriesSinceLastWeekly = entriesForWeeklyInsight.length

  const handleViewEntry = (entryId: string) => {
    router.push(`/entries?highlight=${entryId}`)
  }

  const handleGenerateInsights = async (entryId: string) => {
    setGeneratingId(entryId)
    try {
      await generateEntrySummary(entryId)
    } finally {
      setGeneratingId(null)
    }
  }

  const handleGenerateWeeklyInsights = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (generatingWeekly) return // Prevent double-click
    
    setGeneratingWeekly(true)
    try {
      // Use a timeout to ensure state update happens before async call
      await new Promise(resolve => setTimeout(resolve, 100))
      await generateWeeklySummary(new Date())
    } catch (error) {
      console.error('Error generating weekly insights:', error)
    } finally {
      setGeneratingWeekly(false)
    }
  }

  const getMoodInfo = (mood?: string) => {
    if (!mood || !moodConfig[mood]) {
      return { icon: Meh, color: 'text-gray-400', bgColor: 'bg-gray-400' }
    }
    return moodConfig[mood]
  }

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-2 border-[var(--primary)] border-t-transparent rounded-full mx-auto mb-3"
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-[var(--text-secondary)]"
          >
            Loading insights...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-sm"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[var(--primary)]/30"
          >
            <Calendar size={28} className="text-white" />
          </motion.div>
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl font-bold text-[var(--text-primary)] mb-2"
          >
            No Entries Yet
          </motion.h3>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-[var(--text-secondary)] mb-5"
          >
            Start journaling to see AI-powered insights and patterns.
          </motion.p>
          <motion.button 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
            className="px-5 py-2.5 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-lg text-sm font-medium inline-flex items-center gap-2 shadow-lg shadow-[var(--primary)]/25"
          >
            <PenSquare size={16} />
            Start Journaling
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="pb-4 sm:pb-8">
      {/* Compact Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2 font-en">
          Your Insights
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Sparkles size={20} className="text-[var(--primary)]" />
          </motion.div>
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5 font-en">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} • {summaries.length} weekly {summaries.length === 1 ? 'insight' : 'insights'}
        </p>
      </motion.div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className="bg-gradient-to-br from-[var(--surface-elevated)] to-[var(--surface)] rounded-xl p-3 sm:p-4 text-center relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--primary)]/5 rounded-full blur-2xl" />
          <div className="relative">
            <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1.5 rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5 flex items-center justify-center">
              <BookOpen size={16} className="text-[var(--primary)] sm:w-5 sm:h-5" />
            </div>
            <motion.div 
              className="text-xl sm:text-2xl font-bold text-[var(--primary)] font-en"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              {entries.length}
            </motion.div>
            <div className="text-[9px] sm:text-[10px] text-[var(--text-secondary)] font-medium">
              Total Entries
            </div>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className="bg-gradient-to-br from-[var(--surface-elevated)] to-[var(--surface)] rounded-xl p-3 sm:p-4 text-center relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-2xl" />
          <div className="relative">
            <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center">
              <Brain size={16} className="text-purple-500 sm:w-5 sm:h-5" />
            </div>
            <motion.div 
              className="text-xl sm:text-2xl font-bold text-purple-500 font-en"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              {summaries.length}
            </motion.div>
            <div className="text-[9px] sm:text-[10px] text-[var(--text-secondary)] font-medium">
              Weekly Insights
            </div>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className="bg-gradient-to-br from-[var(--surface-elevated)] to-[var(--surface)] rounded-xl p-3 sm:p-4 text-center relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-2xl" />
          <div className="relative">
            <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center">
              <Sparkles size={16} className="text-emerald-500 sm:w-5 sm:h-5" />
            </div>
            <motion.div 
              className="text-xl sm:text-2xl font-bold text-emerald-500 font-en"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              {entrySummaries.length}
            </motion.div>
            <div className="text-[9px] sm:text-[10px] text-[var(--text-secondary)] font-medium">
              Entry Insights
            </div>
          </div>
        </motion.div>
      </div>

      {/* Weekly Progress Card - Shows when ready to generate (7 days of entries) */}
      {canGenerateWeekly && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6"
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600/15 via-purple-600/10 to-pink-600/15 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-indigo-500/30 shadow-xl shadow-indigo-500/10">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-20 -right-20 w-40 sm:w-64 h-40 sm:h-64 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-3xl"
              />
              <motion.div 
                animate={{ 
                  scale: [1.2, 1, 1.2],
                  opacity: [0.1, 0.15, 0.1]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-20 -left-20 w-48 sm:w-72 h-48 sm:h-72 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-full blur-3xl"
              />
            </div>
            
            <div className="relative flex flex-col gap-4 sm:gap-5">
              {/* Header */}
              <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4">
                  <motion.div 
                    animate={{ 
                      boxShadow: ['0 0 20px rgba(99, 102, 241, 0.3)', '0 0 40px rgba(99, 102, 241, 0.5)', '0 0 20px rgba(99, 102, 241, 0.3)']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
                  >
                    <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                      Ready for Weekly Insight
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        ✨
                      </motion.span>
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
                      {entriesSinceLastWeekly} entries ready to analyze
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full border border-indigo-500/30">
                  <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">7/7 Days</span>
                </div>
              </div>
              
              {/* Progress indicator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>Analysis Progress</span>
                  <span className="text-indigo-400">Processing...</span>
                </div>
                <div className="h-2 sm:h-2.5 bg-[var(--surface)] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 15, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </motion.div>
                </div>
              </div>
              
              {/* Status card */}
              <motion.div 
                animate={{ 
                  borderColor: ['rgba(99, 102, 241, 0.3)', 'rgba(168, 85, 247, 0.3)', 'rgba(99, 102, 241, 0.3)']
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-indigo-500/30"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 sm:border-3 border-indigo-500 border-t-transparent flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-semibold text-[var(--text-primary)]">
                      Generating Weekly Insight
                    </p>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
                      AI is analyzing your journal patterns...
                    </p>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="hidden sm:flex w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 items-center justify-center"
                  >
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
            
            {/* Generating overlay - Enhanced */}
            {generatingWeekly && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-br from-[var(--background)]/98 via-[var(--background)]/95 to-indigo-950/90 backdrop-blur-md flex items-center justify-center rounded-2xl sm:rounded-3xl"
              >
                <div className="text-center px-4">
                  {/* Animated rings */}
                  <div className="relative w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-4 sm:mb-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-2 border-indigo-500/30"
                    />
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-2 sm:inset-3 rounded-full border-2 border-purple-500/50 border-t-transparent border-l-transparent"
                    />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-4 sm:inset-6 rounded-full border-2 border-pink-500/60 border-b-transparent border-r-transparent"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400" />
                      </motion.div>
                    </div>
                  </div>
                  
                  <motion.h3 
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2"
                  >
                    Analyzing Your Journey
                  </motion.h3>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-xs mx-auto">
                    Discovering patterns and insights from your week of reflections...
                  </p>
                  
                  {/* Animated dots */}
                  <div className="flex items-center justify-center gap-1.5 mt-4">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ 
                          duration: 1, 
                          repeat: Infinity, 
                          delay: i * 0.2 
                        }}
                        className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Recently Generated Weekly Insight Card */}
      {showRecentlyGeneratedCard && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600/15 via-teal-600/10 to-cyan-600/15 rounded-2xl border border-emerald-500/20 shadow-lg">
            {/* Decorative gradient orbs */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-500/15 rounded-full blur-3xl" />
            
            {/* Main content */}
            <div className="relative p-4 sm:p-5">
              {/* Success header */}
              <div className="flex items-center gap-3 sm:gap-4 mb-4">
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30"
                >
                  <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                    {entriesSinceLastWeekly > 0 ? 'New Week Started' : 'Weekly Insight Generated'}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
                    {entriesSinceLastWeekly > 0 
                      ? `${entriesSinceLastWeekly} new ${entriesSinceLastWeekly === 1 ? 'entry' : 'entries'} since last insight`
                      : 'Your personalized insights are ready below'
                    }
                  </p>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="hidden sm:flex w-10 h-10 rounded-xl bg-emerald-500/10 items-center justify-center"
                >
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                </motion.div>
              </div>
              
              {/* Next cycle progress */}
              <div className="bg-[var(--background)]/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-[var(--border)]/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">Next Insight</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {entriesSinceLastWeekly > 0 && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-500/10 rounded-full">
                        <PenSquare className="w-2.5 h-2.5 text-indigo-500" />
                        <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">{entriesSinceLastWeekly}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 rounded-full">
                      <span className="text-[10px] sm:text-xs font-bold text-purple-600 dark:text-purple-400">{daysOfJournaling}/7</span>
                    </div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="h-2 sm:h-2.5 bg-[var(--surface)] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(daysOfJournaling / 7) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </motion.div>
                </div>
                
                {/* Status text */}
                <p className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-2">
                  {daysOfJournaling === 0 
                    ? 'Write your first entry tomorrow to begin the next cycle'
                    : daysOfJournaling >= 7
                      ? 'Ready to generate your next weekly insight'
                      : `${7 - daysOfJournaling} more ${7 - daysOfJournaling === 1 ? 'day' : 'days'} of journaling needed`
                  }
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Progress to next weekly insight - Shows days progress (only when no recent generation) */}
      {!canGenerateWeekly && !showRecentlyGeneratedCard && entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="bg-gradient-to-br from-[var(--surface-elevated)] to-[var(--surface)] rounded-2xl p-4 border border-[var(--border)] shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-[var(--text-primary)]">Next Weekly Insight</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 rounded-full">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{daysOfJournaling}/7</span>
                <span className="text-[10px] text-[var(--text-muted)]">days</span>
              </div>
            </div>
            <div className="h-2 bg-[var(--surface)] rounded-full overflow-hidden border border-[var(--border)]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(daysOfJournaling / 7) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
              <p className="text-xs text-[var(--text-secondary)]">
                {daysOfJournaling < 7 
                  ? `${7 - daysOfJournaling} more ${7 - daysOfJournaling === 1 ? 'day' : 'days'} to unlock insights`
                  : 'Ready to generate!'
                }
              </p>
              {entriesSinceLastWeekly > 0 && (
                <div className="flex items-center gap-1.5 text-indigo-500">
                  <PenSquare className="w-3 h-3" />
                  <span className="text-[10px] font-medium">{entriesSinceLastWeekly} {entriesSinceLastWeekly === 1 ? 'entry' : 'entries'}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Timeline - Entries and Weekly Summaries */}
      <div className="relative">
        {/* Animated Vertical timeline line - stops at last entry dot */}
        <div className="absolute left-3 top-0 bottom-8 w-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)] via-[var(--secondary)] to-[var(--primary)]/50" />
          {/* Light beam animation going from bottom to top */}
          <motion.div
            className="absolute w-full h-24 bg-gradient-to-t from-transparent via-white/50 to-transparent"
            animate={{ bottom: ['-100px', '120%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
          />
        </div>

        {Object.entries(groupedByDate).map(([date, items], dateIndex) => (
          <motion.div 
            key={date} 
            className="mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: dateIndex * 0.1 }}
          >
            {/* Date Header */}
            <div className="flex items-center gap-2 mb-2 relative">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.15 }}
                transition={{ delay: dateIndex * 0.1 + 0.2, type: "spring", stiffness: 300 }}
                className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center z-10 shadow-lg shadow-[var(--primary)]/40 cursor-pointer relative"
              >
                {/* Pulse ring on circle */}
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: dateIndex * 0.2 }}
                  className="absolute inset-0 rounded-full bg-[var(--primary)]"
                />
                <Calendar size={12} className="text-white relative z-10" />
              </motion.div>
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: dateIndex * 0.1 + 0.3 }}
                className="text-xs font-bold text-[var(--text-primary)] bg-[var(--background)] px-2"
              >
                {date}
              </motion.span>
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: dateIndex * 0.1 + 0.4 }}
                className="flex-1 h-px bg-gradient-to-r from-[var(--border)] to-transparent origin-left" 
              />
            </div>

            {/* Entries and Weekly Summaries for this date */}
            <div className="ml-3 pl-5 space-y-2 sm:space-y-3">
              {items.map((item, itemIndex) => {
                // Render Weekly Summary Card
                if (item.type === 'weekly' && item.summary) {
                  const weeklySummary = item.summary as WeeklySummary
                  const isWeeklyExpanded = expandedWeeklyId === weeklySummary.id
                  const startDate = new Date(weeklySummary.weekStart)
                  const endDate = new Date(weeklySummary.weekEnd)
                  
                  return (
                    <motion.div
                      key={`weekly-${weeklySummary.id}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: dateIndex * 0.1 + itemIndex * 0.05 + 0.3 }}
                      whileHover={{ x: 3 }}
                      className="relative"
                    >
                      {/* Special marker for weekly insight */}
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -left-[25px] top-4 w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 ring-2 ring-[var(--background)] shadow-lg shadow-indigo-500/50" 
                      />
                      
                      {/* Weekly Summary Card */}
                      <motion.div
                        onClick={() => setExpandedWeeklyId(isWeeklyExpanded ? null : weeklySummary.id)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 ${
                          isWeeklyExpanded 
                            ? 'bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-pink-500/10 border-2 border-indigo-500/30' 
                            : 'bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 hover:border-indigo-500/40'
                        }`}
                      >
                        {/* Shimmer effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                        
                        <div className="relative p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <Brain className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-[var(--text-primary)]">Weekly Insights</h3>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-[10px] font-medium text-indigo-400">
                                    <Sparkles className="w-3 h-3" />
                                    {weeklySummary.entriesAnalyzed} entries
                                  </span>
                                  <span className="text-[10px] text-[var(--text-muted)]">
                                    {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <motion.div
                              animate={{ rotate: isWeeklyExpanded ? 180 : 0 }}
                              className="w-8 h-8 rounded-full bg-[var(--surface)] flex items-center justify-center"
                            >
                              <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
                            </motion.div>
                          </div>
                          
                          {/* Expanded Content */}
                          <AnimatePresence>
                            {isWeeklyExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                                  {/* Tabs */}
                                  <div className="flex gap-1.5 mb-4 bg-[var(--surface)] rounded-xl p-1.5">
                                    {[
                                      { id: 'overview' as const, label: 'Overview', icon: Star },
                                      { id: 'patterns' as const, label: 'Patterns', icon: TrendingUp },
                                      { id: 'actions' as const, label: 'Actions', icon: Target },
                                    ].map((tab) => (
                                      <button
                                        key={tab.id}
                                        onClick={(e) => { e.stopPropagation(); setWeeklyTab(weeklySummary.id, tab.id) }}
                                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                          getWeeklyActiveTab(weeklySummary.id) === tab.id
                                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background)]'
                                        }`}
                                      >
                                        <tab.icon className="w-3.5 h-3.5" />
                                        <span>{tab.label}</span>
                                      </button>
                                    ))}
                                  </div>
                                  
                                  {/* Tab Content */}
                                  {getWeeklyActiveTab(weeklySummary.id) === 'overview' && (
                                    <div className="space-y-4">
                                      <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20">
                                        <div className="flex items-start gap-3">
                                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                            <Heart className="w-4 h-4 text-white" />
                                          </div>
                                          <div>
                                            <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Motivational Insight</p>
                                            <p className="text-sm text-[var(--text-primary)] leading-relaxed font-medium">{weeklySummary.motivationalInsight}</p>
                                          </div>
                                        </div>
                                      </div>
                                      {weeklySummary.themes?.length > 0 && (
                                        <div>
                                          <h4 className="text-xs font-semibold text-[var(--text-secondary)] mb-2">Key Themes</h4>
                                          <div className="flex flex-wrap gap-2">
                                            {weeklySummary.themes.map((theme, i) => (
                                              <span key={i} className="px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium">{theme}</span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      {weeklySummary.achievements?.length > 0 && (
                                        <div>
                                          <h4 className="text-xs font-semibold text-[var(--text-secondary)] mb-2">Achievements</h4>
                                          <div className="space-y-2">
                                            {weeklySummary.achievements.map((achievement, i) => (
                                              <div key={i} className="flex items-start gap-2">
                                                <Award className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-[var(--text-primary)]">{achievement}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {getWeeklyActiveTab(weeklySummary.id) === 'patterns' && (
                                    <div className="space-y-4">
                                      {weeklySummary.emotionalPatterns?.length > 0 && (
                                        <div>
                                          <h4 className="text-xs font-semibold text-[var(--text-secondary)] mb-2">Emotional Patterns</h4>
                                          <div className="space-y-3">
                                            {weeklySummary.emotionalPatterns.map((pattern, i) => (
                                              <div key={i} className="p-3 rounded-lg bg-[var(--surface)]">
                                                <div className="flex items-center justify-between mb-2">
                                                  <span className="text-sm font-medium text-[var(--text-primary)] capitalize">{pattern.emotion}</span>
                                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                    pattern.trend === 'increasing' ? 'bg-green-500/20 text-green-400' :
                                                    pattern.trend === 'decreasing' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                                  }`}>{pattern.trend}</span>
                                                </div>
                                                <div className="h-2 bg-[var(--background)] rounded-full overflow-hidden">
                                                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${pattern.frequency * 100}%` }} />
                                                </div>
                                                {pattern.context && <p className="text-xs text-[var(--text-muted)] mt-2">{pattern.context}</p>}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      {weeklySummary.improvements?.length > 0 && (
                                        <div>
                                          <h4 className="text-xs font-semibold text-[var(--text-secondary)] mb-2">Areas for Growth</h4>
                                          <div className="space-y-2">
                                            {weeklySummary.improvements.map((improvement, i) => (
                                              <div key={i} className="flex items-start gap-2">
                                                <TrendingUp className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-[var(--text-primary)]">{improvement}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {getWeeklyActiveTab(weeklySummary.id) === 'actions' && (
                                    <div className="space-y-4">
                                      {weeklySummary.actionSteps?.length > 0 && (
                                        <div>
                                          <h4 className="text-xs font-semibold text-[var(--text-secondary)] mb-2">Action Steps</h4>
                                          <div className="space-y-2">
                                            {weeklySummary.actionSteps.map((step, i) => (
                                              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--surface)]">
                                                <div className="w-6 h-6 rounded-full bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0">
                                                  <span className="text-xs font-bold text-[var(--primary)]">{i + 1}</span>
                                                </div>
                                                <span className="text-sm text-[var(--text-primary)]">{step}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      {weeklySummary.suggestions?.length > 0 && (
                                        <div>
                                          <h4 className="text-xs font-semibold text-[var(--text-secondary)] mb-2">Suggestions</h4>
                                          <div className="space-y-2">
                                            {weeklySummary.suggestions.map((suggestion, i) => (
                                              <div key={i} className="flex items-start gap-2">
                                                <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-[var(--text-primary)]">{suggestion}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    </motion.div>
                  )
                }
                
                // Render Entry Card
                if (item.type !== 'entry' || !item.entry) return null
                
                const isExpanded = expandedId === item.entry.id
                const isGenerating = generatingId === item.entry.id
                const moodInfo = getMoodInfo(item.entry.mood)

                const isHighlighted = highlightedEntryId === item.entry.id
                
                return (
                  <motion.div
                    key={item.entry.id}
                    id={`insight-${item.entry.id}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      scale: isHighlighted ? [1, 1.02, 1] : 1
                    }}
                    transition={{ 
                      delay: dateIndex * 0.1 + itemIndex * 0.05 + 0.3,
                      scale: isHighlighted ? { duration: 0.5, repeat: 2 } : undefined
                    }}
                    whileHover={{ x: 3 }}
                    className={`relative ${isHighlighted ? 'z-10' : ''}`}
                  >
                    {/* Highlight glow effect */}
                    {isHighlighted && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 rounded-2xl blur-lg"
                      />
                    )}
                    {/* Mood indicator dot on timeline */}
                    <div className={`absolute -left-[23px] top-4 w-2 h-2 rounded-full ${moodInfo.bgColor} ring-2 ring-[var(--background)]`} />
                    
                    {/* Entry Card */}
                    <motion.div 
                      className={`bg-gradient-to-br from-[var(--surface-elevated)] to-[var(--surface)] rounded-xl overflow-hidden transition-all duration-300 ${
                        isExpanded 
                          ? 'shadow-lg shadow-[var(--primary)]/15 ring-1 ring-[var(--primary)]/20' 
                          : 'hover:shadow-md hover:shadow-black/5'
                      }`}
                      layout
                    >
                      {/* Card Header */}
                      <div 
                        className="p-3 cursor-pointer group"
                        onClick={() => setExpandedId(isExpanded ? null : item.entry.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            {/* Time & Mood */}
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="text-[10px] text-[var(--text-muted)] font-medium flex items-center gap-1">
                                <Clock size={10} />
                                {new Date(item.entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {item.entry.mood && (() => {
                                const moodInfo = getMoodInfo(item.entry.mood)
                                const MoodIcon = moodInfo.icon
                                return (
                                  <motion.span 
                                    whileHover={{ scale: 1.05 }}
                                    className={`text-[10px] font-medium capitalize px-2 py-0.5 rounded-full ${moodInfo.bgColor}/15 ${moodInfo.color} flex items-center gap-1`}
                                  >
                                    <MoodIcon size={10} />
                                    {item.entry.mood}
                                  </motion.span>
                                )
                              })()}
                              {item.summary ? (
                                <motion.span 
                                  animate={{ 
                                    scale: [1, 1.05, 1]
                                  }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/15 to-pink-500/15 text-purple-500 flex items-center gap-1"
                                >
                                  <Sparkles size={10} />
                                  AI Insight
                                </motion.span>
                              ) : (autoGeneratingIds.has(item.entry.id) || generatingId === item.entry.id || retryingId === item.entry.id) ? (
                                <motion.span 
                                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/15 to-purple-500/15 text-indigo-500 flex items-center gap-1"
                                >
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  >
                                    <RefreshCw size={10} />
                                  </motion.div>
                                  Generating...
                                </motion.span>
                              ) : entryHoldStatuses.find(h => h.entryId === item.entry.id) ? (
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // Expand to show hold details
                                    if (expandedId !== item.entry.id) {
                                      setExpandedId(item.entry.id)
                                    }
                                  }}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center gap-1 cursor-pointer hover:bg-amber-500/25 transition-all"
                                >
                                  <PauseCircle size={10} />
                                  On Hold
                                </motion.button>
                              ) : null}
                            </div>
                            {/* Entry Title */}
                            {item.entry.title && (
                              <h3 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-1 mb-1">
                                {item.entry.title}
                              </h3>
                            )}
                            {/* Content Preview */}
                            <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed group-hover:text-[var(--primary)] transition-colors">
                              {item.entry.content.substring(0, 120)}
                              {item.entry.content.length > 120 ? '...' : ''}
                            </p>
                          </div>
                          <motion.button 
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors shrink-0"
                          >
                            <ChevronDown size={16} />
                          </motion.button>
                        </div>

                        {/* Tags */}
                        {item.entry.tags && item.entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.entry.tags.slice(0, 3).map((tag, tagIndex) => (
                              <motion.span 
                                key={tag} 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: tagIndex * 0.05 }}
                                whileHover={{ scale: 1.1 }}
                                className="text-[9px] px-1.5 py-0.5 bg-[var(--background)] border border-[var(--border)] rounded-full text-[var(--text-secondary)] hover:border-[var(--primary)]/50 hover:text-[var(--primary)] transition-colors cursor-pointer"
                              >
                                #{tag}
                              </motion.span>
                            ))}
                            {item.entry.tags.length > 3 && (
                              <span className="text-[9px] text-[var(--text-muted)] px-1">
                                +{item.entry.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 pt-0 border-t border-[var(--border)]">
                              {/* Full Content */}
                              <motion.p 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-sm text-[var(--text-primary)] leading-relaxed py-3"
                              >
                                {item.entry.content}
                              </motion.p>

                              {/* AI Insights Section */}
                              {item.summary ? (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.2 }}
                                  className="mt-3 relative"
                                >
                                  {/* Main AI Insights Card */}
                                  <div className="bg-[var(--surface-elevated)] rounded-2xl p-3 sm:p-4 relative overflow-hidden shadow-sm">
                                    {/* Top accent line */}
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                                  
                                    {/* Header */}
                                    <div className="flex items-center gap-2 sm:gap-2.5 mb-3 sm:mb-4 pt-1">
                                      <motion.div
                                        animate={{ 
                                          scale: [1, 1.08, 1]
                                        }}
                                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                        className="p-1.5 sm:p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl shadow-md shadow-indigo-500/20"
                                      >
                                        <Sparkles size={12} className="text-white sm:w-[14px] sm:h-[14px]" />
                                      </motion.div>
                                      <div>
                                        <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                          AI Insights
                                        </span>
                                        <p className="text-[8px] sm:text-[9px] text-[var(--text-muted)] hidden sm:block">Powered by intelligence</p>
                                      </div>
                                    </div>
                                  
                                    {/* Key Themes */}
                                    {item.summary.keyThemes.length > 0 && (
                                      <motion.div 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="mb-3 sm:mb-4"
                                      >
                                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md sm:rounded-lg bg-blue-500/10 flex items-center justify-center">
                                            <Tag size={8} className="text-blue-600 sm:w-[10px] sm:h-[10px]" />
                                          </div>
                                          <p className="text-[10px] sm:text-[11px] font-semibold text-blue-600">Key Themes</p>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2 pl-5 sm:pl-7">
                                          {item.summary.keyThemes.map((theme, i) => (
                                            <motion.span 
                                              key={i} 
                                              initial={{ opacity: 0, scale: 0.8 }}
                                              animate={{ opacity: 1, scale: 1 }}
                                              transition={{ delay: 0.3 + i * 0.05 }}
                                              className="text-[10px] sm:text-[11px] px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-full font-medium"
                                            >
                                              {theme}
                                            </motion.span>
                                          ))}
                                        </div>
                                      </motion.div>
                                    )}

                                    {/* Emotional Insight */}
                                    {item.summary.emotionalInsights[0] && (
                                      <motion.div 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="mb-3 sm:mb-4"
                                      >
                                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md sm:rounded-lg bg-rose-500/10 flex items-center justify-center">
                                            <Heart size={8} className="text-rose-600 sm:w-[10px] sm:h-[10px]" />
                                          </div>
                                          <p className="text-[10px] sm:text-[11px] font-semibold text-rose-600">Emotional Insight</p>
                                        </div>
                                        <div className="ml-5 sm:ml-7 bg-rose-500/5 rounded-lg sm:rounded-xl p-2 sm:p-3 border-l-2 border-rose-500">
                                          <p className="text-[11px] sm:text-[13px] text-[var(--text-primary)] leading-relaxed">
                                            {item.summary.emotionalInsights[0]}
                                          </p>
                                        </div>
                                      </motion.div>
                                    )}

                                    {/* Suggestion */}
                                    {item.summary.suggestions[0] && (
                                      <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                      >
                                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md sm:rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                            <Lightbulb size={8} className="text-emerald-600 sm:w-[10px] sm:h-[10px]" />
                                          </div>
                                          <p className="text-[10px] sm:text-[11px] font-semibold text-emerald-600">Suggestion</p>
                                        </div>
                                        <div className="ml-5 sm:ml-7 bg-emerald-500/5 rounded-lg sm:rounded-xl p-2 sm:p-3 border-l-2 border-emerald-500">
                                          <p className="text-[11px] sm:text-[13px] text-[var(--text-primary)] leading-relaxed">
                                            {item.summary.suggestions[0]}
                                          </p>
                                        </div>
                                      </motion.div>
                                    )}
                                  </div>
                                </motion.div>
                              ) : (() => {
                                const holdStatus = entryHoldStatuses.find(h => h.entryId === item.entry.id)
                                const isGenerating = generatingId === item.entry.id || autoGeneratingIds.has(item.entry.id) || retryingId === item.entry.id
                                
                                if (holdStatus && !isGenerating) {
                                  // Show hold status info
                                  return (
                                    <motion.div
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: 0.2 }}
                                      className="mt-2 sm:mt-3"
                                    >
                                      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg sm:rounded-xl p-3 sm:p-4">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                                            <PauseCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h4 className="text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-300">
                                              Insight Generation Paused
                                            </h4>
                                            <p className="text-[10px] sm:text-xs text-[var(--text-secondary)] leading-relaxed">
                                              {holdStatus.reason === 'rate_limit' && 'AI service experiencing high demand.'}
                                              {holdStatus.reason === 'api_error' && 'Temporary AI service down.'}
                                              {holdStatus.reason === 'timeout' && 'Request timed out.'}
                                              {holdStatus.reason === 'invalid_response' && 'Something went wrong.'}
                                              {holdStatus.reason === 'unknown' && 'An issue occurred.'}
                                            </p>
                                          </div>
                                          <button
                                            onClick={async (e) => {
                                              e.stopPropagation()
                                              setRetryingId(item.entry.id)
                                              try {
                                                await retryHeldEntry(item.entry.id)
                                              } catch {
                                                // Error handled by context
                                              } finally {
                                                setRetryingId(null)
                                              }
                                            }}
                                            className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-600 dark:text-amber-400 transition-all active:scale-95"
                                            title="Try Again"
                                          >
                                            <RefreshCw size={16} className="sm:w-[18px] sm:h-[18px]" />
                                          </button>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )
                                }
                                
                                return (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="mt-3"
                                  >
                                    <div className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-indigo-500/10 to-purple-600/10 border border-indigo-500/20 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
                                      {isGenerating ? (
                                        <>
                                          <motion.div 
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-indigo-500 border-t-transparent rounded-full"
                                          />
                                          <span className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400">Generating insights...</span>
                                        </>
                                      ) : (
                                        <>
                                          <motion.div 
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-indigo-500/50 border-t-transparent rounded-full"
                                          />
                                          <span className="text-xs sm:text-sm text-[var(--text-muted)]">AI insights pending...</span>
                                        </>
                                      )}
                                    </div>
                                  </motion.div>
                                )
                              })()}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        ))}

        {/* End of timeline marker */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-3 sm:gap-4 relative"
        >
          {/* Timeline end dot */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 300 }}
            className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center z-10 shadow-md shadow-[var(--primary)]/30"
          >
            {/* Pulse ring */}
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-[var(--primary)]"
            />
            <Sparkles size={10} className="text-white relative z-10 sm:w-3 sm:h-3" />
          </motion.div>
          
          {/* Content */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 bg-gradient-to-r from-[var(--primary)]/5 to-transparent py-2 px-3 rounded-lg -ml-1">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
                Beginning of your journal
              </span>
              <span className="text-[9px] sm:text-[10px] text-[var(--text-muted)]">
                Your story starts here
              </span>
            </div>
            
            {/* Day 1 badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="ml-auto px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[var(--primary)]/10 rounded-full"
            >
              <span className="text-[8px] sm:text-[10px] font-semibold text-[var(--primary)]">Day 1</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
