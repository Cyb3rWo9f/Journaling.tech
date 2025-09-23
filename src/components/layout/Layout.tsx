'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { PenTool, Calendar, BarChart3, Settings, Heart, Star, Coffee, Shield, Zap, BookOpen, TrendingUp, Sparkles, Lock, Moon, Sun } from 'lucide-react'
import { SimpleThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { UserProfile } from '@/components/auth/UserProfile'
import { useTheme } from '@/context/ThemeContext'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { resolvedTheme } = useTheme();
  const [isThemeChanging, setIsThemeChanging] = useState(false);
  const prevTheme = React.useRef(resolvedTheme);
  
  // Detect theme changes and trigger animation
  useEffect(() => {
    if (prevTheme.current !== resolvedTheme && prevTheme.current) {
      setIsThemeChanging(true);
      const timer = setTimeout(() => setIsThemeChanging(false), 800);
      return () => clearTimeout(timer);
    }
    prevTheme.current = resolvedTheme;
  }, [resolvedTheme]);
  
  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0f13] text-gray-900 dark:text-gray-100 relative overflow-hidden flex flex-col">
      {/* Theme change overlay animation */}
      <AnimatePresence>
        {isThemeChanging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed inset-0 z-50 pointer-events-none ${
              resolvedTheme === 'dark' 
                ? 'bg-gradient-to-r from-indigo-900/20 to-indigo-500/20' 
                : 'bg-gradient-to-r from-amber-200/20 to-amber-400/20'
            }`}
          >
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Modern Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 dark:from-transparent dark:via-transparent dark:to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/10 to-transparent dark:from-transparent dark:to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-500/10 to-transparent dark:from-transparent dark:to-transparent rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-7xl pb-20 md:pb-6">
          {children}
        </main>
        <MobileBottomNav />
        <Footer />
      </div>
    </div>
  )
}

function Header() {
  const router = useRouter()
  // Mobile menu state removed since we now use bottom navigation for mobile
  
  const navigationItems = [
    { icon: PenTool, label: 'Write', href: '/' },
    { icon: Calendar, label: 'Entries', href: '/entries' },
    { icon: BarChart3, label: 'Insights', href: '/insights' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  // Function to check if a nav item is active
  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return router.pathname === '/'
    }
    return router.pathname === href
  }

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="hidden md:block sticky top-0 z-50 bg-[var(--surface)] border-b border-[var(--border)] shadow-sm"
    >
      <div className="container mx-auto px-4 py-3 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo Section - Compact & Modern */}
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-xl flex items-center justify-center shadow-md ring-1 ring-transparent">
              <PenTool size={18} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-[var(--text-primary)] font-['Space_Grotesk'] tracking-tight">
                Journaling
              </h1>
            </div>
          </motion.div>

          {/* Center Navigation - Pill Style (Desktop Only) */}
          <nav className="hidden md:flex items-center nav-pill-container elevated-element" aria-label="Primary">
            {navigationItems.map((item, index) => {
              const isActive = isActiveRoute(item.href)
              return (
                <motion.div
                  key={item.label}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <button
                    onClick={() => router.push(item.href)}
                    className={`header-btn ${isActive ? 'header-btn--active' : 'header-btn--idle'}`}
                  >
                    <item.icon size={16} />
                    <span className="text-sm font-medium font-['Space_Grotesk']">{item.label}</span>
                  </button>
                </motion.div>
              )
            })}
          </nav>

          {/* Right Side - Theme Toggle & User Profile */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center space-x-3"
          >
            {/* Mobile Menu Button - Hidden since we have bottom nav */}
            {/* Mobile hamburger menu is now disabled in favor of bottom navigation */}
            
            {/* User Profile */}
            <UserProfile />
            
            {/* Theme Toggle */}
            <div className="p-1 rounded-full">
              <SimpleThemeToggle />
            </div>
          </motion.div>
        </div>

        {/* Enhanced Mobile Navigation Menu - Hidden in favor of bottom navigation */}
        {/* Mobile hamburger menu is now disabled since we have bottom navigation
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden mt-6 overflow-hidden"
            >
              Background blur overlay
              <div className="absolute inset-x-0 top-full h-screen bg-black/20 backdrop-blur-sm -z-10"></div>
              
              Enhanced mobile nav container
              <div className="bg-gradient-to-br from-[var(--surface)]/95 to-[var(--surface)]/90 backdrop-blur-xl rounded-2xl border border-[var(--border)]/50 shadow-2xl p-6 mx-2">
                Decorative header
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-lg flex items-center justify-center">
                      <PenTool size={16} className="text-white" />
                    </div>
                    <span className="text-lg font-bold text-[var(--text-primary)] font-['Space_Grotesk']">Navigation</span>
                  </div>
                </div>

                <nav className="grid grid-cols-2 gap-3" aria-label="Mobile Navigation">
                  {navigationItems.map((item, index) => {
                    const isActive = isActiveRoute(item.href)
                    return (
                      <motion.button
                        key={item.label}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        onClick={() => {
                          router.push(item.href)
                          setIsMobileMenuOpen(false)
                        }}
                        className={`relative group flex flex-col items-center justify-center space-y-2 p-4 rounded-xl transition-all duration-300 ${
                          isActive 
                            ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white shadow-lg shadow-[var(--primary)]/25' 
                            : 'bg-gradient-to-br from-[var(--surface)] to-[var(--surface)]/50 hover:from-[var(--primary)]/10 hover:to-[var(--secondary)]/10 text-[var(--text-primary)] border border-[var(--border)]/30 hover:border-[var(--primary)]/30'
                        }`}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Icon with enhanced styling
                        <div className={`p-2 rounded-lg transition-all duration-300 ${
                          isActive 
                            ? 'bg-white/20 backdrop-blur-sm' 
                            : 'bg-[var(--primary)]/10 group-hover:bg-[var(--primary)]/20'
                        }`}>
                          <item.icon 
                            size={24} 
                            className={`transition-all duration-300 ${
                              isActive 
                                ? 'text-white' 
                                : 'text-[var(--primary)] group-hover:scale-110'
                            }`} 
                          />
                        </div>
                        
                        Label with better typography
                        <span className={`text-sm font-semibold font-['Space_Grotesk'] tracking-wide ${
                          isActive 
                            ? 'text-white' 
                            : 'text-[var(--text-primary)] group-hover:text-[var(--primary)]'
                        }`}>
                          {item.label}
                        </span>

                        Active indicator dot
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-lg"
                          />
                        )}

                        Hover glow effect
                        <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                          !isActive ? 'bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5 blur-sm' : ''
                        }`}></div>
                      </motion.button>
                    )
                  })}
                </nav>

                Bottom section with theme toggle
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 pt-4 border-t border-[var(--border)]/30 flex items-center justify-between"
                >
                  <span className="text-sm text-[var(--text-secondary)] font-medium">Theme</span>
                  <div className="p-1 rounded-full bg-[var(--surface)] border border-[var(--border)]/50">
                    <SimpleThemeToggle />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        */}
      </div>
    </motion.header>
  )
}

