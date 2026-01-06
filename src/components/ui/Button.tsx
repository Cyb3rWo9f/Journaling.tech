'use client'

import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'save' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  children: React.ReactNode
  isLoading?: boolean
  fullWidth?: boolean
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  isLoading = false,
  fullWidth = false,
  className,
  disabled,
  ...props 
}: ButtonProps) {
  const baseClasses = 'relative inline-flex items-center justify-center font-medium transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: `bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white shadow-md 
              hover:shadow-lg hover:brightness-105 active:scale-[0.98]`,
    
    secondary: `bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] 
                hover:bg-[var(--border-light)] hover:border-[var(--primary)] active:scale-[0.98]`,
    
    ghost: `text-[var(--text-primary)] hover:bg-[var(--border-light)] active:scale-[0.98]`,
    
    outline: `bg-transparent text-[var(--primary)] border border-[var(--primary)] 
              hover:bg-[var(--primary)] hover:text-white active:scale-[0.98]`,
    
    save: `bg-gradient-to-br from-[var(--primary)] via-[var(--primary)] to-[var(--primary-dark)] text-white font-semibold
           border border-white/20 shadow-lg shadow-[var(--primary)]/20
           hover:shadow-xl hover:shadow-[var(--primary)]/25 hover:-translate-y-0.5
           active:scale-[0.98] active:translate-y-0`,
    
    danger: `bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md 
             hover:shadow-lg hover:brightness-105 active:scale-[0.98]`
  }
  
  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs rounded-md gap-1.5',
    sm: 'px-3 py-2 text-sm rounded-lg gap-2',
    md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3 text-base rounded-xl gap-2.5'
  }

  const isDisabled = disabled || isLoading

  return (
    <button
      className={`
        ${baseClasses} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className || ''}
      `}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4"
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