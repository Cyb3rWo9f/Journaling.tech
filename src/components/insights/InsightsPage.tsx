'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/router'
import { Calendar, Clock, TrendingUp, BarChart3, Heart, Tag, Sparkles, ArrowRight, Eye, PenSquare } from 'lucide-react'
import { useJournal } from '@/context/JournalContext'
import { JournalEntry, WeeklySummary, EntrySummary } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import { formatDate, formatTime } from '@/utils'

// Custom styles for animations and effects
const customStyles = `
  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  .bg-300\\% {
    background-size: 300% 300%;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`

export function InsightsPage() {
  const { entries, entrySummaries, isLoading, generateEntrySummary } = useJournal()
  const router = useRouter()
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([])
  const [pairedTimelineItems, setPairedTimelineItems] = useState<Array<{entry: JournalEntry, summary?: EntrySummary}>>([])

  // Handle navigation to view specific entry
  const handleViewEntry = (entryId: string) => {
    router.push(`/entries?highlight=${entryId}`)
  }

  useEffect(() => {
    // Create paired timeline items: each entry with its corresponding AI summary (if it exists)
    const sortedEntries = [...entries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setFilteredEntries(sortedEntries)
    
    const paired = sortedEntries.map(entry => {
      const summary = entrySummaries.find(s => s.entryId === entry.id)
      return { entry, summary }
    })
    setPairedTimelineItems(paired)
  }, [entries, entrySummaries])

  // Helper function to get mood icon and color
  const getMoodColor = (mood?: string) => {
    if (!mood) return 'text-gray-500'
    
    const moodColors = {
      happy: 'text-yellow-500',
      joyful: 'text-yellow-400',
      grateful: 'text-green-400',
      excited: 'text-pink-500',
      energetic: 'text-orange-500',
      inspired: 'text-purple-500',
      peaceful: 'text-blue-400',
      content: 'text-teal-400',
      motivated: 'text-emerald-500',
      relaxed: 'text-sky-400',
      creative: 'text-indigo-400',
      focused: 'text-violet-500',
      neutral: 'text-gray-500',
      tired: 'text-gray-400',
      stressed: 'text-orange-600',
      anxious: 'text-yellow-600',
      melancholy: 'text-gray-600',
      sad: 'text-blue-600',
      frustrated: 'text-red-600',
      overwhelmed: 'text-gray-700'
    }
    return moodColors[mood as keyof typeof moodColors] || 'text-gray-500'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading your insights...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="insights-wrapper">
      {/* Inject Custom Styles */}
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      <div className="min-h-screen bg-[var(--background)] dark:bg-[#0b0f13] relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-10 left-5 w-48 h-48 bg-gradient-to-br from-[#88e1e5]/10 to-transparent rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.15, 1],
              opacity: [0.2, 0.4, 0.2],
              x: [0, 20, 0],
              y: [0, -15, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        
        {/* Main Content */}
        <div className="relative py-8 sm:py-10 md:py-12 px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-b from-[var(--primary)] to-[var(--primary-dark)] dark:from-[#a8edea] dark:to-[#88e1e5] bg-clip-text text-transparent leading-tight">
                Your Insights
              </h1>
              <p className="mt-3 sm:mt-4 text-base sm:text-lg text-[var(--text-secondary)] dark:text-[#a3a3a3] max-w-2xl mx-auto">
                {entries.length > 0 
                  ? `Explore patterns and insights from your ${entries.length} journal entries` 
                  : "Start journaling to see your personal insights and patterns"}
              </p>
            </div>
            
            {/* Timeline Section */}
            {entries.length > 0 ? (
              <div className="relative">
                {/* Timeline spacing */}
                <div className="mb-6 sm:mb-8 md:mb-10"></div>
                
                {/* Timeline with calendars and entries */}
                <div className="relative max-w-4xl mx-auto">
                  {/* Blue vertical timeline with animation effects - visible on all devices */}
                  <div className="absolute left-[36px] sm:left-[36px] top-0 bottom-0 w-[2px] overflow-visible">
                    {/* Base timeline */}
                    <div className="absolute inset-0 bg-[#00A3FF]"></div>
                    
                    {/* Subtle glow effect */}
                    <div className="absolute inset-0 bg-[#00A3FF] blur-[2px] opacity-40"></div>
                    
                    {/* Animated flow effect - moves from top to bottom */}
                    <motion.div 
                      className="absolute w-full h-[60px] bg-gradient-to-b from-[#00A3FF]/90 via-[#9BDBFF]/60 to-[#00A3FF]/90"
                      animate={{ 
                        top: ['-60px', '100%'] 
                      }}
                      transition={{ 
                        duration: 6,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                    
                    {/* Secondary pulse effect */}
                    <motion.div 
                      className="absolute w-full h-[30px] bg-gradient-to-b from-[#9BDBFF]/70 to-[#00A3FF]/40"
                      animate={{ 
                        top: ['-30px', '100%'] 
                      }}
                      transition={{ 
                        duration: 4.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                      }}
                    />
                    
                  </div>

                  {/* Timeline entries - each with its own calendar */}
                  {pairedTimelineItems.map((item, index) => (
                    <div key={item.entry.id} className="flex mb-10 sm:mb-16 md:mb-24 relative">
                      {/* Calendar column - left side */}
                      <div className="w-14 sm:w-16 md:w-[72px] relative mr-3 sm:mr-4 md:mr-6 flex-shrink-0">
                        {/* Calendar element with hover effect */}
                        <motion.div
                          className="w-14 h-14 sm:w-16 sm:h-16 md:w-[57px] md:h-[72px] bg-[#3A3A3A] dark:bg-[#1E1E28] rounded-md shadow-md mx-auto overflow-hidden cursor-pointer"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          whileHover={{ 
                            scale: 1.05,
                            boxShadow: "0 0 15px rgba(0, 163, 255, 0.5)"
                          }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          {/* Calendar header */}
                          <div className="h-4 sm:h-5 md:h-6 bg-[#00A3FF] flex items-center justify-center">
                            <p className="text-[8px] sm:text-[10px] md:text-xs font-medium text-white uppercase">
                              {new Date(item.entry.createdAt).toLocaleDateString(undefined, { month: 'short' })}
                            </p>
                          </div>
                          
                          {/* Calendar body */}
                          <div className="flex flex-col items-center justify-center h-[calc(100%-1rem)] sm:h-[calc(100%-1.25rem)] md:h-[calc(100%-1.5rem)]">
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-none mt-0.5 sm:mt-1">
                              {new Date(item.entry.createdAt).getDate()}
                            </p>
                            <p className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-300 dark:text-gray-400 mt-0.5">
                              {new Date(item.entry.createdAt).getFullYear()}
                            </p>
                          </div>
                        </motion.div>

                        {/* Animated horizontal connector line - visible on all screens */}
                        <div className="block absolute top-7 sm:top-8 md:top-9 right-0 w-[16px] h-[2px] overflow-visible">
                          {/* Base connector */}
                          <div className="absolute top-0 left-0 w-full h-full bg-[#00A3FF]"></div>
                          
                          {/* Subtle glow */}
                          <div className="absolute top-0 left-0 w-full h-full bg-[#00A3FF] blur-[1px] opacity-70"></div>
                          
                          {/* Moving pulse along connector */}
                          <motion.div
                            className="absolute top-1/2 -translate-y-1/2 w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] bg-white rounded-full shadow-[0_0_4px_#00A3FF]"
                            animate={{ 
                              left: ['0%', '100%'],
                              opacity: [0.4, 1, 0.4]
                            }}
                            transition={{ 
                              duration: 1.5, 
                              repeat: Infinity,
                              repeatType: "reverse",
                              ease: "easeInOut",
                              delay: index * 0.3
                            }}
                          />
                        </div>
                      </div>

                      {/* Journal card - right side */}
                      <div className="flex-1">
                        {/* Mobile top connector for calendar -> vertical line */}
                        <div className="hidden absolute -left-[7px] top-0 w-[2px] h-7 bg-[#00A3FF]">
                          <div className="absolute inset-0 bg-[#00A3FF] blur-[1px] opacity-50"></div>
                          <motion.div 
                            className="absolute w-full h-[8px] bg-gradient-to-b from-[#9BDBFF]/70 to-[#00A3FF]/40"
                            animate={{ top: ['0%', '100%'] }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                        </div>
                        
                        {/* Card content */}
                        <motion.div
                          className="flex-1"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          whileHover={{ translateX: 3 }}
                        >
                          <Card className="bg-white dark:bg-[#1c1c24] border border-gray-100 dark:border-[#2a2a3a]/30 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
                            {/* Gradient top bar */}
                            <div className="bg-gradient-to-r from-[#FF3358] to-[#8843F2] h-1"></div>
                            <CardContent className="p-3 sm:p-4 md:p-5">
                              {/* Time indicator - compact version */}
                              <div className="flex justify-end items-center mb-2 sm:mb-3 md:mb-4">
                                <div className="flex items-center text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs">
                                  <span>{new Date(item.entry.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                              </div>
                              
                              {/* Content with left border */}
                              <div className="mb-3 sm:mb-4 bg-transparent p-0 border-l-[2px] sm:border-l-[3px] border-[#00CFDE] pl-2 sm:pl-3">
                                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 line-clamp-2 sm:line-clamp-1">
                                  {item.entry.content.substring(0, 150)}
                                  {item.entry.content.length > 150 ? '...' : ''}
                                </p>
                              </div>
                            
                              {/* Mood and action button */}
                              <div className="flex flex-wrap items-center justify-between">
                                <div className="flex flex-wrap gap-1 sm:gap-2">
                                  {/* Mood badge */}
                                  {item.entry.mood && (
                                    <div className={`flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm rounded-sm sm:rounded ${getMoodColor(item.entry.mood)}`}>
                                      <Heart size={12} className="mr-0.5 sm:mr-1" fill="currentColor" />
                                      <span className="capitalize font-medium">{item.entry.mood}</span>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Action button */}
                                <button
                                  onClick={() => handleViewEntry(item.entry.id)}
                                  className="flex items-center px-2 sm:px-3 py-0.5 sm:py-1 bg-[#00CFDE] text-white rounded hover:opacity-90 transition-opacity text-xs sm:text-sm"
                                >
                                  <span className="mr-0.5 sm:mr-1 font-medium">View</span>
                                  <Eye size={12} className="sm:size-14" />
                                </button>
                              </div>
                          
                              {/* AI Insights Section */}
                              {item.summary ? (
                                <motion.div 
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.6 }}
                                  className="mt-4 sm:mt-5 md:mt-6 pt-4 sm:pt-5 md:pt-6 border-t border-dashed border-gray-200 dark:border-gray-700"
                                >
                                  <div className="flex items-center mb-3 sm:mb-4 md:mb-5">
                                    {/* Smaller Gemini-style icon with colorful circles */}
                                    <div className="relative mr-2 sm:mr-3 md:mr-4 flex items-center justify-center">
                                      <motion.div 
                                        className="relative w-9 h-8 sm:w-10 sm:h-9 md:w-11 md:h-10"
                                        animate={{ rotate: [0, 3, 0, -3, 0] }}
                                        transition={{
                                          duration: 8,
                                          repeat: Infinity,
                                          ease: "easeInOut"
                                        }}
                                      >
                                        {/* Blue circle - bottom left */}
                                        <motion.div 
                                          className="absolute w-4 h-4 sm:w-[18px] sm:h-[18px] md:w-5 md:h-5 bg-[#4285F4] rounded-full bottom-0 left-0 z-10"
                                          initial={{ scale: 0, opacity: 0, x: -5, y: 5 }}
                                          animate={{ 
                                            scale: [0.95, 1.05, 0.95],
                                            opacity: 1,
                                            x: 0,
                                            y: 0,
                                            boxShadow: ["0 0 0px rgba(66, 133, 244, 0)", "0 0 10px rgba(66, 133, 244, 0.7)", "0 0 0px rgba(66, 133, 244, 0)"]
                                          }}
                                          transition={{ 
                                            scale: {
                                              duration: 2,
                                              repeat: Infinity,
                                              ease: "easeInOut",
                                            },
                                            x: { duration: 0.5 },
                                            y: { duration: 0.5 },
                                            opacity: { duration: 0.3 },
                                            boxShadow: {
                                              duration: 2,
                                              repeat: Infinity,
                                              ease: "easeInOut"
                                            }
                                          }}
                                        >
                                          <motion.div 
                                            className="w-full h-full rounded-full bg-gradient-to-r from-[#4285F4] to-[#6DB4FF] opacity-80"
                                            animate={{ 
                                              opacity: [0.6, 0.9, 0.6],
                                              background: [
                                                "linear-gradient(45deg, #4285F4, #6DB4FF)",
                                                "linear-gradient(90deg, #4285F4, #6DB4FF)",
                                                "linear-gradient(135deg, #4285F4, #6DB4FF)"
                                              ]
                                            }}
                                            transition={{ 
                                              duration: 3,
                                              repeat: Infinity,
                                              ease: "easeInOut"
                                            }}
                                          />
                                        </motion.div>

                                        {/* Red circle - top */}
                                        <motion.div 
                                          className="absolute w-[18px] h-[18px] sm:w-5 sm:h-5 md:w-[22px] md:h-[22px] bg-[#EA4335] rounded-full top-0 left-[45%] transform -translate-x-1/2 z-20"
                                          initial={{ scale: 0, opacity: 0, y: -5 }}
                                          animate={{ 
                                            scale: [1, 1.08, 1],
                                            opacity: 1,
                                            y: 0,
                                            boxShadow: ["0 0 0px rgba(234, 67, 53, 0)", "0 0 10px rgba(234, 67, 53, 0.7)", "0 0 0px rgba(234, 67, 53, 0)"]
                                          }}
                                          transition={{ 
                                            scale: {
                                              duration: 2.5,
                                              repeat: Infinity,
                                              ease: "easeInOut"
                                            },
                                            y: { duration: 0.5 },
                                            opacity: { duration: 0.3 },
                                            boxShadow: {
                                              duration: 2.5,
                                              repeat: Infinity,
                                              ease: "easeInOut"
                                            }
                                          }}
                                        >
                                          <motion.div 
                                            className="w-full h-full rounded-full bg-gradient-to-r from-[#EA4335] to-[#FF897C] opacity-80"
                                            animate={{ 
                                              opacity: [0.7, 0.95, 0.7],
                                              background: [
                                                "linear-gradient(45deg, #EA4335, #FF897C)",
                                                "linear-gradient(90deg, #EA4335, #FF897C)",
                                                "linear-gradient(135deg, #EA4335, #FF897C)"
                                              ]
                                            }}
                                            transition={{ 
                                              duration: 3.3,
                                              repeat: Infinity,
                                              ease: "easeInOut"
                                            }}
                                          />
                                        </motion.div>

                                        {/* Yellow circle - bottom right */}
                                        <motion.div 
                                          className="absolute w-4 h-4 sm:w-[18px] sm:h-[18px] md:w-5 md:h-5 bg-[#FBBC05] rounded-full bottom-0 right-0 z-0"
                                          initial={{ scale: 0, opacity: 0, x: 5, y: 5 }}
                                          animate={{ 
                                            scale: [0.9, 1, 0.9],
                                            opacity: 1,
                                            x: 0,
                                            y: 0,
                                            boxShadow: ["0 0 0px rgba(251, 188, 5, 0)", "0 0 10px rgba(251, 188, 5, 0.7)", "0 0 0px rgba(251, 188, 5, 0)"]
                                          }}
                                          transition={{ 
                                            scale: {
                                              duration: 2.2,
                                              repeat: Infinity,
                                              ease: "easeInOut",
                                              delay: 0.3
                                            },
                                            x: { duration: 0.5 },
                                            y: { duration: 0.5 },
                                            opacity: { duration: 0.3 },
                                            boxShadow: {
                                              duration: 2.2,
                                              repeat: Infinity,
                                              ease: "easeInOut"
                                            }
                                          }}
                                        >
                                          <motion.div 
                                            className="w-full h-full rounded-full bg-gradient-to-r from-[#FBBC05] to-[#FFD666] opacity-80"
                                            animate={{ 
                                              opacity: [0.6, 0.9, 0.6],
                                              background: [
                                                "linear-gradient(45deg, #FBBC05, #FFD666)",
                                                "linear-gradient(90deg, #FBBC05, #FFD666)",
                                                "linear-gradient(135deg, #FBBC05, #FFD666)"
                                              ]
                                            }}
                                            transition={{ 
                                              duration: 3.5,
                                              repeat: Infinity,
                                              ease: "easeInOut"
                                            }}
                                          />
                                        </motion.div>

                                        {/* Green circle - middle right (slightly smaller) */}
                                        <motion.div 
                                          className="absolute w-[14px] h-[14px] sm:w-4 sm:h-4 md:w-[18px] md:h-[18px] bg-[#34A853] rounded-full top-[50%] right-0 transform -translate-y-1/2 z-30"
                                          initial={{ scale: 0, opacity: 0, x: 5 }}
                                          animate={{ 
                                            scale: [0.9, 1.1, 0.9],
                                            opacity: 1,
                                            x: 0,
                                            boxShadow: ["0 0 0px rgba(52, 168, 83, 0)", "0 0 10px rgba(52, 168, 83, 0.7)", "0 0 0px rgba(52, 168, 83, 0)"]
                                          }}
                                          transition={{ 
                                            scale: {
                                              duration: 2.8,
                                              repeat: Infinity,
                                              ease: "easeInOut",
                                              delay: 0.6
                                            },
                                            x: { duration: 0.5 },
                                            opacity: { duration: 0.3 },
                                            boxShadow: {
                                              duration: 2.8,
                                              repeat: Infinity,
                                              ease: "easeInOut"
                                            }
                                          }}
                                        >
                                          <motion.div 
                                            className="w-full h-full rounded-full bg-gradient-to-r from-[#34A853] to-[#7BDCA1] opacity-80"
                                            animate={{ 
                                              opacity: [0.7, 1, 0.7],
                                              background: [
                                                "linear-gradient(45deg, #34A853, #7BDCA1)",
                                                "linear-gradient(90deg, #34A853, #7BDCA1)",
                                                "linear-gradient(135deg, #34A853, #7BDCA1)"
                                              ]
                                            }}
                                            transition={{ 
                                              duration: 3.8,
                                              repeat: Infinity,
                                              ease: "easeInOut"
                                            }}
                                          />
                                        </motion.div>

                                        {/* Small particle animations */}
                                        <motion.div
                                          className="absolute w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white opacity-80 z-40"
                                          style={{ top: '30%', left: '15%' }}
                                          animate={{
                                            opacity: [0, 0.8, 0],
                                            scale: [0.5, 1.2, 0.5]
                                          }}
                                          transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            delay: 1
                                          }}
                                        />
                                        
                                        <motion.div
                                          className="absolute w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white opacity-80 z-40"
                                          style={{ bottom: '25%', right: '15%' }}
                                          animate={{
                                            opacity: [0, 0.8, 0],
                                            scale: [0.5, 1.2, 0.5]
                                          }}
                                          transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            delay: 2
                                          }}
                                        />

                                        {/* AI text overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center z-50">
                                          <motion.div
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.5, duration: 0.3 }}
                                          >
                                            <motion.span 
                                              className="text-[10px] sm:text-xs md:text-sm font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                                              animate={{ 
                                                textShadow: [
                                                  "0 0 3px rgba(255,255,255,0.5)", 
                                                  "0 0 6px rgba(255,255,255,0.7)", 
                                                  "0 0 3px rgba(255,255,255,0.5)"
                                                ] 
                                              }}
                                              transition={{ duration: 2, repeat: Infinity }}
                                            >
                                              AI
                                            </motion.span>
                                          </motion.div>
                                        </div>
                                      </motion.div>
                                    </div>

                                    {/* Text with gradient and animation */}
                                    <motion.h4 
                                      className="text-base sm:text-lg md:text-xl font-bold"
                                      style={{
                                        backgroundImage: "linear-gradient(90deg, #4285F4, #EA4335, #FBBC05, #34A853)",
                                        backgroundSize: "300% 100%",
                                        backgroundClip: "text",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent"
                                      }}
                                      animate={{ 
                                        backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
                                      }}
                                      transition={{ 
                                        duration: 6, 
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                      }}
                                    >
                                      Insights
                                    </motion.h4>
                                  </div>
                                  
                                  <div className="space-y-5">
                                    {/* Themes */}
                                    {item.summary.keyThemes.length > 0 && (
                                      <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="mb-4"
                                      >
                                        <h5 className="text-sm font-medium text-[var(--text-primary)] dark:text-white mb-3 flex items-center">
                                          <div className="w-2 h-2 rounded-full bg-[var(--primary)] dark:bg-[#88e1e5] mr-2"></div>
                                          Key Themes
                                        </h5>
                                        <div className="flex flex-wrap gap-2">
                                          {item.summary.keyThemes.map((theme, i) => (
                                            <motion.span 
                                              key={i} 
                                              initial={{ scale: 0.8, opacity: 0 }}
                                              animate={{ scale: 1, opacity: 1 }}
                                              transition={{ duration: 0.4, delay: i * 0.1 }}
                                              className="px-3 py-1.5 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent)]/5 dark:from-[#88e1e5]/10 dark:to-[#f67280]/5 border border-[var(--primary)]/10 dark:border-[#88e1e5]/10 text-[var(--primary)] dark:text-[#88e1e5] rounded-lg text-sm font-medium"
                                            >
                                              {theme}
                                            </motion.span>
                                          ))}
                                        </div>
                                      </motion.div>
                                    )}
                                    
                                    {/* Emotional Insight */}
                                    {item.summary.emotionalInsights.length > 0 && (
                                      <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.1 }}
                                        className="bg-gradient-to-r from-[#f67280]/10 to-transparent dark:from-[#f67280]/5 dark:to-transparent p-4 rounded-lg border border-[#f67280]/20"
                                      >
                                        <div className="flex items-center mb-2">
                                          <Heart size={16} className="text-[#f67280] mr-2" fill="currentColor" />
                                          <h5 className="font-medium text-[#f67280]">Emotional Insight</h5>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300">{item.summary.emotionalInsights[0]}</p>
                                      </motion.div>
                                    )}
                                    
                                    {/* Suggestion */}
                                    {item.summary.suggestions.length > 0 && (
                                      <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        className="bg-gradient-to-r from-[#a8edea]/10 to-transparent dark:from-[#a8edea]/5 dark:to-transparent p-4 rounded-lg border border-[#a8edea]/20"
                                      >
                                        <div className="flex items-center mb-2">
                                          <Sparkles size={16} className="text-[#a8edea] mr-2" />
                                          <h5 className="font-medium text-[#a8edea]">Suggestion</h5>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300">{item.summary.suggestions[0]}</p>
                                      </motion.div>
                                    )}
                                  </div>
                                </motion.div>
                              ) : (
                                // Generate AI Insights button
                                <motion.div 
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.6 }}
                                  className="mt-6 pt-6 border-t border-dashed border-gray-200 dark:border-gray-700"
                                >
                                  <div className="bg-gradient-to-r from-gray-100/80 to-gray-50/50 dark:from-[#1c1c24]/80 dark:to-[#1c1c24]/50 rounded-lg p-5 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--primary)] dark:from-[#88e1e5] dark:via-[#f67280] dark:to-[#88e1e5] opacity-80"></div>
                                    
                                    <div className="flex items-center mb-4">
                                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20 dark:from-[#88e1e5]/20 dark:to-[#f67280]/20 flex items-center justify-center mr-3 border border-[var(--primary)]/10 dark:border-[#88e1e5]/10">
                                        <Sparkles size={20} className="text-[var(--primary)] dark:text-[#88e1e5]" />
                                      </div>
                                      <div>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">AI Analysis</h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                          Uncover patterns and themes in this entry
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <motion.button
                                      whileHover={{ scale: 1.03 }}
                                      whileTap={{ scale: 0.97 }}
                                      onClick={() => generateEntrySummary(item.entry.id)}
                                      className="w-full mt-2 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] dark:from-[#88e1e5] dark:to-[#f67280] text-white rounded-md flex items-center justify-center font-medium shadow-lg"
                                    >
                                      <Sparkles size={16} className="mr-2 animate-pulse" />
                                      <span>Generate AI Insights</span>
                                    </motion.button>
                                  </div>
                                </motion.div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7 }}
                className="text-center py-16"
              >
                <div className="bg-white dark:bg-[#1c1c24] rounded-xl p-10 max-w-md mx-auto shadow-xl border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br from-[var(--primary)]/30 to-[var(--accent)]/10 dark:from-[#88e1e5]/20 dark:to-[#f67280]/10 blur-2xl"></div>
                  <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-gradient-to-tr from-[var(--accent)]/20 to-[var(--primary)]/10 dark:from-[#f67280]/10 dark:to-[#88e1e5]/20 blur-2xl"></div>
                  
                  <div className="relative">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ 
                        duration: 0.7, 
                        delay: 0.2,
                        type: "spring",
                        stiffness: 100
                      }}
                      className="flex items-center justify-center mb-8"
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] dark:from-[#88e1e5] dark:to-[#f67280] rounded-2xl flex items-center justify-center shadow-lg relative">
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] dark:from-[#88e1e5] dark:to-[#f67280] rounded-2xl"
                          animate={{ 
                            opacity: [0.7, 0.4, 0.7], 
                            scale: [1, 1.05, 1] 
                          }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity,
                            repeatType: "loop" 
                          }}
                        />
                        <Calendar size={32} className="text-white relative z-10" />
                      </div>
                    </motion.div>
                    
                    <motion.h3
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
                    >
                      No Journal Entries Yet
                    </motion.h3>
                    
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      className="text-gray-600 dark:text-gray-300 mb-8 max-w-sm mx-auto"
                    >
                      Start journaling to see AI-powered insights and discover patterns in your thoughts and emotions.
                    </motion.p>
                    
                    <motion.button 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push('/')}
                      className="px-8 py-3.5 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] dark:from-[#88e1e5] dark:to-[#f67280] text-white rounded-lg hover:shadow-lg transition-all duration-300 inline-flex items-center justify-center font-medium"
                    >
                      <PenSquare className="mr-2.5" size={18} />
                      Start Journaling
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}