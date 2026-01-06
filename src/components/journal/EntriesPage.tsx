'use client'

import React, { useEffect, useState, useMemo, useRef, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Calendar, Tag, Filter, Plus, Edit3, Trash2, Heart, Smile, Meh, Frown, 
  AlertCircle, ChevronDown, Eye, X, PenTool, Sparkles, Laugh, Flame, Lightbulb,
  Sun, ThumbsUp, Target, Coffee, Battery, Cloud, Music, Angry, CloudRain, Zap
} from 'lucide-react'
import { useRouter } from 'next/router'
import { useJournal } from '@/context/JournalContext'
import { JournalEntry } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { formatDate } from '@/utils'

// Enhanced mood configuration with proper icons
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

// Helper function to get mood info - defined outside component for global access
const getMoodInfo = (mood?: string) => {
  if (!mood || !moodConfig[mood]) {
    return { icon: Meh, color: 'text-gray-400', bgColor: 'bg-gray-400' }
  }
  return moodConfig[mood]
}

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
      
      // Scroll to the highlighted entry after a short delay
      setTimeout(() => {
        const element = document.getElementById(`entry-${highlight}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 300)
      
      // Clear highlight after 5 seconds (longer for better visibility)
      const timer = setTimeout(() => {
        setHighlightedEntry(null)
        // Remove highlight from URL
        router.replace('/entries', undefined, { shallow: true })
      }, 5000)
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading entries...</p>
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
    <div className="pb-0 md:pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Your Journal Entries
            </h1>
            <p className="text-[var(--text-secondary)] mt-1 text-sm">
              <span className="font-en">{entries.length}</span> {entries.length === 1 ? 'entry' : 'entries'} • <span className="font-en">{filteredEntries.length}</span> shown
            </p>
          </div>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => router.push('/')}
            className="w-full sm:w-auto"
          >
            <Plus size={16} />
            <span>New Entry</span>
          </Button>
        </div>

        {/* Filters Card */}
        <Card className="p-4 sm:p-5 shadow-sm">
          <div className="space-y-4">
            {/* Mobile Filter Title */}
            <div className="sm:hidden flex items-center gap-2">
              <Filter size={14} className="text-[var(--primary)]" />
              <p className="text-sm font-medium text-[var(--text-primary)]">Filter & Search</p>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--background)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 text-sm transition-all"
              />
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Mood Filter */}
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
                icon={<Smile size={16} className="text-[var(--primary)]" />}
              />

              {/* Tag Filter */}
              {allTags.length > 0 && (
                <CustomSelect
                  label="Tags"
                  value={selectedTag}
                  onChange={(value) => setSelectedTag(value)}
                  options={[
                    { value: "", label: "All Tags" },
                    ...allTags.map(tag => ({ value: tag, label: `#${tag}` }))
                  ]}
                  icon={<Tag size={16} className="text-[var(--secondary)]" />}
                />
              )}

              {/* Sort */}
              <CustomSelect
                label="Sort By"
                value={sortBy}
                onChange={(value) => setSortBy(value as any)}
                options={[
                  { value: "newest", label: "Newest First" },
                  { value: "oldest", label: "Oldest First" },
                  { value: "mood", label: "By Mood" }
                ]}
                icon={<Filter size={16} className="text-[var(--text-secondary)]" />}
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Entries Grid */}
      {filteredEntries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 px-6 rounded-2xl bg-[var(--background)] shadow-sm"
        >
          <div className="mb-6 p-4 bg-[var(--primary)]/10 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
            <Edit3 size={32} className="text-[var(--primary)]" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            {entries.length === 0 ? 'No Entries Yet' : 'No Results Found'}
          </h3>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
            {entries.length === 0 
              ? 'Start your journaling journey by writing your first entry.' 
              : 'Try adjusting your search or filters.'}
          </p>
          {entries.length === 0 && (
            <Button variant="primary" onClick={() => window.history.back()}>
              <PenTool size={16} />
              <span>Start Writing</span>
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 sm:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
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

interface EntryCardProps {
  entry: JournalEntry
  index: number
  isHighlighted?: boolean
}

const EntryCard = forwardRef<HTMLDivElement, EntryCardProps>(
  function EntryCard({ entry, index, isHighlighted = false }, ref) {
  const { deleteEntry } = useJournal()
  const router = useRouter()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    try {
      console.log('🗑️ Deleting entry:', entry.id)
      await deleteEntry(entry.id)
      console.log('✅ Entry deleted successfully')
      setShowDeleteModal(false)
    } catch (error) {
      console.error('Failed to delete entry:', error)
      throw error // Re-throw so the modal knows it failed
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push({
      pathname: '/',
      query: { edit: entry.id }
    })
  }

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowViewModal(true)
  }

  const handleViewInsight = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/insights?highlight=${entry.id}`)
  }

  const moodInfo = getMoodInfo(entry.mood)
  const MoodIcon = moodInfo.icon
  const moodColor = moodInfo.color

  return (
    <motion.div
      ref={ref}
      id={`entry-${entry.id}`}
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isHighlighted ? [1, 1.02, 1] : 1
      }}
      exit={{ 
        opacity: 0, 
        scale: 0.9, 
        y: -10,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      transition={{ 
        delay: index * 0.05, 
        duration: 0.3,
        layout: { type: "spring", stiffness: 300, damping: 30 },
        scale: isHighlighted ? { duration: 0.5, repeat: 2 } : {}
      }}
      className="group relative"
    >
      {/* Animated glow effect for highlighted entry */}
      {isHighlighted && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute -inset-1 bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--primary)] rounded-2xl blur-md"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -inset-0.5 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-xl"
          />
        </>
      )}
      
      <Card className={`h-full transition-all duration-300 cursor-pointer relative overflow-hidden ${
        isHighlighted 
          ? 'ring-2 ring-[var(--primary)] shadow-2xl shadow-[var(--primary)]/30 bg-[var(--surface-elevated)]' 
          : 'hover:shadow-md hover:-translate-y-0.5'
      }`}>
        <CardContent className="p-4 sm:p-5 relative">
          {isHighlighted && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="absolute -top-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white text-xs font-bold rounded-full shadow-lg"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles size={12} />
              </motion.div>
              <span>From Insights</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                ✨
              </motion.div>
            </motion.div>
          )}

          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center flex-wrap gap-2 mb-2">
                <Calendar size={12} className="text-[var(--text-secondary)]" />
                <span className="text-xs text-[var(--text-secondary)] font-en">
                  {formatDate(entry.date)}
                </span>
                {MoodIcon && (
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${moodColor} ${moodInfo.bgColor}/15`}>
                    <MoodIcon size={12} />
                    <span className="capitalize">{entry.mood || ''}</span>
                  </span>
                )}
              </div>
              {entry.title && (
                <h3 className="font-semibold text-[var(--text-primary)] text-sm sm:text-base line-clamp-1">
                  {entry.title}
                </h3>
              )}
            </div>
          </div>

          {/* Content Preview */}
          <p className="text-[var(--text-secondary)] text-sm line-clamp-3 mb-4 leading-relaxed font-en">
            {entry.content}
          </p>

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {entry.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded-md text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
              {entry.tags.length > 3 && (
                <span className="text-xs text-[var(--text-secondary)]">
                  +{entry.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3">
            <span className="text-xs text-[var(--text-secondary)]">
              <span className="font-en">{entry.content.split(' ').length}</span> words
            </span>
            
            {/* Action Buttons - Always visible on mobile, hover on desktop */}
            <div className="flex gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
              <motion.button 
                onClick={handleViewInsight}
                className="p-1.5 sm:p-2 rounded-lg bg-[var(--background)] hover:bg-purple-500/10 transition-colors"
                title="View Insight"
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles size={14} className="text-[var(--text-secondary)] hover:text-purple-500" />
              </motion.button>
              <motion.button 
                onClick={handleView}
                className="p-1.5 sm:p-2 rounded-lg bg-[var(--background)] hover:bg-[var(--primary)]/10 transition-colors"
                title="View Entry"
                whileTap={{ scale: 0.95 }}
              >
                <Eye size={14} className="text-[var(--text-secondary)] hover:text-[var(--primary)]" />
              </motion.button>
              <motion.button 
                onClick={handleEdit}
                className="p-1.5 sm:p-2 rounded-lg bg-[var(--background)] hover:bg-[var(--secondary)]/10 transition-colors"
                title="Edit"
                whileTap={{ scale: 0.95 }}
              >
                <Edit3 size={14} className="text-[var(--text-secondary)] hover:text-[var(--secondary)]" />
              </motion.button>
              <motion.button 
                onClick={handleDeleteClick}
                className="p-1.5 sm:p-2 rounded-lg bg-[var(--background)] hover:bg-red-500/10 transition-colors"
                title="Delete"
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 size={14} className="text-[var(--text-secondary)] hover:text-red-500" />
              </motion.button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Entry"
        message="Are you sure you want to delete this entry? This action cannot be undone."
        confirmText="Delete Entry"
        cancelText="Cancel"
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--background)] rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 bg-[var(--surface-elevated)]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Calendar size={14} />
                    <span className="text-sm font-en">{formatDate(entry.date)}</span>
                  </div>
                  {MoodIcon && (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${moodColor} ${moodInfo.bgColor}/15`}>
                      <MoodIcon size={14} />
                      <span className="capitalize">{entry.mood || ''}</span>
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors"
                >
                  <X size={18} className="text-[var(--text-secondary)]" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
                {entry.title && (
                  <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 font-en">
                    {entry.title}
                  </h2>
                )}
                
                <p className="text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap font-en">
                  {entry.content}
                </p>

                {/* Tags */}
                {entry.tags && entry.tags.length > 0 && (
                  <div className="mt-6 pt-4">
                    <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full text-sm font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 bg-[var(--surface-elevated)] flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">
                  <span className="font-en">{entry.content.split(' ').length}</span> words
                </span>
                <Button variant="primary" onClick={handleEdit}>
                  <Edit3 size={14} />
                  <span>Edit Entry</span>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})