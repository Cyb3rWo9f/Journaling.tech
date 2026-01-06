import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  PenTool, 
  BookOpen, 
  BarChart3, 
  Settings, 
  Sparkles, 
  Calendar, 
  Save, 
  Heart, 
  Shield, 
  Plus, 
  User,
  ArrowRight,
  Smile,
  Laugh,
  Zap,
  Flame,
  Lightbulb,
  Sun,
  ThumbsUp,
  Target,
  Coffee,
  Battery,
  Meh,
  AlertCircle,
  Cloud,
  Music,
  Frown,
  Angry,
  CloudRain,
  RefreshCw,
  MapPin,
  Star,
  Award,
  Trophy,
  LogOut,
  Search,
  Filter,
  Tag,
  ChevronDown
} from 'lucide-react'

// Demo journal text to type
const DEMO_TEXT = "Today was an incredible day! I finally completed my personal project that I've been working on for months. The feeling of accomplishment is overwhelming. I learned so much about perseverance and staying focused on my goals. #grateful #achievement #growth"

// Browser Mockup Component - Shows app demo with animation
export function BrowserMockup() {
  const [currentView, setCurrentView] = useState<'editor' | 'saving' | 'entries' | 'insights'>('editor')
  const [typedText, setTypedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [selectedMood, setSelectedMood] = useState(-1)

  // Human-like typing animation with variable speed
  useEffect(() => {
    if (currentView !== 'editor') return
    
    let charIndex = 0
    let timeoutId: NodeJS.Timeout
    
    const typeNextChar = () => {
      if (charIndex < DEMO_TEXT.length) {
        setTypedText(DEMO_TEXT.slice(0, charIndex + 1))
        charIndex++
        
        // Variable typing speed for human-like effect
        const currentChar = DEMO_TEXT[charIndex - 1]
        const nextChar = DEMO_TEXT[charIndex]
        
        let delay = 35 + Math.random() * 45 // Base speed: 35-80ms
        
        // Pause longer after punctuation
        if (['.', '!', '?'].includes(currentChar)) {
          delay = 300 + Math.random() * 200 // 300-500ms pause
        } else if ([',', ';', ':'].includes(currentChar)) {
          delay = 150 + Math.random() * 100 // 150-250ms pause
        } else if (currentChar === ' ' && nextChar && nextChar === nextChar.toUpperCase() && nextChar !== nextChar.toLowerCase()) {
          // Pause before capital letters (new sentences)
          delay = 100 + Math.random() * 50
        } else if (currentChar === '#') {
          // Slight pause when starting hashtag
          delay = 80 + Math.random() * 40
        } else if (currentChar === '\n') {
          delay = 200 + Math.random() * 100 // Pause at line breaks
        }
        
        // Occasional longer pauses (thinking)
        if (Math.random() < 0.03) {
          delay += 150 + Math.random() * 100
        }
        
        timeoutId = setTimeout(typeNextChar, delay)
      } else {
        setIsTyping(false)
        // Select mood after typing
        setTimeout(() => setSelectedMood(2), 500) // Select "Grateful"
        // Click save after selecting mood
        setTimeout(() => {
          setCurrentView('saving')
        }, 1500)
        // Transition to entries
        setTimeout(() => {
          setCurrentView('entries')
        }, 2500)
        // Transition to insights
        setTimeout(() => {
          setCurrentView('insights')
        }, 5500)
        // Reset and loop
        setTimeout(() => {
          setCurrentView('editor')
          setTypedText('')
          setIsTyping(true)
          setSelectedMood(-1)
        }, 11000)
      }
    }
    
    // Start typing with a small initial delay
    timeoutId = setTimeout(typeNextChar, 500)

    return () => clearTimeout(timeoutId)
  }, [currentView])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative mx-auto w-full max-w-5xl"
    >
      {/* Glow Effect Behind Browser */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl opacity-60"></div>
      
      {/* Browser Frame */}
      <div className="relative bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-1.5 shadow-2xl border border-gray-300/50 dark:border-gray-600/50 overflow-hidden">
        {/* Browser Header Bar */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-t-xl px-3 py-2 flex items-center justify-between border-b border-gray-200/50 dark:border-gray-600/50">
          {/* Traffic Lights */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-inner hover:bg-red-600 transition-colors cursor-pointer"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-inner hover:bg-yellow-600 transition-colors cursor-pointer"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full shadow-inner hover:bg-green-600 transition-colors cursor-pointer"></div>
          </div>
          
          {/* URL Bar */}
          <div className="flex-1 mx-4 max-w-md">
            <div className="bg-white dark:bg-gray-900 rounded-lg px-3 py-1.5 flex items-center gap-2 border border-gray-200 dark:border-gray-600 shadow-inner">
              <div className="flex items-center gap-1">
                <Shield size={12} className="text-green-500" />
              </div>
              <span className="text-[11px] text-gray-600 dark:text-gray-300 font-medium truncate">app.journaling.tech</span>
            </div>
          </div>
          
          {/* Browser Actions */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
              <Plus size={12} className="text-gray-500" />
            </div>
            <div className="w-5 h-5 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
              <User size={12} className="text-gray-500" />
            </div>
          </div>
        </div>

        {/* Website Content */}
        <div className="bg-[var(--background)] overflow-hidden h-[560px]">
          <AnimatePresence mode="wait">
            {currentView === 'insights' ? (
              <InsightsView key="insights" />
            ) : currentView === 'entries' ? (
              <EntriesView key="entries" />
            ) : (
              <EditorView 
                key="editor" 
                typedText={typedText} 
                isTyping={isTyping} 
                selectedMood={selectedMood}
                isSaving={currentView === 'saving'}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

// Editor View Component
function EditorView({ typedText, isTyping, selectedMood, isSaving }: { 
  typedText: string
  isTyping: boolean
  selectedMood: number
  isSaving: boolean 
}) {
  const moodOptions = [
    { icon: Smile, label: 'Happy', color: 'text-green-500' },
    { icon: Laugh, label: 'Joyful', color: 'text-emerald-500' },
    { icon: Heart, label: 'Grateful', color: 'text-pink-500' },
    { icon: Zap, label: 'Excited', color: 'text-yellow-500' },
    { icon: Flame, label: 'Energetic', color: 'text-red-500' },
    { icon: Lightbulb, label: 'Inspired', color: 'text-purple-500' },
    { icon: Sun, label: 'Peaceful', color: 'text-blue-400' },
    { icon: ThumbsUp, label: 'Content', color: 'text-teal-500' },
    { icon: Target, label: 'Motivated', color: 'text-indigo-500' },
    { icon: Coffee, label: 'Relaxed', color: 'text-amber-600' },
    { icon: Sparkles, label: 'Creative', color: 'text-violet-500' },
    { icon: Battery, label: 'Focused', color: 'text-cyan-500' },
    { icon: Meh, label: 'Neutral', color: 'text-gray-500' },
    { icon: Battery, label: 'Tired', color: 'text-gray-400' },
    { icon: AlertCircle, label: 'Stressed', color: 'text-orange-500' },
    { icon: Cloud, label: 'Anxious', color: 'text-orange-600' },
    { icon: Music, label: 'Melancholy', color: 'text-slate-500' },
    { icon: Frown, label: 'Sad', color: 'text-blue-500' },
    { icon: Angry, label: 'Frustrated', color: 'text-red-600' },
    { icon: CloudRain, label: 'Swamped', color: 'text-gray-600' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col"
    >
      {/* App Header */}
      <div className="bg-[var(--background)] border-b border-[var(--border)] px-3 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
            <PenTool size={14} className="text-white" />
          </div>
          <span className="font-bold text-base text-[var(--text-primary)]">Journaling</span>
        </div>
        <nav className="hidden md:flex items-center bg-[var(--surface-elevated)] rounded-2xl p-1 border border-[var(--border)]">
          <button className="px-3 py-1.5 text-[10px] font-semibold rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white flex items-center gap-1.5 shadow-md">
            <PenTool size={11} />
            Write
          </button>
          <button className="px-3 py-1.5 text-[10px] font-medium rounded-xl text-[var(--text-secondary)] flex items-center gap-1.5">
            <BookOpen size={11} />
            Entries
          </button>
          <button className="px-3 py-1.5 text-[10px] font-medium rounded-xl text-[var(--text-secondary)] flex items-center gap-1.5">
            <BarChart3 size={11} />
            Insights
          </button>
          <button className="px-3 py-1.5 text-[10px] font-medium rounded-xl text-[var(--text-secondary)] flex items-center gap-1.5">
            <Settings size={11} />
            Settings
          </button>
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-full">
            <div className="w-6 h-6 bg-[var(--border)] rounded-full flex items-center justify-center">
              <User size={12} className="text-[var(--text-secondary)]" />
            </div>
            <span className="text-[10px] font-medium text-[var(--text-primary)]">Guest</span>
            <LogOut size={10} className="text-[var(--text-secondary)]" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-[var(--background)] p-3 flex-1">
        {/* Quote Banner */}
        <div className="text-center mb-3 py-2 px-4 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border)]">
          <p className="text-[11px] text-[var(--text-primary)]">
            "<span className="font-medium">Carpe diem</span>" — <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent font-semibold">seize the day, embrace every moment</span>
          </p>
          <p className="text-[9px] text-[var(--text-secondary)] mt-0.5">Your journey of self-discovery begins with a single thought</p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          {/* Main Editor Card */}
          <div className="lg:col-span-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border)] shadow-lg shadow-black/5 overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--primary)]" />
            
            <div className="p-2.5 border-b border-[var(--border)]/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-lg">
                    <Calendar size={12} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[8px] text-[var(--primary)] font-bold uppercase tracking-wider">Today's Entry</p>
                    <p className="text-[11px] text-[var(--text-primary)] font-bold">January 2, 2026</p>
                  </div>
                </div>
                <motion.button 
                  animate={isSaving ? { scale: [1, 0.95, 1] } : {}}
                  className={`px-2.5 py-1.5 text-[9px] font-bold rounded-lg flex items-center gap-1 shadow-md transition-all ${
                    isSaving 
                      ? 'bg-green-500 text-white shadow-green-500/25' 
                      : 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white shadow-[var(--primary)]/25'
                  }`}
                >
                  <Save size={10} className={isSaving ? 'animate-spin' : ''} />
                  {isSaving ? 'Saving...' : 'Save'}
                </motion.button>
              </div>

              {/* Mood Selector */}
              <div>
                <div className="flex items-center gap-1 mb-1.5">
                  <Heart size={10} className="text-pink-500" />
                  <span className="text-[10px] text-[var(--text-primary)] font-bold">How are you feeling?</span>
                </div>
                <div className="grid grid-cols-10 gap-1">
                  {moodOptions.map((mood, i) => {
                    const Icon = mood.icon
                    const isSelected = i === selectedMood
                    return (
                      <motion.div 
                        key={i}
                        animate={isSelected ? { scale: [1, 1.1, 1.05] } : {}}
                        className={`flex flex-col items-center justify-center gap-0.5 py-1 px-0.5 rounded-md border transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-[var(--primary)] border-transparent scale-105 shadow-md' 
                            : 'bg-[var(--background)] border-[var(--border)]'
                        }`}
                      >
                        <Icon size={12} className={isSelected ? 'text-white' : mood.color} />
                        <span className={`text-[6px] font-semibold leading-none ${isSelected ? 'text-white' : 'text-[var(--text-secondary)]'}`}>{mood.label}</span>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Journal Textarea */}
            <div className="bg-[var(--background)] p-3 min-h-[80px] relative">
              <p className="text-[10px] text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                {typedText}
                {isTyping && (
                  <motion.span 
                    className="inline-block w-[2px] h-3 bg-[var(--primary)] ml-[1px] rounded-sm"
                    animate={{ opacity: [1, 1, 0, 0] }}
                    transition={{ 
                      duration: 0.8, 
                      repeat: Infinity,
                      times: [0, 0.5, 0.5, 1]
                    }}
                    style={{ verticalAlign: 'text-bottom' }}
                  />
                )}
              </p>
              {!typedText && (
                <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                  Begin your journal entry here...
                </p>
              )}
              {/* Word count */}
              {typedText && (
                <div className="absolute bottom-2 right-3">
                  <span className="text-[8px] text-[var(--text-muted)] bg-[var(--surface-elevated)] px-1.5 py-0.5 rounded border border-[var(--border)]">
                    {typedText.split(' ').filter(word => word.length > 0).length} words
                  </span>
                </div>
              )}
            </div>

            {/* Tags Display - Shows when hashtags are typed */}
            {typedText.includes('#') && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-2.5 border-t border-[var(--border)]/50 bg-[var(--primary)]/5"
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Target size={10} className="text-[var(--primary)]" />
                  <span className="text-[9px] font-bold text-[var(--text-primary)]">Tags</span>
                  <span className="text-[7px] text-white bg-[var(--primary)] px-1 py-0.5 rounded font-bold">
                    {(typedText.match(/#\w+/g) || []).length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(typedText.match(/#\w+/g) || []).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-1.5 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded text-[8px] font-semibold border border-[var(--primary)]/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Sidebar - Matching real UI */}
          <div className="hidden lg:flex flex-col gap-2">
            {/* Weather Widget */}
            <div className="bg-[var(--surface-elevated)] rounded-xl p-2 border border-[var(--border)]">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1">
                  <MapPin size={9} className="text-[var(--text-secondary)]" />
                  <span className="text-[9px] font-medium text-[var(--text-primary)]">Patna</span>
                </div>
                <RefreshCw size={9} className="text-[var(--text-secondary)]" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Cloud size={22} className="text-gray-400" />
                <div>
                  <p className="text-lg font-bold text-[var(--text-primary)] leading-none">19°C</p>
                  <p className="text-[8px] text-[var(--text-secondary)]">Haze</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[7px]">
                <div className="bg-[var(--background)] rounded-md p-1.5 border border-[var(--border)]">
                  <p className="text-[var(--text-muted)]">Feels</p>
                  <p className="font-bold text-[var(--text-primary)]">19°C</p>
                </div>
                <div className="bg-[var(--background)] rounded-md p-1.5 border border-[var(--border)]">
                  <p className="text-[var(--text-muted)]">Humidity</p>
                  <p className="font-bold text-[var(--text-primary)]">63%</p>
                </div>
                <div className="bg-[var(--background)] rounded-md p-1.5 border border-[var(--border)]">
                  <p className="text-[var(--text-muted)]">Wind</p>
                  <p className="font-bold text-[var(--text-primary)]">3.09 m/s</p>
                </div>
                <div className="bg-[var(--background)] rounded-md p-1.5 border border-[var(--border)]">
                  <p className="text-[var(--text-muted)]">Pressure</p>
                  <p className="font-bold text-[var(--text-primary)]">1014</p>
                </div>
              </div>
              <p className="text-[6px] text-[var(--text-muted)] mt-1">Updated: 4:17:52 pm</p>
            </div>

            {/* Quick Tips */}
            <div className="bg-[var(--surface-elevated)] rounded-xl p-2 border border-[var(--border)]">
              <div className="flex items-center gap-1 mb-1">
                <div className="p-0.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded">
                  <Lightbulb size={8} className="text-white" />
                </div>
                <span className="text-[9px] font-bold text-[var(--text-primary)]">Quick Tips</span>
              </div>
              <ul className="text-[7px] text-[var(--text-secondary)] space-y-0.5">
                <li className="flex items-start gap-1">
                  <span className="text-[var(--primary)]">•</span>
                  <span>Use <span className="text-[var(--primary)] font-medium">#hashtags</span> to organize</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-pink-500">•</span>
                  <span>Select a mood to track emotions</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-green-500">•</span>
                  <span>Write regularly for streaks</span>
                </li>
              </ul>
            </div>

            {/* Your Streaks */}
            <div className="bg-[var(--surface-elevated)] rounded-xl p-2 border border-[var(--border)]">
              <div className="flex items-center gap-1 mb-1.5">
                <div className="p-0.5 bg-gradient-to-br from-orange-500 to-red-500 rounded">
                  <Flame size={8} className="text-white" />
                </div>
                <span className="text-[9px] font-bold text-[var(--text-primary)]">Your Streaks</span>
              </div>
              <div className="grid grid-cols-2 gap-1 mb-1.5">
                <div className="text-center py-1.5 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                  <p className="text-sm font-bold text-orange-500 leading-none">0</p>
                  <p className="text-[6px] text-[var(--text-secondary)]">Current</p>
                </div>
                <div className="text-center py-1.5 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                  <p className="text-sm font-bold text-[var(--primary)] leading-none">2</p>
                  <p className="text-[6px] text-[var(--text-secondary)]">Best</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-1">
                <div className="p-1 bg-[var(--background)] border border-[var(--border)] rounded">
                  <Star size={9} className="text-gray-400" />
                </div>
                <div className="p-1 bg-[var(--background)] border border-[var(--border)] rounded">
                  <Flame size={9} className="text-gray-400" />
                </div>
                <div className="p-1 bg-[var(--background)] border border-[var(--border)] rounded">
                  <Trophy size={9} className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <MockupFooter />
    </motion.div>
  )
}

// Entries View Component
function EntriesView() {
  const entries = [
    { date: 'January 2, 2026', mood: 'Grateful', moodColor: 'text-pink-500', title: 'Journal Entry - Jan 2, 2026', content: "Today was an incredible day! I finally completed my personal project that I've been working on for months. The feeling of accomplishment is overwhelming...", tags: ['grateful', 'achievement', 'growth'], words: 52 },
    { date: 'January 1, 2026', mood: 'Excited', moodColor: 'text-yellow-500', title: 'Journal Entry - Jan 1, 2026', content: "New year, new beginnings! I'm so excited about what 2026 has in store. Made some amazing resolutions and I'm determined to stick to them...", tags: ['newyear', 'goals'], words: 89 },
    { date: 'December 31, 2025', mood: 'Happy', moodColor: 'text-green-500', title: 'Journal Entry - Dec 31, 2025', content: "Last day of 2025! Reflecting on all the wonderful memories this year brought. Grateful for the lessons learned and excited for the journey ahead...", tags: ['reflection', 'grateful'], words: 127 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col"
    >
      {/* App Header */}
      <div className="bg-[var(--background)] border-b border-[var(--border)] px-3 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
            <PenTool size={14} className="text-white" />
          </div>
          <span className="font-bold text-base text-[var(--text-primary)]">Journaling</span>
        </div>
        <nav className="hidden md:flex items-center bg-[var(--surface-elevated)] rounded-2xl p-1 border border-[var(--border)]">
          <button className="px-3 py-1.5 text-[10px] font-medium rounded-xl text-[var(--text-secondary)] flex items-center gap-1.5">
            <PenTool size={11} />
            Write
          </button>
          <button className="px-3 py-1.5 text-[10px] font-semibold rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white flex items-center gap-1.5 shadow-md">
            <BookOpen size={11} />
            Entries
          </button>
          <button className="px-3 py-1.5 text-[10px] font-medium rounded-xl text-[var(--text-secondary)] flex items-center gap-1.5">
            <BarChart3 size={11} />
            Insights
          </button>
          <button className="px-3 py-1.5 text-[10px] font-medium rounded-xl text-[var(--text-secondary)] flex items-center gap-1.5">
            <Settings size={11} />
            Settings
          </button>
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-full">
            <div className="w-6 h-6 bg-[var(--border)] rounded-full flex items-center justify-center">
              <User size={12} className="text-[var(--text-secondary)]" />
            </div>
            <span className="text-[10px] font-medium text-[var(--text-primary)]">Guest</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-[var(--background)] p-4 flex-1">
        {/* Quote Banner */}
        <div className="text-center mb-4 py-2 px-4 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border)]">
          <p className="text-[11px] text-[var(--text-primary)]">
            "<span className="font-medium">Carpe diem</span>" — <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent font-semibold">seize the day, embrace every moment</span>
          </p>
          <p className="text-[9px] text-[var(--text-secondary)] mt-0.5">Your journey of self-discovery begins with a single thought</p>
        </div>

        {/* Entries Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">Your Journal Entries</h2>
            <p className="text-[10px] text-[var(--text-secondary)]">3 entries • 3 shown</p>
          </div>
          <button className="px-3 py-1.5 text-[10px] font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white rounded-lg flex items-center gap-1.5 shadow-md">
            <Plus size={11} />
            New Entry
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-[var(--surface-elevated)] rounded-xl border border-[var(--border)] p-3 mb-3">
          <div className="flex items-center gap-2 mb-2.5 px-2 py-1.5 bg-[var(--background)] rounded-lg border border-[var(--border)]">
            <Search size={14} className="text-[var(--text-secondary)]" />
            <span className="text-[10px] text-[var(--text-muted)]">Search entries...</span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <p className="text-[8px] text-[var(--text-secondary)] mb-1 font-medium">Mood</p>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                <Smile size={11} className="text-[var(--text-secondary)]" />
                <span className="text-[9px] text-[var(--text-primary)]">All Moods</span>
                <ChevronDown size={10} className="text-[var(--text-secondary)] ml-auto" />
              </div>
            </div>
            <div>
              <p className="text-[8px] text-[var(--text-secondary)] mb-1 font-medium">Tag</p>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                <Tag size={11} className="text-[var(--text-secondary)]" />
                <span className="text-[9px] text-[var(--text-primary)]">All Tags</span>
                <ChevronDown size={10} className="text-[var(--text-secondary)] ml-auto" />
              </div>
            </div>
            <div>
              <p className="text-[8px] text-[var(--text-secondary)] mb-1 font-medium">Sort By</p>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                <Filter size={11} className="text-[var(--text-secondary)]" />
                <span className="text-[9px] text-[var(--text-primary)]">Newest First</span>
                <ChevronDown size={10} className="text-[var(--text-secondary)] ml-auto" />
              </div>
            </div>
          </div>
        </div>

        {/* Entry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {entries.map((entry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[var(--surface-elevated)] rounded-xl border border-[var(--border)] p-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Calendar size={10} className="text-[var(--text-secondary)]" />
                  <span className="text-[9px] text-[var(--text-secondary)]">{entry.date}</span>
                </div>
                <span className={`text-[9px] font-medium ${entry.moodColor}`}>😊 {entry.mood}</span>
              </div>
              <h3 className="text-[11px] font-bold text-[var(--text-primary)] mb-1.5">{entry.title}</h3>
              <p className="text-[9px] text-[var(--text-secondary)] leading-relaxed mb-2 line-clamp-3">{entry.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {entry.tags.map((tag, j) => (
                    <span key={j} className="text-[8px] text-[var(--primary)] font-medium bg-[var(--primary)]/10 px-1.5 py-0.5 rounded">#{tag}</span>
                  ))}
                </div>
                <span className="text-[8px] text-[var(--text-muted)]">{entry.words} words</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <MockupFooter />
    </motion.div>
  )
}

// Insights View Component
function InsightsView() {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  
  // Auto-scroll effect
  useEffect(() => {
    if (!scrollRef.current) return
    
    const scrollContainer = scrollRef.current
    let scrollPosition = 0
    const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight
    
    const scrollInterval = setInterval(() => {
      if (scrollPosition < maxScroll) {
        scrollPosition += 1
        scrollContainer.scrollTop = scrollPosition
      }
    }, 50)
    
    return () => clearInterval(scrollInterval)
  }, [])

  const timelineEntries = [
    { date: 'Sat, Jan 2', time: '10:45 pm', mood: 'Grateful', moodColor: 'bg-pink-500', content: "Today was an incredible day! I finally completed my personal project that I've been working on for months...", hasAI: true },
    { date: 'Fri, Jan 1', time: '08:30 pm', mood: 'Excited', moodColor: 'bg-yellow-500', content: "New year, new beginnings! I'm so excited about what 2026 has in store. Made some amazing resolutions...", hasAI: true },
    { date: 'Wed, Dec 31', time: '11:15 pm', mood: 'Happy', moodColor: 'bg-green-500', content: "Last day of 2025! Reflecting on all the wonderful memories this year brought. Grateful for the lessons...", hasAI: true, tags: ['reflection', 'grateful'] },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col"
    >
      {/* App Header */}
      <div className="bg-[var(--background)] border-b border-[var(--border)] px-3 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
            <PenTool size={14} className="text-white" />
          </div>
          <span className="font-bold text-base text-[var(--text-primary)]">Journaling</span>
        </div>
        <nav className="hidden md:flex items-center bg-[var(--surface-elevated)] rounded-2xl p-1 border border-[var(--border)]">
          <button className="px-3 py-1.5 text-[10px] font-medium rounded-xl text-[var(--text-secondary)] flex items-center gap-1.5">
            <PenTool size={11} />
            Write
          </button>
          <button className="px-3 py-1.5 text-[10px] font-medium rounded-xl text-[var(--text-secondary)] flex items-center gap-1.5">
            <BookOpen size={11} />
            Entries
          </button>
          <button className="px-3 py-1.5 text-[10px] font-semibold rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white flex items-center gap-1.5 shadow-md">
            <BarChart3 size={11} />
            Insights
          </button>
          <button className="px-3 py-1.5 text-[10px] font-medium rounded-xl text-[var(--text-secondary)] flex items-center gap-1.5">
            <Settings size={11} />
            Settings
          </button>
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-full">
            <div className="w-6 h-6 bg-[var(--border)] rounded-full flex items-center justify-center">
              <User size={12} className="text-[var(--text-secondary)]" />
            </div>
            <span className="text-[10px] font-medium text-[var(--text-primary)]">Guest</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        ref={scrollRef}
        className="bg-[var(--background)] p-4 flex-1 overflow-auto scrollbar-thin scrollbar-thumb-[var(--border)] scrollbar-track-transparent"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--border) transparent'
        }}
      >
        {/* Quote Banner */}
        <div className="text-center mb-3 py-2 px-4 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border)]">
          <p className="text-[11px] text-[var(--text-primary)]">
            "<span className="font-medium">Carpe diem</span>" — <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent font-semibold">seize the day, embrace every moment</span>
          </p>
          <p className="text-[9px] text-[var(--text-secondary)] mt-0.5">Your journey of self-discovery begins with a single thought</p>
        </div>

        {/* Insights Header */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-bold text-[var(--text-primary)]">Your Insights</h2>
            <Sparkles size={14} className="text-[var(--secondary)]" />
          </div>
          <p className="text-[10px] text-[var(--text-secondary)]">3 entries • Timeline view</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--surface-elevated)] rounded-xl border border-[var(--border)] p-3 text-center"
          >
            <p className="text-lg font-bold text-[var(--primary)]">3</p>
            <p className="text-[8px] text-[var(--text-secondary)] flex items-center justify-center gap-1">
              <ArrowRight size={8} className="rotate-[-45deg]" />
              Total Entries
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--surface-elevated)] rounded-xl border border-[var(--border)] p-3 text-center"
          >
            <p className="text-lg font-bold text-[var(--secondary)]">17</p>
            <p className="text-[8px] text-[var(--text-secondary)] flex items-center justify-center gap-1">
              <Sparkles size={8} />
              AI Insights
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[var(--surface-elevated)] rounded-xl border border-[var(--border)] p-3 text-center"
          >
            <p className="text-lg font-bold text-green-500">3</p>
            <p className="text-[8px] text-[var(--text-secondary)] flex items-center justify-center gap-1">
              <Calendar size={8} />
              Days Active
            </p>
          </motion.div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-[var(--border)]"></div>

          {timelineEntries.map((entry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="relative pl-7 pb-3"
            >
              {/* Timeline dot */}
              <div className="absolute left-0 top-0 w-6 h-6 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-lg flex items-center justify-center">
                <Calendar size={10} className="text-white" />
              </div>

              {/* Date header */}
              <p className="text-[10px] font-bold text-[var(--text-primary)] mb-1">{entry.date}</p>

              {/* Entry card */}
              <div className="bg-[var(--surface-elevated)] rounded-xl border border-[var(--border)] p-2.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[8px] text-[var(--text-secondary)]">{entry.time}</span>
                  <span className={`text-[7px] text-white px-1.5 py-0.5 rounded-full font-medium ${entry.moodColor}`}>
                    {entry.mood}
                  </span>
                  {entry.hasAI && (
                    <span className="text-[7px] text-[var(--secondary)] bg-[var(--secondary)]/10 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                      <Sparkles size={7} />
                      AI
                    </span>
                  )}
                </div>
                <p className="text-[9px] text-[var(--text-secondary)] leading-relaxed line-clamp-2">{entry.content}</p>
                {entry.tags && (
                  <div className="flex gap-1 mt-1.5">
                    {entry.tags.map((tag, j) => (
                      <span key={j} className="text-[7px] text-[var(--text-muted)] bg-[var(--background)] px-1.5 py-0.5 rounded border border-[var(--border)]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Beginning marker */}
          <div className="relative pl-7">
            <div className="absolute left-0 top-0 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Star size={10} className="text-white" />
            </div>
            <p className="text-[10px] font-bold text-[var(--text-primary)]">Beginning of your journal</p>
            <p className="text-[8px] text-[var(--text-secondary)]">Your story starts here</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <MockupFooter />
    </motion.div>
  )
}

// Shared Footer Component
function MockupFooter() {
  return (
    <div className="bg-[var(--background)] border-t border-[var(--border)] px-4 py-2 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-lg flex items-center justify-center shadow-md shadow-[var(--primary)]/20">
          <PenTool size={10} className="text-white" />
        </div>
        <span className="text-[11px] font-semibold text-[var(--text-primary)]">Journaling</span>
      </div>
      <div className="hidden sm:flex items-center gap-1">
        {['Privacy', 'Terms', 'Contact'].map((link) => (
          <span key={link} className="px-2 py-1 text-[9px] font-medium text-[var(--text-secondary)]">
            {link}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2 text-[9px]">
        <span className="flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-green-600 dark:text-green-400 font-semibold uppercase tracking-wide">Live</span>
        </span>
        <span className="flex items-center gap-1 bg-[var(--primary)]/10 px-2 py-0.5 rounded-full">
          <Shield size={9} className="text-[var(--primary)]" />
          <span className="text-[var(--primary)] font-semibold uppercase tracking-wide">Secure</span>
        </span>
      </div>
    </div>
  )
}

// Hero CTA Component
export function HeroCTA() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="text-center mt-10"
    >
      {/* Headline */}
      <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-3">
        Your Thoughts,{' '}
        <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
          AI-Powered
        </span>
      </h2>
      <p className="text-base text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
        Transform daily reflections into meaningful insights. Start journaling for free.
      </p>
      
      {/* CTA Button */}
      <Link href="https://app.journaling.tech">
        <motion.button 
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="relative inline-flex items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white font-semibold px-6 py-3 text-base rounded-xl shadow-lg shadow-[var(--primary)]/25 cursor-pointer group"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
          <span className="relative flex items-center gap-2">
            Try Journaling Now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </motion.button>
      </Link>
      
      {/* Trust indicators */}
      <div className="flex items-center justify-center gap-6 mt-5 text-xs text-[var(--text-secondary)]">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Free Forever
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          No Sign-up Required
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          Private & Secure
        </span>
      </div>
    </motion.div>
  )
}
