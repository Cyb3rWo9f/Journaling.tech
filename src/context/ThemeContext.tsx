'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { storageService } from '@/services/storage'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = storageService.getTheme()
    setThemeState(savedTheme)
  }, [])

  useEffect(() => {
    const root = document.documentElement

    // Remove existing theme classes
    root.classList.remove('light', 'dark')

    let effectiveTheme: 'light' | 'dark'

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      effectiveTheme = systemTheme
    } else {
      effectiveTheme = theme
    }

    // Apply theme class and CSS variables
    root.classList.add(effectiveTheme)
    setResolvedTheme(effectiveTheme)

    // Apply data-theme attribute instead of directly overriding CSS variables
    // This will use the CSS variables defined in globals.css
    document.documentElement.setAttribute('data-theme', effectiveTheme)
    
    // Add a transition class briefly to create a smooth animation during theme change
    document.documentElement.classList.add('theme-transition')
    
    // Remove transition class after transition completes to avoid affecting other animations
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition')
    }, 600) // Match this with the transition duration in CSS

    // Listen for system theme changes when using system theme
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        root.classList.remove('light', 'dark')
        const newTheme = e.matches ? 'dark' : 'light'
        root.classList.add(newTheme)
        setResolvedTheme(newTheme)
        
        // Update theme with smooth transition
        document.documentElement.setAttribute('data-theme', newTheme)
        
        // Add a transition class briefly
        document.documentElement.classList.add('theme-transition')
        
        // Remove transition class after transition completes
        setTimeout(() => {
          document.documentElement.classList.remove('theme-transition')
        }, 600)
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    storageService.saveTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}