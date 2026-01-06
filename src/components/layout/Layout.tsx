'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { PenTool, Calendar, BarChart3, Settings, Lock } from 'lucide-react'
import { SimpleThemeToggle } from '@/components/ui/ThemeToggle'
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
      const timer = setTimeout(() => setIsThemeChanging(false), 500);
      return () => clearTimeout(timer);
    }
    prevTheme.current = resolvedTheme;
  }, [resolvedTheme]);
  
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] relative flex flex-col">
      {/* Theme change overlay animation */}
      <AnimatePresence>
        {isThemeChanging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed inset-0 z-50 pointer-events-none ${
              resolvedTheme === 'dark' 
                ? 'bg-gradient-to-br from-primary-600/10 to-secondary-600/10' 
                : 'bg-gradient-to-br from-primary-200/20 to-secondary-200/20'
            }`}
          />
        )}
      </AnimatePresence>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl pb-24 md:pb-20 md:mt-16">
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
  
  const navigationItems = [
    { icon: PenTool, label: 'Home', href: '/' },
    { icon: Calendar, label: 'Entries', href: '/entries' },
    { icon: BarChart3, label: 'Insights', href: '/insights' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return router.pathname === '/'
    }
    return router.pathname === href
  }

  return (
    <header 
      className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-[var(--background)] border-b border-[var(--border)]"
    >
      <div className="container mx-auto px-4 lg:px-8 py-3 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
              <PenTool size={20} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight font-en">
                Journaling
              </h1>
            </div>
          </div>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-[var(--surface-elevated)] rounded-2xl p-1.5 border border-[var(--border)]" aria-label="Primary">
            {navigationItems.map((item) => {
              const isActive = isActiveRoute(item.href)
              return (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/25' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background)]'
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Right Side - Theme Toggle & User Profile */}
          <div className="flex items-center gap-3">
            <UserProfile />
            <div className="p-1.5 rounded-xl hover:bg-[var(--surface-elevated)] transition-colors">
              <SimpleThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
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
    <div className={`max-w-6xl mx-auto ${className}`}>
      {/* Inspirational Quote */}
      <div className="text-center mb-4 sm:mb-6 px-3">
        <div className="bg-[var(--surface-elevated)] rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-[var(--border)] inline-block">
          <p className="text-xs sm:text-lg font-medium text-[var(--text-primary)] whitespace-nowrap">
            <span className="text-[var(--primary)] font-semibold font-en">"Carpe diem"</span>
            <span className="text-[var(--text-muted)]"> — </span>
            <span className="text-[var(--secondary)]">seize the day, embrace every moment</span>
          </p>
          <p className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-1.5 sm:mt-2">
            Capture moments, track progress, unlock insights
          </p>
        </div>
      </div>
      {children}
    </div>
  )
}

function MobileBottomNav() {
  const router = useRouter()
  
  const navigationItems = [
    { icon: PenTool, label: 'Home', href: '/' },
    { icon: Calendar, label: 'Entries', href: '/entries' },
    { icon: BarChart3, label: 'Insights', href: '/insights' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return router.pathname === '/'
    }
    return router.pathname === href
  }

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--background)] border-t border-[var(--border)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
      aria-label="Mobile Bottom Navigation"
    >
      <div className="px-2 py-2">
        <div className="flex items-center justify-around bg-[var(--surface-elevated)] rounded-2xl p-1.5 mx-1 border border-[var(--border)]">
          {navigationItems.map((item) => {
            const isActive = isActiveRoute(item.href)
            return (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className={`relative flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl transition-all duration-200 min-w-[64px] ${
                  isActive 
                    ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] shadow-lg shadow-[var(--primary)]/20' 
                    : 'hover:bg-[var(--background)]'
                }`}
              >
                <item.icon 
                  size={20} 
                  className={`transition-colors duration-200 ${
                    isActive 
                      ? 'text-white' 
                      : 'text-[var(--text-secondary)]'
                  }`} 
                />

                <span 
                  className={`text-[10px] font-medium transition-colors duration-200 ${
                    isActive 
                      ? 'text-white' 
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {item.label}
                </span>

                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-white rounded-full" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="hidden md:block fixed bottom-0 left-0 right-0 z-40">
      <div className="border-t border-[var(--border)] bg-[var(--background)]">
        <div className="container mx-auto px-4 lg:px-8 py-3 max-w-7xl">
          <div className="flex items-center justify-between">
            {/* Brand */}
            <div className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-lg flex items-center justify-center shadow-md shadow-[var(--primary)]/20 group-hover:shadow-lg group-hover:shadow-[var(--primary)]/30 transition-shadow duration-300">
                <PenTool size={12} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                Journaling
              </span>
            </div>

            {/* Center Links */}
            <div className="flex items-center gap-1">
              {['Privacy', 'Terms', 'Contact'].map((link) => (
                <a 
                  key={link}
                  href="#" 
                  className="px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 rounded-lg transition-all duration-200"
                >
                  {link}
                </a>
              ))}
            </div>

            {/* Status Badges & Copyright */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-green-500/10 px-2.5 py-1 rounded-full">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] text-green-600 dark:text-green-400 font-semibold uppercase tracking-wide">Live</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[var(--primary)]/10 px-2.5 py-1 rounded-full">
                <Lock size={9} className="text-[var(--primary)]" />
                <span className="text-[10px] text-[var(--primary)] font-semibold uppercase tracking-wide">Secure</span>
              </div>
              <div className="h-4 w-[1px] bg-[var(--border)] mx-1" />
              <span className="text-[10px] text-[var(--text-muted)] font-medium">© {currentYear} Journaling</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}