'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Calendar, Tag, Filter, Plus, Edit3, Trash2, Heart, Smile, Meh, Frown, AlertCircle, ChevronDown, Eye, X, PenTool } from 'lucide-react'
import { useRouter } from 'next/router'
import { useJournal } from '@/context/JournalContext'
import { JournalEntry } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { formatDate } from '@/utils'

export function EntriesPage() {
  const { entries, isLoading, error, loadEntries } = useJournal()
  const router = useRouter()
  const { highlight } = router.query
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMood, setSelectedMood] = useState<string>('')
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mood'>('newest')
  const [highlightedEntry, setHighlightedEntry] = useState<string | null>(null)

  // Handle highlighting entry from URL parameter
  useEffect(() => {
    if (highlight && typeof highlight === 'string') {
      setHighlightedEntry(highlight)
      // Clear highlight after 3 seconds
      const timer = setTimeout(() => {
        setHighlightedEntry(null)
        // Remove highlight from URL
        router.replace('/entries', undefined, { shallow: true })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [highlight, router])

  // Get all unique tags from entries (memoized)
  const allTags = useMemo(() => 
    [...new Set(entries.flatMap(entry => entry.tags || []))],
    [entries]
  )

  // Filter and sort entries (memoized for performance)
  const filteredEntries = useMemo(() => {
    return entries
      .filter(entry => {
        const matchesSearch = 
          entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          false
        
        const matchesMood = selectedMood === '' || entry.mood === selectedMood
        
        const matchesTag = selectedTag === '' || (entry.tags || []).includes(selectedTag)
        
        return matchesSearch && matchesMood && matchesTag
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          case 'mood':
            return (a.mood || '').localeCompare(b.mood || '')
          default:
            return 0
        }
      })
  }, [entries, searchTerm, selectedMood, selectedTag, sortBy])

  const moodIcons = useMemo(() => ({
    joyful: { icon: Smile, color: 'text-yellow-500' },
    happy: { icon: Smile, color: 'text-green-500' },
    grateful: { icon: Heart, color: 'text-pink-500' },
    excited: { icon: Smile, color: 'text-orange-500' },
    energetic: { icon: Smile, color: 'text-red-500' },
    inspired: { icon: Heart, color: 'text-purple-500' },
    peaceful: { icon: Meh, color: 'text-blue-300' },
    content: { icon: Meh, color: 'text-blue-500' },
    motivated: { icon: Smile, color: 'text-indigo-500' },
    relaxed: { icon: Meh, color: 'text-green-300' },
    creative: { icon: Heart, color: 'text-purple-400' },
    focused: { icon: Meh, color: 'text-gray-500' },
    neutral: { icon: Meh, color: 'text-gray-400' },
    tired: { icon: Frown, color: 'text-gray-600' },
    stressed: { icon: AlertCircle, color: 'text-yellow-600' },
    anxious: { icon: AlertCircle, color: 'text-orange-500' },
    melancholy: { icon: Frown, color: 'text-blue-700' },
    sad: { icon: Frown, color: 'text-blue-600' },
    frustrated: { icon: AlertCircle, color: 'text-red-600' },
    overwhelmed: { icon: AlertCircle, color: 'text-red-700' },
  }), [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading your entries...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Error loading entries: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)] dark:bg-[#0b0f13] pb-24 md:pb-6 px-2 sm:px-4 md:px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 sm:mb-6 md:mb-8 px-1 sm:px-0"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 md:mb-6 space-y-3 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent font-['Space_Grotesk'] tracking-tight">
              Your Journal Entries
            </h1>
            <p className="text-[var(--text-secondary)] mt-1 sm:mt-2 text-xs sm:text-sm">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'} • {filteredEntries.length} shown
            </p>
          </div>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => window.history.back()}
            className="flex items-center gap-2 w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 dark:from-blue-600 dark:to-purple-600 dark:hover:from-blue-500 dark:hover:to-purple-500 border-blue-300/50 dark:border-blue-600/50 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-2 px-3 sm:py-2.5 sm:px-4 text-xs sm:text-sm"
          >
            <Plus size={14} />
            <span className="font-['Space_Grotesk'] tracking-wide">New Entry</span>
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-6 shadow-lg bg-white dark:bg-[#0b0f13] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="space-y-4">
            {/* Section Title - Mobile only */}
            <div className="sm:hidden flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-400/20 dark:to-purple-400/20 rounded-lg shadow-sm">
                <Filter size={14} className="text-blue-500 dark:text-blue-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 font-['Space_Grotesk']">Filter Entries</p>
            </div>
            
            {/* Search */}
            <div className="w-full">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 dark:text-blue-400" />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#0b0f13] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-800 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none text-sm sm:text-base shadow-sm transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-700"
                />
              </div>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Mood Filter */}
              <div className="relative">
                <CustomSelect
                  label="Mood"
                  value={selectedMood}
                  onChange={(value) => setSelectedMood(value)}
                  options={[
                    { value: "", label: "All Moods" },
                    { value: "joyful", label: "Joyful" },
                    { value: "happy", label: "Happy" },
                    { value: "grateful", label: "Grateful" },
                    { value: "excited", label: "Excited" },
                    { value: "energetic", label: "Energetic" },
                    { value: "inspired", label: "Inspired" },
                    { value: "peaceful", label: "Peaceful" },
                    { value: "content", label: "Content" },
                    { value: "motivated", label: "Motivated" },
                    { value: "relaxed", label: "Relaxed" },
                    { value: "creative", label: "Creative" },
                    { value: "focused", label: "Focused" },
                    { value: "neutral", label: "Neutral" },
                    { value: "tired", label: "Tired" },
                    { value: "stressed", label: "Stressed" },
                    { value: "anxious", label: "Anxious" },
                    { value: "melancholy", label: "Melancholy" },
                    { value: "sad", label: "Sad" },
                    { value: "frustrated", label: "Frustrated" },
                    { value: "overwhelmed", label: "Overwhelmed" }
                  ]}
                  icon={<Smile size={16} className="text-pink-500 dark:text-pink-400" />}
                  iconBgColor="bg-pink-100 dark:bg-pink-900/40"
                  chevronColor="text-pink-500 dark:text-pink-400"
                />
              </div>

              {/* Tag Filter */}
              {allTags.length > 0 && (
                <div className="relative">
                  <CustomSelect
                    label="Tag"
                    value={selectedTag}
                    onChange={(value) => setSelectedTag(value)}
                    options={[
                      { value: "", label: "All Tags" },
                      ...allTags.map(tag => ({ value: tag, label: `#${tag}` }))
                    ]}
                    icon={<Tag size={16} className="text-purple-500 dark:text-purple-400" />}
                    iconBgColor="bg-purple-100 dark:bg-purple-900/40"
                    chevronColor="text-purple-500 dark:text-purple-400"
                  />
                </div>
              )}

              {/* Sort */}
              <div className="relative">
                <CustomSelect
                  label="Sort By"
                  value={sortBy}
                  onChange={(value) => setSortBy(value as any)}
                  options={[
                    { value: "newest", label: "Newest First" },
                    { value: "oldest", label: "Oldest First" },
                    { value: "mood", label: "By Mood" }
                  ]}
                  icon={<Filter size={16} className="text-indigo-500 dark:text-indigo-400" />}
                  iconBgColor="bg-indigo-100 dark:bg-indigo-900/40"
                  chevronColor="text-indigo-500 dark:text-indigo-400"
                />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Entries Grid */}
      {filteredEntries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-8 sm:py-12 px-4 sm:px-6 rounded-2xl bg-gradient-to-br from-white/50 to-gray-100/50 dark:from-[#0b0f13]/50 dark:to-[#0b0f13] border border-gray-200/50 dark:border-gray-800/50 shadow-lg mx-2 sm:mx-0"
        >
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/5 dark:to-purple-500/5 rounded-full w-16 sm:w-24 h-16 sm:h-24 mx-auto flex items-center justify-center">
            <Edit3 size={32} className="mx-auto text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 font-['Space_Grotesk']">
            {entries.length === 0 ? 'No entries yet' : 'No entries match your filters'}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-md mx-auto">
            {entries.length === 0 
              ? 'Start your journaling journey by writing your first entry.' 
              : 'Try adjusting your search or filter criteria.'}
          </p>
          {entries.length === 0 && (
            <Button 
              variant="primary"
              onClick={() => window.history.back()}
              className="flex items-center gap-2 py-2 sm:py-3 px-4 sm:px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 dark:from-blue-600 dark:to-purple-600 dark:hover:from-blue-500 dark:hover:to-purple-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg sm:rounded-xl border border-blue-300/50 dark:border-blue-600/50"
            >
              <PenTool size={16} />
              <span className="font-['Space_Grotesk'] tracking-wide text-sm sm:text-base">Write Your First Entry</span>
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-1 sm:px-0"
        >
          <AnimatePresence mode="popLayout">
            {filteredEntries.map((entry, index) => (
              <EntryCard 
                key={entry.id} 
                entry={entry} 
                index={index} 
                isHighlighted={highlightedEntry === entry.id}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

function EntryCard({ entry, index, isHighlighted = false }: { entry: JournalEntry; index: number; isHighlighted?: boolean }) {
  const { deleteEntry } = useJournal()
  const router = useRouter()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showActions, setShowActions] = useState(false)
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteEntry(entry.id)
      // Entry will be removed from list automatically due to context state update
    } catch (error) {
      console.error('Failed to delete entry:', error)
      alert('Failed to delete entry. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Navigate to main page with entry data in query for editing
    router.push({
      pathname: '/',
      query: { edit: entry.id }
    })
  }

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowViewModal(true)
  }

  const moodIcons = {
    joyful: { icon: Smile, color: 'text-yellow-500' },
    happy: { icon: Smile, color: 'text-green-500' },
    grateful: { icon: Heart, color: 'text-pink-500' },
    excited: { icon: Smile, color: 'text-orange-500' },
    energetic: { icon: Smile, color: 'text-red-500' },
    inspired: { icon: Heart, color: 'text-purple-500' },
    peaceful: { icon: Meh, color: 'text-blue-300' },
    content: { icon: Meh, color: 'text-blue-500' },
    motivated: { icon: Smile, color: 'text-indigo-500' },
    relaxed: { icon: Meh, color: 'text-green-300' },
    creative: { icon: Heart, color: 'text-purple-400' },
    focused: { icon: Meh, color: 'text-gray-500' },
    neutral: { icon: Meh, color: 'text-gray-400' },
    tired: { icon: Frown, color: 'text-gray-600' },
    stressed: { icon: AlertCircle, color: 'text-yellow-600' },
    anxious: { icon: AlertCircle, color: 'text-orange-500' },
    melancholy: { icon: Frown, color: 'text-blue-700' },
    sad: { icon: Frown, color: 'text-blue-600' },
    frustrated: { icon: AlertCircle, color: 'text-red-600' },
    overwhelmed: { icon: AlertCircle, color: 'text-red-700' },
  } as const

  const MoodIcon = entry.mood && entry.mood in moodIcons ? moodIcons[entry.mood as keyof typeof moodIcons]?.icon : null
  const moodColor = entry.mood && entry.mood in moodIcons ? moodIcons[entry.mood as keyof typeof moodIcons]?.color : ''

  // Close mobile action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showActions) {
        setShowActions(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showActions]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
      className="group relative"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Highlight Glow Effect */}
      {isHighlighted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-purple-500/30 rounded-xl blur-sm"
        />
      )}
      
      {/* Hover Glow Effect */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ 
          opacity: isHovered ? 0.15 : 0,
          scale: isHovered ? 1 : 0.95 
        }}
        transition={{ duration: 0.3 }}
        className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/40 to-purple-500/40 rounded-xl blur-sm"
      />
      
      <Card className={`h-full transition-all duration-500 hover:shadow-lg hover:scale-[1.02] cursor-pointer relative overflow-hidden border border-gray-200 dark:border-gray-800 max-w-full ${
        isHighlighted 
          ? 'border-2 border-gradient-to-r from-blue-400 to-purple-400 shadow-2xl scale-[1.03] bg-gradient-to-br from-blue-50/80 via-purple-50/50 to-pink-50/80 dark:from-blue-900/20 dark:via-purple-900/15 dark:to-pink-900/20' 
          : 'shadow-md hover:shadow-xl bg-white dark:bg-[#0b0f13]'
      }`}>
        <CardContent className="p-4 sm:p-6 relative">
          {isHighlighted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              className="absolute -top-3 -right-3 flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-xl border-2 border-white"
            >
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✨
              </motion.span>
              <span>From Insights</span>
            </motion.div>
          )}
          
          {/* Sparkle Effects for Highlighted Entry */}
          {isHighlighted && (
            <>
              <motion.div
                className="absolute top-4 right-8 w-2 h-2 bg-yellow-400 rounded-full"
                animate={{ 
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  delay: 0.5 
                }}
              />
              <motion.div
                className="absolute bottom-8 left-8 w-1.5 h-1.5 bg-pink-400 rounded-full"
                animate={{ 
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  delay: 1.2 
                }}
              />
            </>
          )}
          {/* Header */}
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="flex-1">
              <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <Calendar size={12} className="text-[var(--text-secondary)]" />
                <span className="text-xs sm:text-sm text-[var(--text-secondary)]">
                  {formatDate(entry.date)}
                </span>
                {MoodIcon && (
                  <MoodIcon size={12} className={moodColor} />
                )}
              </div>
              {entry.title && (
                <h3 className="font-semibold text-[var(--text-primary)] text-sm sm:text-base mb-2 line-clamp-1">
                  {entry.title}
                </h3>
              )}
            </div>
          </div>

          {/* Content Preview */}
          <p className="text-[var(--text-secondary)] text-xs sm:text-sm line-clamp-3 sm:line-clamp-4 mb-3 sm:mb-4 leading-relaxed">
            {entry.content}
          </p>

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
              {entry.tags.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-600/10 dark:to-purple-600/10 text-blue-600 dark:text-blue-400 rounded-md text-[0.65rem] sm:text-xs font-medium border border-blue-300/20 dark:border-blue-600/20"
                >
                  #{tag}
                </span>
              ))}
              {entry.tags.length > 2 && (
                <span className="text-[0.65rem] sm:text-xs text-[var(--text-secondary)]">
                  +{entry.tags.length - 2} more
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-800">
            <span className="text-[0.65rem] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">
              {entry.content.split(' ').length} words
            </span>
            
            {/* Desktop Actions (hover) */}
            <div className="hidden sm:flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-0 group-hover:-translate-y-1">
              <motion.button 
                onClick={handleView}
                className="p-1.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-600/10 dark:to-purple-600/10 hover:from-blue-500/20 hover:to-purple-500/20 dark:hover:from-blue-600/20 dark:hover:to-purple-600/20 rounded-full transition-all duration-300 border border-blue-300/20 dark:border-blue-600/20"
                title="View full entry"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Eye size={14} className="text-blue-600 dark:text-blue-400" />
              </motion.button>
              <motion.button 
                onClick={handleEdit}
                className="p-1.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-600/10 dark:to-pink-600/10 hover:from-purple-500/20 hover:to-pink-500/20 dark:hover:from-purple-600/20 dark:hover:to-pink-600/20 rounded-full transition-all duration-300 border border-purple-300/20 dark:border-purple-600/20"
                title="Edit entry"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Edit3 size={14} className="text-purple-600 dark:text-purple-400" />
              </motion.button>
              <motion.button 
                onClick={handleDeleteClick}
                className="p-1.5 bg-red-500/10 dark:bg-red-600/10 hover:bg-red-500/20 dark:hover:bg-red-600/20 rounded-full transition-all duration-300 border border-red-300/20 dark:border-red-600/20"
                title="Delete entry"
                disabled={isDeleting}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Trash2 size={14} className={`text-red-600 dark:text-red-400 ${isDeleting ? 'opacity-50' : ''}`} />
              </motion.button>
            </div>
            
            {/* Mobile Actions Buttons */}
            <div className="sm:hidden flex items-center gap-1.5">
              {/* View Button */}
              <motion.button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleView(e);
                }}
                className="p-1 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/40 rounded-full transition-all duration-300 border border-blue-300/50 dark:border-blue-700/50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="View entry"
              >
                <Eye size={12} className="text-blue-600 dark:text-blue-400" />
              </motion.button>
              
              {/* Edit Button */}
              <motion.button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(e);
                }}
                className="p-1 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/40 rounded-full transition-all duration-300 border border-purple-300/50 dark:border-purple-700/50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Edit entry"
              >
                <Edit3 size={12} className="text-purple-600 dark:text-purple-400" />
              </motion.button>
              
              {/* Delete Button */}
              <motion.button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(e);
                }}
                className="p-1 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/40 rounded-full transition-all duration-300 border border-red-300/50 dark:border-red-700/50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Delete entry"
                disabled={isDeleting}
              >
                <Trash2 size={12} className={`text-red-600 dark:text-red-400 ${isDeleting ? "opacity-50" : ""}`} />
              </motion.button>
              
              {/* Mobile Action Menu */}
              {showActions && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-40"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActions(false);
                    }}
                  />
                  
                  {/* Menu */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="fixed bottom-16 right-4 bg-white dark:bg-[#0b0f13] rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 p-2 z-50"
                  >
                  <div className="flex flex-col gap-2 min-w-[150px]">
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Entry Actions</h4>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(e);
                        setShowActions(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors whitespace-nowrap"
                    >
                      <Eye size={16} className="text-blue-500 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">View</span>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(e);
                        setShowActions(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md transition-colors whitespace-nowrap"
                    >
                      <Edit3 size={16} className="text-purple-500 dark:text-purple-400" />
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Edit</span>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(e);
                        setShowActions(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors whitespace-nowrap"
                      disabled={isDeleting}
                    >
                      <Trash2 size={16} className="text-red-500 dark:text-red-400" />
                      <span className="text-sm font-medium text-red-600 dark:text-red-400">Delete</span>
                    </button>
                    
                    <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowActions(false);
                        }}
                        className="flex items-center justify-center w-full px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/40 rounded-md transition-colors"
                      >
                        <X size={16} className="text-gray-500 dark:text-gray-400" />
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-2">Close</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Journal Entry"
        message="Are you sure you want to delete this journal entry? This action cannot be undone and all content will be permanently removed."
        confirmText="Delete Entry"
        cancelText="Keep Entry"
        type="danger"
      />

      {/* View Modal */}
      <AnimatePresence>
        {showViewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#0b0f13] rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden border border-gray-200 dark:border-gray-800 m-2"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border)]">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-[var(--text-secondary)]" />
                    <span className="text-xs sm:text-sm text-[var(--text-secondary)]">
                      {formatDate(entry.date)}
                    </span>
                  </div>
                  {MoodIcon && (
                    <div className="flex items-center gap-1 sm:gap-2">
                      <MoodIcon size={16} className={moodColor} />
                      <span className={`text-xs sm:text-sm font-medium capitalize ${moodColor}`}>
                        {entry.mood}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-1.5 sm:p-2 hover:bg-[var(--background)] rounded-lg transition-colors"
                >
                  <X size={18} className="text-[var(--text-secondary)]" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
                {entry.title && (
                  <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-3 sm:mb-4">
                    {entry.title}
                  </h2>
                )}
                
                <div className="prose prose-sm max-w-none">
                  <p className="text-[var(--text-primary)] text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                    {entry.content}
                  </p>
                </div>

                {/* Tags */}
                {entry.tags && entry.tags.length > 0 && (
                  <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-[var(--border)]">
                    <h4 className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] mb-2 sm:mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {entry.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-600/10 dark:to-purple-600/10 text-blue-600 dark:text-blue-400 rounded-full text-xs sm:text-sm font-medium border border-blue-300/20 dark:border-blue-600/20 hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0b0f13] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs sm:text-sm text-[var(--text-secondary)] order-2 sm:order-1">
                  {entry.content.split(' ').length} words • Created {formatDate(entry.createdAt)}
                </span>
                <div className="flex gap-2 order-1 sm:order-2">
                  <motion.button
                    onClick={handleEdit}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 hover:from-blue-600 hover:to-purple-600 dark:hover:from-blue-500 dark:hover:to-purple-500 text-white font-medium text-xs sm:text-sm transition-all duration-300 shadow-lg hover:shadow-xl border border-blue-300/50 dark:border-blue-600/50 w-full sm:w-auto justify-center"
                  >
                    <Edit3 size={14} />
                    <span className="font-['Space_Grotesk'] tracking-wide">Edit Entry</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}