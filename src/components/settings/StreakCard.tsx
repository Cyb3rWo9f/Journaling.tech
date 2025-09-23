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
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 ${className}`}>
      {/* Current Streak Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-red-50/50 to-pink-50/50 dark:from-orange-900/20 dark:via-red-900/10 dark:to-pink-900/10 border-0 shadow-lg dark:shadow-gray-900/50">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-pink-500/5 dark:from-orange-400/10 dark:via-red-400/10 dark:to-pink-400/10" />
        <CardHeader className="pb-2 sm:pb-3 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
            <h3 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="p-1.5 sm:p-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 shadow-md sm:shadow-lg">
                <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="text-sm sm:text-base">Current Streak</span>
            </h3>
            <div className={`text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full backdrop-blur-sm ${getStreakColor() === 'text-green-600' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 
              getStreakColor() === 'text-yellow-600' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' : 
              'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'}`}>
              {getStreakStatus()}
            </div>
          </div>
        </CardHeader>
  <CardContent className="relative z-10 bg-white/40 dark:bg-[#0b0f13]/40 backdrop-blur-sm py-2 sm:py-4">
          <div className="space-y-3 sm:space-y-4">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-1 sm:mb-2">
                {streakData.currentStreak}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                {streakData.currentStreak === 1 ? 'day' : 'days'}
              </div>
            </div>
            
            {streakData.streakStartDate && (
              <div className="text-center p-2 sm:p-3 rounded-lg bg-white/60 dark:bg-[#0b0f13]/60 backdrop-blur-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Started</div>
                <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                  {formatDate(streakData.streakStartDate)}
                </div>
              </div>
            )}
            
            <div className="text-center p-2 sm:p-3 rounded-lg bg-white/60 dark:bg-[#0b0f13]/60 backdrop-blur-sm">
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Last Entry</div>
              <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                {formatDate(streakData.lastEntryDate)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Longest Streak Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-amber-50/50 to-orange-50/50 dark:from-yellow-900/20 dark:via-amber-900/10 dark:to-orange-900/10 border-0 shadow-lg dark:shadow-gray-900/50">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-amber-500/5 to-orange-500/5 dark:from-yellow-400/10 dark:via-amber-400/10 dark:to-orange-400/10" />
        <CardHeader className="pb-2 sm:pb-3 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
            <h3 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="p-1.5 sm:p-2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 shadow-md sm:shadow-lg">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="text-sm sm:text-base">Personal Best</span>
            </h3>
            {streakData.currentStreak === streakData.longestStreak && streakData.longestStreak > 0 && (
              <div className="text-xs bg-gradient-to-r from-yellow-400 to-amber-400 text-yellow-900 px-2 sm:px-3 py-1 rounded-full font-semibold shadow-md sm:shadow-lg animate-pulse">
                New Record! 🎉
              </div>
            )}
          </div>
        </CardHeader>
  <CardContent className="relative z-10 bg-white/40 dark:bg-[#0b0f13]/40 backdrop-blur-sm py-2 sm:py-4">
          <div className="space-y-3 sm:space-y-4">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent mb-1 sm:mb-2">
                {streakData.longestStreak}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                {streakData.longestStreak === 1 ? 'day' : 'days'}
              </div>
            </div>
            
            {/* Progress towards personal best */}
            <div className="space-y-2 sm:space-y-3 p-2 sm:p-3 rounded-lg bg-white/60 dark:bg-[#0b0f13]/60 backdrop-blur-sm">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 font-medium">
                <span>Progress to personal best</span>
                <span>{Math.round(calculateStreakProgress())}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-[#1a1d20] rounded-full h-2 sm:h-3 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 h-2 sm:h-3 rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${calculateStreakProgress()}%` }}
                />
              </div>
            </div>
            
            <div className="text-center p-2 sm:p-3 rounded-lg bg-white/60 dark:bg-[#0b0f13]/60 backdrop-blur-sm">
              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
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