interface PageContainerProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
}

export function PageContainer({ children, title, subtitle, className = '' }: PageContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`max-w-5xl mx-auto ${className}`}
    >
      {/* Beautiful Quote Section - Always Displayed */}
      <motion.div 
        className="text-center mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Modern Minimalist Quote */}
        <div className="relative group">
          {/* Glowing background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/5 via-[var(--secondary)]/10 to-[var(--primary)]/5 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          
          {/* Quote container */}
          <div className="relative glossy-card bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/10 elevated-element">
            {/* Elegant quote with beautiful typography - now with responsive text layout */}
            <div className="text-center">
              <p className="text-xl md:text-2xl font-light text-[var(--text-primary)] tracking-wide leading-relaxed flex flex-wrap items-center justify-center">
                <span className="text-[var(--primary)] font-normal inline-block">Carpe diem</span>
                <span className="text-[var(--text-secondary)] mx-2 hidden md:inline-block">•</span>
                <span className="text-[var(--secondary)] font-normal inline-block md:ml-0 ml-1">let's seize the day</span>
              </p>
            </div>
            
            {/* Minimal accent */}
            <div className="mt-2 flex justify-center">
              <motion.div 
                className="w-8 h-0.5 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              ></motion.div>
            </div>
          </div>
        </div>
      </motion.div>
      {children}
    </motion.div>
  )
}

