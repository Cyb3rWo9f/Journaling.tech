'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
      className="relative w-12 h-12 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      aria-label="Toggle theme"
    >
      {/* Background gradient on hover */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: resolvedTheme === 'dark' 
            ? 'radial-gradient(circle at center, rgba(251, 191, 36, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%)'
        }}
      />
      
      {/* Moon icon */}
      <motion.div
        initial={false}
        animate={{ 
          y: resolvedTheme === 'dark' ? 0 : -40,
          opacity: resolvedTheme === 'dark' ? 1 : 0,
          rotate: resolvedTheme === 'dark' ? 0 : -90,
        }}
        transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 20 }}
        className="absolute text-indigo-400"
      >
        <Moon size={20} />
      </motion.div>
      
      {/* Sun icon */}
      <motion.div
        initial={false}
        animate={{ 
          y: resolvedTheme === 'dark' ? 40 : 0,
          opacity: resolvedTheme === 'dark' ? 0 : 1,
          rotate: resolvedTheme === 'dark' ? 90 : 0,
        }}
        transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 20 }}
        className="absolute text-amber-500"
      >
        <Sun size={20} />
      </motion.div>
      
      {/* Rays animation for sun */}
      <AnimatePresence>
        {resolvedTheme !== 'dark' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            {[...Array(8)].map((_, i) => (
              <motion.div 
                key={i}
                className="absolute w-0.5 h-1.5 bg-amber-400/40 rounded-full"
                style={{ 
                  transform: `rotate(${i * 45}deg) translateY(-16px)`
                }}
                animate={{
                  opacity: [0.4, 0.8, 0.4],
                  height: ['6px', '8px', '6px'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Stars animation for moon */}
      <AnimatePresence>
        {resolvedTheme === 'dark' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="absolute inset-0 pointer-events-none"
          >
            {[
              { top: '20%', left: '20%', delay: 0 },
              { top: '25%', right: '22%', delay: 0.2 },
              { bottom: '25%', left: '25%', delay: 0.4 },
            ].map((star, i) => (
              <motion.div 
                key={i}
                className="absolute w-1 h-1 bg-indigo-300/60 rounded-full"
                style={{ top: star.top, left: star.left, right: star.right, bottom: star.bottom }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: star.delay,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}