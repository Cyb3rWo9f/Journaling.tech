'use client'

import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'save'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  isLoading?: boolean
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  isLoading = false,
  className,
  disabled,
  ...props 
}: ButtonProps) {
  // Subtle base: prefer gentle shadow/brightness change over scaling to avoid a "pop" feeling
  const baseClasses = 'relative inline-flex items-center justify-center font-medium transition-shadow duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
  primary: 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white shadow-md hover:shadow-lg focus:ring-[var(--primary)] hover:brightness-105',
  // Save variant: refined design with contained shadows and appealing effects
  save: `relative overflow-hidden bg-gradient-to-br from-[#ff6b6b] via-[#ff7a7a] to-[#ff8e8e] text-white font-semibold
         border border-white/30 rounded-lg
         shadow-[0_4px_16px_rgba(255,107,107,0.2),inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-1px_0_rgba(0,0,0,0.1)]
         hover:shadow-[0_6px_20px_rgba(255,107,107,0.3),inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_0_rgba(0,0,0,0.15)]
         hover:-translate-y-0.5 hover:scale-[1.01]
         active:scale-[0.99] active:translate-y-0
         transition-all duration-200 ease-out
         before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent before:translate-x-[-100%] before:transition-transform before:duration-500 hover:before:translate-x-[100%]
         focus:ring-2 focus:ring-[#ff6b6b]/40 focus:outline-none`,
    secondary: 'bg-[var(--surface)] text-[var(--text-primary)] border-2 border-[var(--border)] hover:bg-[var(--border)] hover:border-[var(--primary)] focus:ring-[var(--primary)]',
    ghost: 'text-[var(--text-primary)] hover:bg-[var(--surface)] focus:ring-[var(--primary)]',
    outline: 'bg-transparent text-[var(--primary)] border-2 border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white focus:ring-[var(--primary)]'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl'
  }

  const isDisabled = disabled || isLoading

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${className || ''}`}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}