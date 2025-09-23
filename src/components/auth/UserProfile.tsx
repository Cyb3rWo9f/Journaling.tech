'use client'

import React from 'react'
import { LogOut, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export function UserProfile() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <div className="flex items-center space-x-2 glass-surface elevated-element rounded-full px-3 py-1.5 border border-white/20">
      {user.photoURL ? (
        <img
          src={user.photoURL}
          alt={user.displayName || 'User'}
          className="w-6 h-6 rounded-full"
        />
      ) : (
        <div className="w-6 h-6 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center">
          <User className="w-3 h-3 text-white" />
        </div>
      )}
      <span className="text-sm font-medium text-[var(--text-primary)] hidden sm:block">
        {user.displayName?.split(' ')[0] || 'User'}
      </span>
      <button
        onClick={logout}
        className="p-1 hover:bg-red-500/10 rounded-full transition-colors group"
        title="Sign out"
      >
        <LogOut className="w-3 h-3 text-[var(--text-secondary)] group-hover:text-red-500" />
      </button>
    </div>
  )
}