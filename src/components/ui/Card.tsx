'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'modern' | 'elevated'
  hover?: boolean
  onClick?: () => void
}

export function Card({ 
  children, 
  className = '', 
  variant = 'modern', 
  hover = false,
  onClick 
}: CardProps) {
  const baseClasses = 'relative overflow-hidden transition-all duration-300 rounded-2xl'
  
  const variants = {
    default: 'bg-[var(--surface)] border border-[var(--border)] shadow-sm',
    modern: 'bg-[var(--surface)] border border-[var(--border)] shadow-lg hover:shadow-xl',
    elevated: 'bg-[var(--surface)] shadow-2xl border border-[var(--border)]'
  }

  const hoverClasses = hover ? 'hover:scale-105 hover:shadow-2xl cursor-pointer hover:-translate-y-1' : ''
  const clickable = onClick ? 'cursor-pointer' : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { scale: 1.02, y: -4 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      className={`${baseClasses} ${variants[variant]} ${hoverClasses} ${clickable} ${className}`}
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
    <div className={`p-6 pb-4 border-b border-[var(--border)] ${className}`}>
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
    <div className={`p-6 ${className}`}>
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
    <div className={`p-6 pt-4 border-t border-[var(--border)] ${className}`}>
      {children}
    </div>
  )
}