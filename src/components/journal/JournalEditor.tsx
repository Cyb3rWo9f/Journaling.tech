'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { Save, Calendar, Smile, Meh, Frown, Heart, Zap, AlertCircle, PenTool, Laugh, Coffee, Sun, Cloud, Star, Sparkles, ThumbsUp, Music, Target, Lightbulb, Battery, Flame, Angry, CloudRain } from 'lucide-react'
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
      setContent(entry.content || '')
      setMood(entry.mood)
    } else {
      // Reset for new entry
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
    console.log('Content length:', cleanContent.length)
    console.log('Extracted tags:', tags)
    console.log('Entry exists:', !!entry)

    setIsSaving(true)
    try {
      if (entry) {
        // Update existing entry
        const updatedEntry = { ...entry, content: cleanContent, mood, tags }
        await updateEntry(updatedEntry)
        console.log('✅ Entry updated successfully:', entry.id)
        onSave?.(updatedEntry)
      } else {
        // Create new entry - no title needed
        const savedEntry = await createEntry('', cleanContent, mood, tags)
        console.log('✅ Entry created successfully:', savedEntry.id)
        onSave?.(savedEntry)
      }

      setLastSaved(new Date().toLocaleTimeString())
      
      // Small delay to show success message, then navigate
      setTimeout(() => {
        console.log('🔄 Redirecting to entries page...')
        router.push('/entries')
      }, 1000)
      
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
    { value: 'overwhelmed', icon: CloudRain, label: 'Swamped', color: 'text-gray-600' },
  ] as const

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 px-2 sm:px-0">
      {/* Main Editor - Takes 3 columns on large screens, full width on mobile */}
      <div className="lg:col-span-3 space-y-4 sm:space-y-6">
        {/* Main Editor Card */}
  <div className="overflow-hidden shadow-2xl bg-white dark:bg-[#0b0f13] border border-gray-200 dark:border-gray-800 rounded-3xl">
          <div className="p-0">
            {/* Header */}
            <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0b0f13]">
              <div className="flex flex-col space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-400/20 dark:to-purple-400/20 rounded-lg shadow-md backdrop-blur-sm">
                      <Calendar size={16} className="text-blue-500 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {entry ? 'Editing Entry' : "Today's Entry"}
                      </p>
                      <p className="text-base font-bold text-gray-800 dark:text-gray-200 font-['Space_Grotesk']">{formatDate(entry?.date || new Date())}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                    {lastSaved && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center space-x-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 dark:from-green-400/20 dark:to-emerald-400/20 px-3 py-1.5 rounded-full border border-green-200/50 dark:border-green-600/50 text-xs backdrop-blur-sm"
                      >
                        <motion.div 
                          className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <span className="font-medium text-green-700 dark:text-green-300 font-['Space_Grotesk']">Saved at {lastSaved}</span>
                      </motion.div>
                    )}
                    <motion.button
                      onClick={handleSave}
                      disabled={isSaving}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center justify-center space-x-2 sm:space-x-3 font-bold text-sm sm:text-base w-full sm:w-auto px-6 py-3 sm:py-4 rounded-xl transition-all duration-300 shadow-lg backdrop-blur-sm ${
                        isSaving
                          ? 'bg-gray-400 dark:bg-[#1f2326] text-white cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 text-white hover:shadow-xl hover:from-blue-600 hover:to-purple-600 dark:hover:from-blue-500 dark:hover:to-purple-500 border border-blue-300/50 dark:border-blue-600/50'
                      }`}
                      aria-label="Save Entry"
                    >
                      <motion.div
                        animate={{ rotate: isSaving ? 360 : 0 }}
                        transition={{ duration: 1, repeat: isSaving ? Infinity : 0, ease: "linear" }}
                      >
                        <Save size={16} className="sm:w-5 sm:h-5" />
                      </motion.div>
                      <span className="font-['Space_Grotesk'] tracking-wide">{isSaving ? 'Saving...' : 'Save Entry'}</span>
                    </motion.button>
                  </div>
                </div>

                {/* Mood Selector - Enhanced Mobile Design */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-gradient-to-r from-pink-500/20 to-red-500/20 dark:from-pink-400/20 dark:to-red-400/20 rounded-lg shadow-md">
                      <Heart size={14} className="text-pink-500 dark:text-pink-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 font-['Space_Grotesk']">How are you feeling?</p>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-8 gap-2">
                    {moodOptions.map(({ value, icon: Icon, label, color }) => (
                      <motion.button
                        key={value}
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setMood(mood === value ? undefined : value)}
                        className={`relative flex flex-col items-center justify-center space-y-1 p-2 sm:p-2.5 rounded-xl transition-all duration-300 min-h-[60px] sm:min-h-[65px] ${
                          mood === value 
                            ? 'bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 text-white shadow-lg transform scale-[1.02] ring-2 ring-purple-400/50 dark:ring-purple-500/50' 
                            : 'bg-white dark:bg-[#0b0f13] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 hover:shadow-md border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <motion.div
                          animate={{ 
                            rotate: mood === value ? [0, 5, -5, 0] : 0,
                            scale: mood === value ? [1, 1.05, 1] : 1
                          }}
                          transition={{ 
                            duration: 0.4, 
                            repeat: mood === value ? Infinity : 0, 
                            repeatDelay: 3 
                          }}
                          className="flex items-center justify-center"
                        >
                          <Icon size={18} className={`${mood === value ? 'text-white' : color} transition-all duration-300`} />
                        </motion.div>
                        <span className="text-[8px] sm:text-[9px] md:text-[10px] leading-tight text-center font-medium font-['Space_Grotesk'] tracking-wide">
                          {label}
                        </span>
                        
                        {/* Active glow effect */}
                        {mood === value && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute inset-0 rounded-xl bg-purple-500/20 blur-sm -z-10"
                          />
                        )}
                        
                        {/* Hover ripple effect */}
                        <motion.div
                          className="absolute inset-0 rounded-2xl bg-blue-500/10 dark:bg-blue-400/10"
                          initial={{ scale: 0, opacity: 0 }}
                          whileTap={{ 
                            scale: 1.2, 
                            opacity: [0, 0.3, 0],
                            transition: { duration: 0.4 }
                          }}
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Editor */}
            <div className="relative bg-white dark:bg-[#0b0f13]">
              <TextareaAutosize
                placeholder="Begin documenting your thoughts and experiences. Use hashtags to categorize your entries for better organization. Reflect on the events of your day, your accomplishments, challenges you faced, lessons learned, and moments of gratitude. Consider what brought you joy, what you would like to improve, and your goals for tomorrow."
                onChange={handleContentChange}
                minRows={10}
                className="w-full p-4 sm:p-6 lg:p-8 bg-white dark:bg-[#0b0f13] border-none outline-none resize-none text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-500 leading-relaxed text-base sm:text-lg font-['Space_Grotesk'] tracking-wide focus:placeholder:text-gray-400 dark:focus:placeholder:text-gray-600 transition-colors"
                style={{ 
                  fontSize: '16px',
                  lineHeight: '1.7',
                  fontWeight: '400'
                }}
              />

              {/* Hashtag Suggestions */}
              {showHashtagSuggestions && getHashtagSuggestions(hashtagQuery).length > 0 && (
                <div 
                  className="absolute top-16 left-3 z-50 bg-white dark:bg-[#0f1214] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-w-xs"
                >
                  <div className="p-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-2">
                      Hashtag suggestions
                    </div>
                    {getHashtagSuggestions(hashtagQuery).map((tag, index) => (
                      <button
                        key={tag}
                        onClick={() => insertHashtag(tag)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center gap-2"
                      >
                        <span className="text-blue-500">#</span>
                        <span className="text-gray-900 dark:text-gray-100">{tag}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Word Count */}
              {content.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-4 right-4 bg-[var(--surface)]/80 backdrop-blur-sm px-3 py-1 rounded-lg border border-[var(--border)] sm:static sm:mt-2 sm:ml-0 sm:w-full sm:text-center"
                >
                  <span className="text-xs text-[var(--text-secondary)]">
                    {content.split(' ').filter(word => word.length > 0).length} words
                  </span>
                </motion.div>
              )}

              {/* Tags Display */}
              {currentTags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--secondary)]/5 rounded-xl border border-[var(--border)]"
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="p-1 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--secondary)]/20 rounded-lg">
                      <Target size={14} className="text-[var(--primary)]" />
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">Tags in this entry:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentTags.map((tag, index) => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 text-[var(--primary)] rounded-full text-sm font-medium border border-[var(--primary)]/20"
                      >
                        #{tag}
                      </motion.span>
                    ))}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-2 opacity-70">
                    💡 Hashtags will be saved as tags and removed from your journal content automatically
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Takes 1 column on large screens, full width on mobile */}
      <div className="lg:col-span-1 space-y-4 sm:space-y-6">
      {/* Mobile-Enhanced Widgets */}
      <div className="space-y-4">
        {/* Weather Widget - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Mobile weather widget - with more space from bottom navigation */}
          <div className="md:hidden mb-32">
            <MobileWeatherWidget className="h-auto max-h-80" />
          </div>
          {/* Desktop weather widget */}
          <div className="hidden md:block">
            <WeatherWidget size="sm" />
          </div>
        </motion.div>
      </div>
      </div>
    </div>
  )
}