function MobileBottomNav() {
  const router = useRouter()
  
  const navigationItems = [
    { icon: PenTool, label: 'Write', href: '/' },
    { icon: Calendar, label: 'Entries', href: '/entries' },
    { icon: BarChart3, label: 'Insights', href: '/insights' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  // Function to check if a nav item is active
  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return router.pathname === '/'
    }
    return router.pathname === href
  }

  return (
    <motion.nav 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.320, 1] }}
  className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0b0f13]/95 backdrop-blur-2xl border-t border-gray-200/50 dark:border-gray-700/50 shadow-2xl pb-safe"
      aria-label="Mobile Bottom Navigation"
    >
      {/* Enhanced decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/60 dark:via-purple-400/60 to-transparent"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gray-300 dark:bg-gray-700 rounded-b-full"></div>
      
      <div className="px-4 py-2 pb-safe">
  <div className="flex items-center justify-around relative bg-white/90 dark:bg-[#0b0f13]/90 rounded-2xl p-2 mx-2 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          {navigationItems.map((item, index) => {
            const isActive = isActiveRoute(item.href)
            return (
              <motion.button
                key={item.label}
                initial={{ y: 30, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ 
                  delay: index * 0.1, 
                  duration: 0.5,
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
                onClick={() => router.push(item.href)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 group min-w-[64px] ${
                  isActive 
                    ? 'bg-gradient-to-t from-blue-500 via-purple-500 to-purple-400 dark:from-blue-600 dark:via-purple-600 dark:to-purple-500 shadow-lg shadow-purple-500/25' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
                whileHover={{ 
                  scale: 1.1, 
                  y: -2,
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                whileTap={{ 
                  scale: 0.95,
                  transition: { duration: 0.1 }
                }}
              >
                {/* Icon with enhanced styling and animations */}
                <motion.div 
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-white/20 backdrop-blur-sm' 
                      : 'group-hover:bg-purple-50 dark:group-hover:bg-purple-900/30'
                  }`}
                  animate={isActive ? {
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  } : {}}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  <item.icon 
                    size={20} 
                    className={`transition-all duration-300 ${
                      isActive 
                        ? 'text-white drop-shadow-sm' 
                        : 'text-gray-600 dark:text-gray-400 group-hover:text-purple-500 dark:group-hover:text-purple-400'
                    }`} 
                  />
                </motion.div>

                {/* Label with enhanced typography */}
                <motion.span 
                  className={`text-xs font-semibold font-['Space_Grotesk'] mt-1 transition-all duration-300 tracking-wide ${
                    isActive 
                      ? 'text-white drop-shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 group-hover:text-purple-500 dark:group-hover:text-purple-400'
                  }`}
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: isActive ? 1 : 0.8 }}
                >
                  {item.label}
                </motion.span>

                {/* Active indicator with glow */}
                {isActive && (
                  <>
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-1 w-8 h-1 bg-white rounded-full shadow-lg"
                      layoutId="mobileActiveIndicator"
                    />
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.6 }}
                      className="absolute inset-0 rounded-xl bg-purple-500/20 dark:bg-purple-400/20 blur-sm"
                    />
                  </>
                )}

                {/* Enhanced ripple effect on tap */}
                <motion.div
                  className="absolute inset-0 rounded-xl bg-purple-500/10 dark:bg-purple-400/10"
                  initial={{ scale: 0, opacity: 0 }}
                  whileTap={{ 
                    scale: 1.5, 
                    opacity: [0, 0.3, 0],
                    transition: { duration: 0.4 }
                  }}
                />

                {/* Floating notification dot for future features */}
                {item.label === 'Write' && (
                  <motion.div
                    className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full shadow-lg"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.7, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Optional: Add a subtle haptic feedback indicator */}
        <motion.div 
          className="text-center mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="w-12 h-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent rounded-full mx-auto"></div>
        </motion.div>
      </div>
    </motion.nav>
  )
}

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <motion.footer 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="hidden md:block relative overflow-hidden mt-6"
    >
      {/* Sleek Background */}
      <div className="absolute inset-0 glass-surface backdrop-blur-xl border-t border-white/20"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/3 via-transparent to-[var(--secondary)]/3"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-24 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 rounded-full blur-2xl smooth-glow" />
      
      <div className="relative container mx-auto px-6 py-4 max-w-4xl">
        <div className="flex flex-col items-center space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 gap-4">
          {/* Brand & Info */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-xl flex items-center justify-center shadow-lg">
              <PenTool size={16} className="text-white" />
            </div>
            <span className="text-lg font-semibold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent font-['Space_Grotesk'] tracking-tight">
              Journaling
            </span>
          </div>

          {/* Minimal Links */}
          <div className="flex items-center space-x-6">
            <a href="#" className="text-xs text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors font-medium">Privacy</a>
            <a href="#" className="text-xs text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors font-medium">Terms</a>
            <a href="#" className="text-xs text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors font-medium">Contact</a>
          </div>

          {/* Status & Copyright */}
          <div className="flex flex-col items-center space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 glass-surface elevated-element rounded-full px-3 py-1 border border-white/20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse smooth-glow"></div>
                <span className="text-xs text-[var(--text-secondary)] font-medium">Live</span>
              </div>
              <div className="flex items-center space-x-1 glass-surface elevated-element rounded-full px-3 py-1 border border-[var(--primary)]/30">
                <Lock size={10} className="text-[var(--primary)]" />
                <span className="text-xs text-[var(--primary)] font-semibold">Secure</span>
              </div>
            </div>
            <span className="text-xs text-[var(--text-secondary)]">© {currentYear} Journaling</span>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}