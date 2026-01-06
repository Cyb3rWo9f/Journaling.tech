'use client'

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { StreakData } from '@/types'
import { Flame, Trophy, Calendar, TrendingUp } from 'lucide-react'

interface StreakCardProps {
  streakData: StreakData
  className?: string
}

export function StreakCard({ streakData, className }: StreakCardProps) {
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStreakStatus = () => {
    if (!streakData.lastEntryDate) return 'No entries yet'
    
    const lastEntry = new Date(streakData.lastEntryDate)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    // Reset time to compare dates only
    lastEntry.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    yesterday.setHours(0, 0, 0, 0)
    
    if (lastEntry.getTime() === today.getTime()) {
      return 'Active today! 🔥'
    } else if (lastEntry.getTime() === yesterday.getTime()) {
      return 'Write today to continue!'
    } else {
      return 'Streak broken 💔'
    }
  }

  const getStreakColor = () => {
    const status = getStreakStatus()
    if (status.includes('Active')) return 'text-green-600'
    if (status.includes('continue')) return 'text-yellow-600'
    return 'text-red-600'
  }

  const calculateStreakProgress = () => {
    if (streakData.longestStreak === 0) return 0
    return Math.min((streakData.currentStreak / streakData.longestStreak) * 100, 100)
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {/* Current Streak Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2 text-[var(--text-primary)]">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <span>Current Streak</span>
            </h3>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              getStreakColor() === 'text-green-600' 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                : getStreakColor() === 'text-yellow-600' 
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' 
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}>
              {getStreakStatus()}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-5xl font-bold text-orange-500 mb-1 font-en">
                {streakData.currentStreak}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                {streakData.currentStreak === 1 ? 'day' : 'days'}
              </div>
            </div>
            
            {streakData.streakStartDate && (
              <div className="text-center p-3 rounded-xl bg-[var(--background)] dark:bg-white/5 border border-[var(--border)] dark:border-transparent">
                <div className="text-xs text-[var(--text-secondary)]">Started</div>
                <div className="text-sm font-medium text-[var(--text-primary)]">
                  {formatDate(streakData.streakStartDate)}
                </div>
              </div>
            )}
            
            <div className="text-center p-3 rounded-xl bg-[var(--background)] dark:bg-white/5 border border-[var(--border)] dark:border-transparent">
              <div className="text-xs text-[var(--text-secondary)]">Last Entry</div>
              <div className="text-sm font-medium text-[var(--text-primary)]">
                {formatDate(streakData.lastEntryDate)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Longest Streak Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2 text-[var(--text-primary)]">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Trophy className="h-5 w-5 text-yellow-500" />
              </div>
              <span>Longest Streak</span>
            </h3>
            {streakData.currentStreak === streakData.longestStreak && streakData.longestStreak > 0 && (
              <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2.5 py-1 rounded-full font-medium">
                Record! 🎉
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-5xl font-bold text-yellow-500 mb-1 font-en">
                {streakData.longestStreak}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                {streakData.longestStreak === 1 ? 'day' : 'days'}
              </div>
            </div>
            
            {/* Progress towards personal best */}
            <div className="space-y-2 p-3 rounded-xl bg-[var(--background)] dark:bg-white/5 border border-[var(--border)] dark:border-transparent">
              <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                <span>Progress</span>
                <span className="font-en">{Math.round(calculateStreakProgress())}%</span>
              </div>
              <div className="w-full bg-[var(--border)] dark:bg-white/10 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${calculateStreakProgress()}%` }}
                />
              </div>
            </div>
            
            <div className="text-center p-3 rounded-xl bg-[var(--background)] dark:bg-white/5 border border-[var(--border)] dark:border-transparent">
              <div className="text-xs text-[var(--text-secondary)]">
                {streakData.currentStreak < streakData.longestStreak 
                  ? `${streakData.longestStreak - streakData.currentStreak} days to beat record`
                  : streakData.currentStreak === streakData.longestStreak && streakData.longestStreak > 0
                  ? 'You tied your record!'
                  : 'Keep writing to set a record!'
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}