'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'modern' | 'elevated' | 'glass'
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  onClick?: () => void
}

export function Card({ 
  children, 
  className = '', 
  variant = 'modern', 
  hover = false,
  padding = 'none',
  onClick 
}: CardProps) {
  const baseClasses = 'relative overflow-hidden transition-all duration-200 ease-out'
  
  const variants = {
    default: 'bg-[var(--background)] border border-[var(--border)] dark:border-white/5 rounded-xl',
    modern: 'bg-[var(--surface)] dark:bg-[var(--surface)] border border-[var(--border)] dark:border-white/5 rounded-2xl',
    elevated: 'bg-[var(--surface-elevated)] dark:bg-[var(--surface-elevated)] border border-[var(--border)] dark:border-white/5 rounded-2xl shadow-lg dark:shadow-black/20',
    glass: 'bg-[var(--background)]/80 dark:bg-[var(--surface)]/80 backdrop-blur-xl border border-[var(--border)] dark:border-white/5 rounded-2xl'
  }

  const paddings = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-5 lg:p-6',
    lg: 'p-5 sm:p-6 lg:p-8'
  }

  const hoverClasses = hover ? 'hover:shadow-lg hover:border-[var(--primary)]/30 cursor-pointer' : ''
  const clickable = onClick ? 'cursor-pointer' : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
      whileHover={hover ? { y: -2 } : {}}
      whileTap={onClick ? { scale: 0.99 } : {}}
      className={`${baseClasses} ${variants[variant]} ${paddings[padding]} ${hoverClasses} ${clickable} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`p-4 sm:p-5 lg:p-6 pb-3 sm:pb-4 border-b border-[var(--border)] dark:border-white/5 ${className}`}>
      {children}
    </div>
  )
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`p-4 sm:p-5 lg:p-6 ${className}`}>
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`p-4 sm:p-5 lg:p-6 pt-3 sm:pt-4 border-t border-[var(--border)] ${className}`}>
      {children}
    </div>
  )
}