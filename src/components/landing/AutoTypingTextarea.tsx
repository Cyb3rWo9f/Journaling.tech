import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Clock, Plus, Search, Smile, Heart, Meh, Eye, Edit3 } from 'lucide-react'

interface AutoTypingTextareaProps {
  currentView: 'write' | 'entries'
  onNavigationSwitch: (view: 'write' | 'entries') => void
}

// Journal entries data
export const journalEntries = [
  "Reflecting on career decisions and future goals. The promotion opportunity requires relocating to another city. Weighing the professional growth against leaving established relationships here.\n\nNeed to consider long-term implications. Financial benefits are significant but personal cost is substantial. Family input will be crucial in this decision.\n\n#career #decisions #future #growth",
  
  "Attended therapy session today. Working through anxiety patterns that have affected my work performance. Therapist suggested cognitive behavioral techniques for managing overwhelming thoughts.\n\nProgress feels slow but meaningful. Small improvements in daily stress management are becoming noticeable. Investing in mental health is proving worthwhile.\n\n#mentalhealth #therapy #anxiety #progress",
  
  "Mother's health diagnosis has changed family dynamics significantly. Taking on more responsibilities while managing my own emotional response. Learning to balance caregiving with personal boundaries.\n\nResearching treatment options and support systems. Grateful for healthcare resources but navigating insurance complexities is challenging. Family strength is being tested and revealed.\n\n#family #health #responsibility #resilience"
]

