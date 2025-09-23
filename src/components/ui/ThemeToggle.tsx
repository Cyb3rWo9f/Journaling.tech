'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { Button } from './Button'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const themes = [
    { key: 'light' as const, icon: Sun, label: 'Light' },
    { key: 'dark' as const, icon: Moon, label: 'Dark' },
    { key: 'system' as const, icon: Monitor, label: 'System' }
  ]

  return (
    <div className="flex items-center space-x-1 p-1 glass-card rounded-xl">
      {themes.map(({ key, icon: Icon, label }) => (
        <Button
          key={key}
          variant={theme === key ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setTheme(key)}
          className="relative p-2"
          aria-label={`Switch to ${label} theme`}
        >
          <Icon size={16} />
          {theme === key && (
            <motion.div
              layoutId="activeTheme"
              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </Button>
      ))}
    </div>
  )
}

export function SimpleThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-full bg-[var(--surface)] border border-[var(--border)]/50 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 overflow-hidden"
      whileTap={{ scale: 0.92 }}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ 
          rotate: resolvedTheme === 'dark' ? 180 : 0,
          scale: resolvedTheme === 'dark' ? 1 : 1,
          y: resolvedTheme === 'dark' ? 0 : -30,
          opacity: resolvedTheme === 'dark' ? 1 : 0,
        }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
        className="absolute text-[var(--primary)]"
      >
        <Moon size={18} />
      </motion.div>
      
      <motion.div
        initial={false}
        animate={{ 
          rotate: resolvedTheme === 'dark' ? 0 : 0,
          scale: resolvedTheme === 'dark' ? 1 : 1,
          y: resolvedTheme === 'dark' ? 30 : 0,
          opacity: resolvedTheme === 'dark' ? 0 : 1,
        }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
        className="absolute text-amber-500"
      >
        <Sun size={18} />
      </motion.div>
      
      {/* Enhanced background indicator with glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          background: resolvedTheme === 'dark' 
            ? 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 80%)'
            : 'radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 80%)'
        }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Orbiting particles around the sun/moon */}
      {resolvedTheme === 'dark' ? (
        <motion.div
          className="absolute w-full h-full"
          initial={false}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div 
              key={i}
              className="absolute w-1 h-1 bg-indigo-400/50 rounded-full"
              style={{ 
                top: `${25 + i * 15}%`, 
                left: `${25 + i * 15}%`, 
                transformOrigin: 'center center',
                transform: `rotate(${i * 120}deg) translateX(${16}px)`
              }}
            />
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="absolute w-full h-full"
          initial={false}
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div 
              key={i}
              className="absolute w-1 h-1 bg-amber-400/70 rounded-full"
              style={{ 
                top: `${25 + i * 15}%`, 
                left: `${25 + i * 15}%`, 
                transformOrigin: 'center center',
                transform: `rotate(${i * 120}deg) translateX(${16}px)`
              }}
            />
          ))}
        </motion.div>
      )}
    </motion.button>
  )
}