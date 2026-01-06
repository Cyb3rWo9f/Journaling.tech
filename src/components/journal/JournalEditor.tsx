'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { Save, Calendar, Smile, Meh, Frown, Heart, Zap, AlertCircle, PenTool, Laugh, Coffee, Sun, Cloud, Star, Sparkles, ThumbsUp, Music, Target, Lightbulb, Battery, Flame, Angry, CloudRain, Trophy, Award } from 'lucide-react'
import TextareaAutosize from 'react-textarea-autosize'
import { useJournal } from '@/context/JournalContext'
import { JournalEntry } from '@/types'
import { Button } from '@/components/ui/Button'
import { WeatherWidget } from '@/components/widgets/WeatherWidget'
import { MobileWeatherWidget } from '@/components/widgets/MobileWeatherWidget'
import { debounce, formatDate } from '@/utils'

interface JournalEditorProps {
  entry?: JournalEntry
  onSave?: (entry: JournalEntry) => void
}

export function JournalEditor({ entry, onSave }: JournalEditorProps) {
  const router = useRouter()
  const { createEntry, updateEntry, autoSave, entries } = useJournal()
  const [title, setTitle] = useState(entry?.title || '')
  const [content, setContent] = useState(entry?.content || '')
  const [mood, setMood] = useState<JournalEntry['mood']>(entry?.mood)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false)
  const [hashtagQuery, setHashtagQuery] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)

  // Update state when entry prop changes (for edit mode)
  useEffect(() => {
    if (entry) {
      setTitle(entry.title || '')
      setContent(entry.content || '')
      setMood(entry.mood)
    } else {
      // Reset for new entry
      setTitle('')
      setContent('')
      setMood(undefined)
    }
    // Mark as initialized after setting the initial values
    setIsInitialized(true)
  }, [entry])

  // Extract hashtags from content
  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#[a-zA-Z0-9_]+/g
    const matches = text.match(hashtagRegex) || []
    // Remove # and convert to lowercase, remove duplicates
    return [...new Set(matches.map(tag => tag.slice(1).toLowerCase()))]
  }

  // Get all previous hashtags from existing entries
  const getAllPreviousHashtags = (): string[] => {
    const allTags = entries.flatMap(entry => entry.tags || [])
    return [...new Set(allTags)]
  }

  // Get filtered hashtag suggestions based on query
  const getHashtagSuggestions = (query: string): string[] => {
    const previousTags = getAllPreviousHashtags()
    const normalizedQuery = query.toLowerCase()
    
    return previousTags
      .filter(tag => tag.toLowerCase().includes(normalizedQuery))
      .slice(0, 5) // Limit to 5 suggestions
  }

  // Remove hashtags from content and return clean content
  const removeHashtagsFromContent = (text: string): string => {
    return text.replace(/#[a-zA-Z0-9_]+/g, '').replace(/\s+/g, ' ').trim()
  }

  // Get current tags from content
  const currentTags = extractHashtags(content)

  // Calculate streak data from entries
  const streakData = useMemo(() => {
    if (!entries || entries.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        badges: [
          { icon: <Star size={12} className="text-gray-400" />, label: 'First Entry' },
          { icon: <Flame size={12} className="text-gray-400" />, label: '7-Day Streak' },
          { icon: <Trophy size={12} className="text-gray-400" />, label: '30-Day Streak' },
        ]
      }
    }

    // Get unique dates from entries (normalized to date only)
    const entryDates = entries.map(e => {
      const date = new Date(e.createdAt || e.date)
      date.setHours(0, 0, 0, 0)
      return date.getTime()
    })
    const uniqueDates = [...new Set(entryDates)].sort((a, b) => b - a)

    // Calculate current streak
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let currentStreak = 0
    let checkDate = today.getTime()

    // Check if there's an entry today or yesterday to start counting
    if (uniqueDates.includes(today.getTime()) || uniqueDates.includes(yesterday.getTime())) {
      // Start from today if entry exists, otherwise from yesterday
      if (!uniqueDates.includes(today.getTime())) {
        checkDate = yesterday.getTime()
      }

      while (uniqueDates.includes(checkDate)) {
        currentStreak++
        checkDate -= 24 * 60 * 60 * 1000 // Go back one day
      }
    }

    // Calculate longest streak
    let longestStreak = 0
    let tempStreak = 1

    const sortedDates = [...uniqueDates].sort((a, b) => a - b)
    for (let i = 1; i < sortedDates.length; i++) {
      const diff = sortedDates[i] - sortedDates[i - 1]
      if (diff === 24 * 60 * 60 * 1000) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    // Generate badges based on achievements
    const totalEntries = entries.length
    const badges = []

    // First Entry badge
    if (totalEntries >= 1) {
      badges.push({ icon: <Star size={12} className="text-yellow-500" />, label: 'First Entry' })
    } else {
      badges.push({ icon: <Star size={12} className="text-gray-400" />, label: 'First Entry' })
    }

    // 7-Day Streak badge
    if (longestStreak >= 7 || currentStreak >= 7) {
      badges.push({ icon: <Flame size={12} className="text-orange-500" />, label: '7-Day Streak' })
    } else {
      badges.push({ icon: <Flame size={12} className="text-gray-400" />, label: '7-Day Streak' })
    }

    // 30-Day Streak badge
    if (longestStreak >= 30 || currentStreak >= 30) {
      badges.push({ icon: <Trophy size={12} className="text-purple-500" />, label: '30-Day Streak' })
    } else {
      badges.push({ icon: <Trophy size={12} className="text-gray-400" />, label: '30-Day Streak' })
    }

    // 10 Entries badge
    if (totalEntries >= 10) {
      badges.push({ icon: <Award size={12} className="text-blue-500" />, label: '10 Entries' })
    }

    return { currentStreak, longestStreak, badges }
  }, [entries])

  // Handle content change with hashtag detection
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    const cursorPos = e.target.selectionStart
    setContent(newContent)
    setCursorPosition(cursorPos)

    // Check if user is typing a hashtag
    const textBeforeCursor = newContent.slice(0, cursorPos)
    const hashtagMatch = textBeforeCursor.match(/#([a-zA-Z0-9_]*)$/)
    
    if (hashtagMatch) {
      const query = hashtagMatch[1]
      setHashtagQuery(query)
      setShowHashtagSuggestions(true)
    } else {
      setShowHashtagSuggestions(false)
      setHashtagQuery('')
    }
  }

  // Insert hashtag suggestion
  const insertHashtag = (tag: string) => {
    const textBeforeCursor = content.slice(0, cursorPosition)
    const textAfterCursor = content.slice(cursorPosition)
    
    // Find the # position to replace
    const hashtagMatch = textBeforeCursor.match(/#([a-zA-Z0-9_]*)$/)
    if (hashtagMatch) {
      const hashtagStart = textBeforeCursor.lastIndexOf('#')
      const newContent = textBeforeCursor.slice(0, hashtagStart) + `#${tag} ` + textAfterCursor
      setContent(newContent)
      setShowHashtagSuggestions(false)
      setHashtagQuery('')
    }
  }

  // Auto-save functionality
  const debouncedAutoSave = useCallback(
    debounce((currentEntry: JournalEntry) => {
      console.log('🔄 Auto-save triggered for entry:', currentEntry.id)
      console.log('🔄 Auto-save content length:', currentEntry.content.length)
      autoSave(currentEntry)
      setLastSaved(new Date().toLocaleTimeString())
    }, 2000),
    [autoSave]
  )

  useEffect(() => {
    console.log('🔍 Auto-save useEffect triggered:', {
      isInitialized,
      hasEntry: !!entry,
      entryId: entry?.id || 'none'
    })

    // Completely disable auto-save when editing existing entries
    // Only allow auto-save for completely new entries
    if (isInitialized && !entry && content.trim()) {
      console.log('🔄 Auto-saving new entry...')
      // This is for new entries only - we'll handle this later if needed
      // For now, let's disable all auto-save to prevent the issue
    } else if (entry) {
      console.log('📝 Edit mode detected - auto-save completely disabled')
    }
  }, [content, mood, entry, debouncedAutoSave, isInitialized])

  const handleSave = async () => {
    if (!content.trim()) return

    console.log('🔄 Attempting to save entry...')
    const tags = extractHashtags(content)
    const cleanContent = removeHashtagsFromContent(content)
    console.log('Title:', title)
    console.log('Content length:', cleanContent.length)
    console.log('Extracted tags:', tags)
    console.log('Entry exists:', !!entry)

    setIsSaving(true)
    try {
      if (entry) {
        // Update existing entry
        const updatedEntry = { ...entry, title: title.trim(), content: cleanContent, mood, tags }
        await updateEntry(updatedEntry)
        console.log('✅ Entry updated successfully:', entry.id)
        onSave?.(updatedEntry)
      } else {
        // Create new entry with title
        const savedEntry = await createEntry(title.trim(), cleanContent, mood, tags)
        console.log('✅ Entry created successfully:', savedEntry.id)
        onSave?.(savedEntry)
      }

      setLastSaved(new Date().toLocaleTimeString())
      
      // Quick navigation - AI insights will generate on Insights page
      setTimeout(() => {
        console.log('🔄 Redirecting to entries page...')
        router.push('/entries')
      }, 300)
      
    } catch (error) {
      console.error('❌ Failed to save entry:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const moodOptions = [
    { value: 'happy', icon: Smile, label: 'Happy', color: 'text-green-500' },
    { value: 'joyful', icon: Laugh, label: 'Joyful', color: 'text-emerald-500' },
    { value: 'grateful', icon: Heart, label: 'Grateful', color: 'text-pink-500' },
    { value: 'excited', icon: Zap, label: 'Excited', color: 'text-yellow-500' },
    { value: 'energetic', icon: Flame, label: 'Energetic', color: 'text-red-500' },
    { value: 'inspired', icon: Lightbulb, label: 'Inspired', color: 'text-purple-500' },
    { value: 'peaceful', icon: Sun, label: 'Peaceful', color: 'text-blue-400' },
    { value: 'content', icon: ThumbsUp, label: 'Content', color: 'text-teal-500' },
    { value: 'motivated', icon: Target, label: 'Motivated', color: 'text-indigo-500' },
    { value: 'relaxed', icon: Coffee, label: 'Relaxed', color: 'text-amber-600' },
    { value: 'creative', icon: Sparkles, label: 'Creative', color: 'text-violet-500' },
    { value: 'focused', icon: Battery, label: 'Focused', color: 'text-cyan-500' },
    { value: 'neutral', icon: Meh, label: 'Neutral', color: 'text-gray-500' },
    { value: 'tired', icon: Battery, label: 'Tired', color: 'text-gray-400' },
    { value: 'stressed', icon: AlertCircle, label: 'Stressed', color: 'text-orange-500' },
    { value: 'anxious', icon: Cloud, label: 'Anxious', color: 'text-orange-600' },
    { value: 'melancholy', icon: Music, label: 'Melancholy', color: 'text-slate-500' },
    { value: 'sad', icon: Frown, label: 'Sad', color: 'text-blue-500' },
    { value: 'frustrated', icon: Angry, label: 'Frustrated', color: 'text-red-600' },
    { value: 'overwhelmed', icon: CloudRain, label: 'Overwhelmed', color: 'text-gray-600' },
  ] as const

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-2 lg:gap-3">
      {/* Main Editor - Takes 3 columns on large screens, full width on mobile */}
      <div className="lg:col-span-3 space-y-2">
        {/* Main Editor Card */}
        <div className="overflow-hidden bg-[var(--surface-elevated)] rounded-xl shadow-lg shadow-black/5">
          {/* Header with gradient accent */}
          <div className="relative">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--primary)]" />
            
            <div className="p-2.5 sm:p-3 lg:p-4">
              <div className="flex flex-col gap-2">
                {/* Top Row: Date & Save Button */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-lg">
                      <Calendar size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-[var(--primary)] uppercase tracking-wider">
                        {entry ? 'Edit Entry' : 'New Entry'}
                      </p>
                      <p className="text-sm font-bold text-[var(--text-primary)] font-en">
                        {formatDate(entry?.date || new Date())}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {lastSaved && (
                      <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 px-2 py-1 rounded-md">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                          Auto-saved <span className="font-en">{lastSaved}</span>
                        </span>
                      </div>
                    )}
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !content.trim()}
                      className={`group flex items-center justify-center gap-1.5 font-bold text-[11px] w-full sm:w-auto px-3 py-1.5 rounded-md transition-all duration-200 ${
                        isSaving || !content.trim()
                          ? 'bg-[var(--border)] text-[var(--text-muted)] cursor-not-allowed'
                          : 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white shadow-md shadow-[var(--primary)]/25 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    >
                      <Save size={12} className={isSaving ? 'animate-spin' : ''} />
                      <span>{isSaving ? 'Saving...' : 'Save'}</span>
                    </button>
                  </div>
                </div>

                {/* Title Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <PenTool size={11} className="text-[var(--primary)]" />
                    <p className="text-[11px] font-bold text-[var(--text-primary)]">Entry Title</p>
                    <span className="text-[9px] text-[var(--text-muted)]">(optional)</span>
                  </div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your entry a title..."
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                  />
                </div>

                {/* Mood Selector */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Heart size={11} className="text-pink-500" />
                    <p className="text-[11px] font-bold text-[var(--text-primary)]">How are you feeling?</p>
                  </div>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
                    {moodOptions.map(({ value, icon: Icon, label, color }) => (
                      <button
                        key={value}
                        onClick={() => setMood(mood === value ? undefined : value)}
                        className={`group relative flex flex-col items-center justify-center gap-0.5 p-1.5 rounded-md transition-all duration-150 ${
                          mood === value 
                            ? 'bg-[var(--primary)] text-white scale-105 z-10 shadow-md' 
                            : 'bg-[var(--background)] hover:bg-[var(--surface-elevated)]'
                        }`}
                      >
                        <Icon size={14} className={mood === value ? 'text-white' : color} />
                        <span className={`text-[8px] font-semibold leading-none ${mood === value ? 'text-white' : 'text-[var(--text-secondary)]'}`}>
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="relative bg-[var(--background)]">
            <textarea
              value={content}
              placeholder="Begin your journal entry here. This is your private sanctuary for self-reflection, personal growth, and meaningful documentation of your life's journey. Take a moment to pause and reflect on your day. What experiences shaped your thoughts today? What emotions did you navigate through? Writing about your feelings helps process them and gain clarity. Use #hashtags to organize your entries effectively — try #gratitude, #goals, #reflection, #work, or #health. Consider exploring: What made today meaningful? What challenges did you face? What are you grateful for? What lessons did today teach you? What intentions do you want to set for tomorrow? Remember, there's no right or wrong way to journal. Write freely and let your thoughts flow naturally."
              onChange={handleContentChange}
              rows={12}
              className="w-full p-4 bg-transparent border-none outline-none resize-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/60 text-base leading-relaxed selection:bg-[var(--primary)]/20 scrollbar-thin overflow-y-auto h-[320px]"
              style={{ fontSize: '15px', lineHeight: '1.7' }}
            />

            {/* Hashtag Suggestions */}
            {showHashtagSuggestions && getHashtagSuggestions(hashtagQuery).length > 0 && (
              <div className="absolute top-24 left-5 z-50 bg-[var(--surface-elevated)] rounded-2xl shadow-2xl shadow-black/10 max-w-xs overflow-hidden backdrop-blur-xl">
                <div className="p-2">
                  <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold mb-2 px-3 py-1.5 flex items-center gap-2">
                    <Sparkles size={10} className="text-[var(--secondary)]" />
                    Suggestions
                  </div>
                  {getHashtagSuggestions(hashtagQuery).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => insertHashtag(tag)}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-[var(--primary)]/10 hover:to-[var(--secondary)]/10 rounded-xl transition-all flex items-center gap-3 group"
                    >
                      <span className="w-6 h-6 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold group-hover:scale-110 group-hover:bg-[var(--primary)] group-hover:text-white transition-all">#</span>
                      <span className="text-[var(--text-primary)] font-semibold">{tag}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Word Count Badge */}
            {content.trim() && (
              <div className="absolute bottom-2 right-3 flex items-center gap-2">
                <span className="text-[10px] text-[var(--text-muted)] bg-[var(--surface-elevated)] px-2 py-1 rounded">
                  <span className="font-en">{content.split(' ').filter(word => word.length > 0).length}</span> words
                </span>
              </div>
            )}
          </div>

          {/* Tags Display */}
          {currentTags.length > 0 && (
            <div className="p-3 bg-[var(--primary)]/5">
              <div className="flex items-center gap-2 mb-2">
                <Target size={12} className="text-[var(--primary)]" />
                <span className="text-xs font-bold text-[var(--text-primary)]">Tags</span>
                <span className="text-[10px] text-white bg-[var(--primary)] px-1.5 py-0.5 rounded font-bold">{currentTags.length}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentTags.map((tag, index) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded text-xs font-semibold border border-[var(--primary)]/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar - Weather Widget */}
      <div className="lg:col-span-1 lg:-mt-3">
        <div className="space-y-2">
          {/* Mobile weather widget */}
          <div className="md:hidden mb-4">
            <MobileWeatherWidget className="h-auto" />
          </div>
          {/* Mobile Streak Card */}
          <div className="lg:hidden bg-[var(--surface-elevated)] rounded-xl p-3 mb-24">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                  <Flame size={14} className="text-white" />
                </div>
                <span className="text-xs font-bold text-[var(--text-primary)]">Your Streaks</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-500 font-en">{streakData.currentStreak}</div>
                  <div className="text-[9px] text-[var(--text-secondary)]">Current</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[var(--primary)] font-en">{streakData.longestStreak}</div>
                  <div className="text-[9px] text-[var(--text-secondary)]">Best</div>
                </div>
                <div className="flex items-center gap-1">
                  {streakData.badges.slice(0, 3).map((badge, index) => (
                    <div 
                      key={index}
                      className="p-1 bg-[var(--background)] rounded-md"
                    >
                      {badge.icon}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Desktop weather widget */}
          <div className="hidden md:block">
            <WeatherWidget size="sm" />
          </div>
          
          {/* Writing Tips Card - Desktop Only */}
          <div className="hidden lg:block bg-[var(--surface-elevated)] rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="p-1 bg-gradient-to-br from-amber-500 to-orange-500 rounded-md">
                <Lightbulb size={10} className="text-white" />
              </div>
              <span className="text-[11px] font-bold text-[var(--text-primary)]">Quick Tips</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-start gap-1.5 text-[10px] text-[var(--text-secondary)]">
                <div className="w-1 h-1 rounded-full bg-[var(--primary)] mt-1 shrink-0" />
                <span>Use #hashtags to organize entries</span>
              </div>
              <div className="flex items-start gap-1.5 text-[10px] text-[var(--text-secondary)]">
                <div className="w-1 h-1 rounded-full bg-[var(--secondary)] mt-1 shrink-0" />
                <span>Select a mood to track feelings</span>
              </div>
              <div className="flex items-start gap-1.5 text-[10px] text-[var(--text-secondary)]">
                <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1 shrink-0" />
                <span>Write daily to build a streak</span>
              </div>
            </div>
          </div>

          {/* Streak & Badges Card - Desktop Only */}
          <div className="hidden lg:block bg-[var(--surface-elevated)] rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="p-1 bg-gradient-to-br from-orange-500 to-red-500 rounded-md">
                <Flame size={10} className="text-white" />
              </div>
              <span className="text-[11px] font-bold text-[var(--text-primary)]">Your Streaks</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              <div className="bg-[var(--background)] rounded-md p-1.5 text-center">
                <div className="text-base font-bold text-orange-500 font-en">{streakData.currentStreak}</div>
                <div className="text-[9px] text-[var(--text-secondary)]">Current</div>
              </div>
              <div className="bg-[var(--background)] rounded-md p-1.5 text-center">
                <div className="text-base font-bold text-[var(--primary)] font-en">{streakData.longestStreak}</div>
                <div className="text-[9px] text-[var(--text-secondary)]">Best</div>
              </div>
            </div>
            <div className="flex items-center gap-1 justify-center">
              {streakData.badges.map((badge, index) => (
                <div 
                  key={index}
                  className="p-1 bg-[var(--background)] rounded-md"
                  title={badge.label}
                >
                  {badge.icon}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}