// Enhanced Auto-typing textarea component - Smooth transitions
export function AutoTypingTextarea({ currentView, onNavigationSwitch }: AutoTypingTextareaProps) {
  const [displayText, setDisplayText] = useState('')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [hasAutoSaved, setHasAutoSaved] = useState(false)
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0)
  
  // Function to handle auto-save and navigation switch
  const handleAutoSaveAndSwitch = () => {
    // Trigger save button animation
    const saveButton = document.querySelector('.demo-save-button')
    if (saveButton) {
      saveButton.classList.add('animate-pulse', 'bg-green-500')
      setTimeout(() => {
        saveButton.classList.remove('animate-pulse', 'bg-green-500')
      }, 1000)
    }
    
    // Switch navigation to Entries tab after save
    setTimeout(() => {
      const entriesButton = document.querySelector('.demo-entries-button')
      const writeButton = document.querySelector('.demo-write-button')
      if (entriesButton && writeButton) {
        writeButton.classList.remove('bg-[var(--primary)]', 'text-white')
        writeButton.classList.add('text-[var(--text-secondary)]', 'hover:text-[var(--primary)]')
        
        entriesButton.classList.add('bg-[var(--primary)]', 'text-white')
        entriesButton.classList.remove('text-[var(--text-secondary)]', 'hover:text-[var(--primary)]')
      }
      
      // Switch to entries view
      onNavigationSwitch('entries')
    }, 1500)
  }

  useEffect(() => {
    if (isTransitioning) return
    
    let currentIndex = 0
    const fullText = journalEntries[currentEntryIndex]
    const typingSpeed = 35 // Smooth typing speed
    
    const timer = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        // Trigger auto-save and navigation switch on first completion
        if (!hasAutoSaved) {
          setTimeout(() => {
            handleAutoSaveAndSwitch()
            setHasAutoSaved(true)
          }, 1000)
        }
        
        // Keep text displayed, then fade transition to next entry
        setTimeout(() => {
          setIsTransitioning(true)
          // Fade out current text
          setTimeout(() => {
            setDisplayText('')
            setCurrentEntryIndex((prev) => (prev + 1) % journalEntries.length)
            setIsTransitioning(false)
          }, 500) // Fade duration
        }, 4000) // Display time
      }
    }, typingSpeed)
    
    return () => clearInterval(timer)
  }, [currentEntryIndex, isTransitioning, hasAutoSaved])

  // Auto-scroll functionality
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  useEffect(() => {
    if (textareaRef.current) {
      // Auto-scroll to bottom as text is typed
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight
    }
  }, [displayText])

  // Render entries view - Full page layout like main website
  if (currentView === 'entries') {
    return (
      <div className="min-h-[400px] sm:min-h-[450px] bg-[var(--background)] rounded-xl overflow-hidden">
        {/* Header - matching main website */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 px-3 py-4"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent font-['Space_Grotesk'] tracking-tight">
                Your Journal Entries
              </h1>
              <p className="text-[var(--text-secondary)] mt-1 text-xs sm:text-sm">
                3 entries • 3 shown
              </p>
            </div>
            <button className="flex items-center gap-2 w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-2 px-3 text-xs rounded-lg">
              <Plus size={14} />
              <span className="font-['Space_Grotesk'] tracking-wide">New Entry</span>
            </button>
          </div>

          {/* Filters - Compact version */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 mb-4">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-1.5 flex-1 min-w-32">
                <Search size={14} className="text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search entries..." 
                  className="bg-transparent text-xs flex-1 outline-none text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                  readOnly
                />
              </div>
              <select className="bg-gray-50 dark:bg-gray-800/50 border-0 rounded-lg px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none">
                <option>All Moods</option>
                <option>Happy</option>
                <option>Focused</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Entries Grid - Matching main website layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-3"
        >
          {journalEntries.map((entry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="bg-white dark:bg-gray-800/20 border border-gray-200 dark:border-gray-700/40 rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all duration-300 hover:border-[var(--primary)]/30">
                {/* Entry Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {/* Mood Icon */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                      {index === 0 ? (
                        <Smile size={16} className="text-green-500" />
                      ) : index === 1 ? (
                        <Heart size={16} className="text-purple-500" />
                      ) : (
                        <Meh size={16} className="text-blue-500" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        {index === 0 ? 'Today, 2:30 PM' : index === 1 ? 'Yesterday, 8:15 PM' : 'Sep 22, 11:45 AM'}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] opacity-75">
                        {entry.split(' ').length} words
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-6 h-6 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors">
                      <Eye size={12} className="text-[var(--text-secondary)]" />
                    </button>
                    <button className="w-6 h-6 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors">
                      <Edit3 size={12} className="text-[var(--text-secondary)]" />
                    </button>
                  </div>
                </div>

                {/* Entry Content Preview */}
                <div className="mb-3">
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed font-['Space_Grotesk'] line-clamp-4">
                    {entry.split('\n')[0].substring(0, 150)}...
                  </p>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-1 flex-wrap">
                  {entry.match(/#\w+/g)?.slice(0, 3).map((tag, tagIndex) => (
                    <span 
                      key={tagIndex} 
                      className="bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-1 rounded-md text-xs font-medium hover:bg-[var(--primary)]/20 transition-colors cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                  {entry.match(/#\w+/g)?.length && entry.match(/#\w+/g)!.length > 3 && (
                    <span className="text-xs text-[var(--text-secondary)] ml-1">
                      +{entry.match(/#\w+/g)!.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    )
  }

  // Render write view (default)
  return (
    <div className="relative bg-gradient-to-br from-white to-gray-50/30 dark:bg-gradient-to-br dark:from-[#0b0f13] dark:to-[#0f1419] rounded-xl border border-gray-200/60 dark:border-gray-700/40 overflow-hidden shadow-inner backdrop-blur-sm">
      {/* Header bar like main app - Enhanced Theme Colors */}
      <div className="flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-gray-50/80 to-gray-100/60 dark:from-gray-800/20 dark:to-gray-700/30 border-b border-gray-200/70 dark:border-gray-600/40 backdrop-blur-sm">
        <div className="flex items-center gap-1 sm:gap-2 text-xs text-[var(--text-secondary)]">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[var(--primary)] animate-pulse shadow-sm"></div>
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[var(--accent)] animate-pulse delay-100 shadow-sm"></div>
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[var(--secondary)] animate-pulse delay-200 shadow-sm"></div>
          <span className="ml-1 sm:ml-2 font-medium text-xs text-[var(--text-primary)]">New Entry</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 text-xs text-[var(--text-secondary)]">
          <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-spin text-[var(--primary)]" style={{ animationDuration: '4s' }} />
          <span className="font-medium text-xs text-[var(--text-primary)]">Live Demo</span>
        </div>
      </div>
      
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={displayText}
          placeholder="Begin documenting your thoughts and experiences. Use hashtags to categorize your entries for better organization. Reflect on the events of your day, your accomplishments, challenges you faced, lessons learned, and moments of gratitude. Consider what brought you joy, what you would like to improve, and your goals for tomorrow..."
          className={`w-full h-32 sm:h-40 lg:h-48 p-1.5 sm:p-2 lg:p-3 bg-gradient-to-br from-white to-gray-50/50 dark:bg-gradient-to-br dark:from-[#0b0f13] dark:to-[#0f1419] border-none outline-none resize-none text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/70 dark:placeholder:text-[var(--text-secondary)]/60 leading-relaxed text-xs sm:text-sm font-['Space_Grotesk'] tracking-wide focus:placeholder:text-[var(--text-secondary)]/50 dark:focus:placeholder:text-[var(--text-secondary)]/40 scrollbar-thin scrollbar-thumb-[var(--primary)]/20 dark:scrollbar-thumb-[var(--secondary)]/30 scrollbar-track-transparent hover:scrollbar-thumb-[var(--primary)]/30 dark:hover:scrollbar-thumb-[var(--secondary)]/40 selection:bg-[var(--primary)]/20 dark:selection:bg-[var(--secondary)]/20 transition-opacity duration-500 ease-in-out ${
            isTransitioning ? 'opacity-30' : 'opacity-100'
          }`}
          readOnly
          style={{ 
            lineHeight: '1.7',
            fontWeight: '400',
            scrollbarWidth: 'thin',
            caretColor: 'transparent'
          }}
        />
        
        {/* Enhanced word count and status bar */}
        <div className="absolute bottom-3 right-3 flex items-center gap-3 text-xs bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-1.5">
            <motion.div 
              className="w-1.5 h-1.5 bg-green-500 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-green-600 dark:text-green-400 font-medium">Typing...</span>
          </div>
          <span className="text-gray-400">•</span>
          <span className="text-gray-600 dark:text-gray-300 font-medium">{displayText.split(' ').filter(word => word.length > 0).length} words</span>
        </div>
      </div>
    </div>
  )
}
