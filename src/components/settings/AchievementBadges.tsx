'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Achievement, UserProfile } from '@/types'
import { 
  Trophy, 
  Star, 
  Crown, 
  Zap, 
  Target, 
  BookOpen, 
  Calendar,
  Flame,
  Award,
  Gem
} from 'lucide-react'

interface AchievementBadgesProps {
  profile: UserProfile
  className?: string
}

// Predefined achievements that unlock automatically
const ACHIEVEMENTS: Achievement[] = [
  // Writing Achievements
  {
    id: 'first_entry',
    title: 'First Steps',
    description: 'Write your first journal entry',
    icon: 'BookOpen',
    category: 'writing',
    requirement: { type: 'entries_count', value: 1 },
    rarity: 'common'
  },
  {
    id: 'prolific_writer',
    title: 'Prolific Writer',
    description: 'Write 10 journal entries',
    icon: 'Target',
    category: 'writing',
    requirement: { type: 'entries_count', value: 10 },
    rarity: 'common'
  },
  {
    id: 'seasoned_writer',
    title: 'Seasoned Writer',
    description: 'Write 50 journal entries',
    icon: 'Star',
    category: 'writing',
    requirement: { type: 'entries_count', value: 50 },
    rarity: 'rare'
  },
  {
    id: 'master_writer',
    title: 'Master Writer',
    description: 'Write 100 journal entries',
    icon: 'Crown',
    category: 'writing',
    requirement: { type: 'entries_count', value: 100 },
    rarity: 'epic'
  },
  
  // Streak Achievements
  {
    id: 'streak_starter',
    title: 'Streak Starter',
    description: 'Maintain a 3-day writing streak',
    icon: 'Flame',
    category: 'streak',
    requirement: { type: 'streak_days', value: 3 },
    rarity: 'common'
  },
  {
    id: 'consistent_writer',
    title: 'Consistent Writer',
    description: 'Maintain a 7-day writing streak',
    icon: 'Calendar',
    category: 'streak',
    requirement: { type: 'streak_days', value: 7 },
    rarity: 'common'
  },
  {
    id: 'streak_master',
    title: 'Streak Master',
    description: 'Maintain a 30-day writing streak',
    icon: 'Zap',
    category: 'streak',
    requirement: { type: 'streak_days', value: 30 },
    rarity: 'rare'
  },
  {
    id: 'streak_legend',
    title: 'Streak Legend',
    description: 'Maintain a 100-day writing streak',
    icon: 'Trophy',
    category: 'streak',
    requirement: { type: 'streak_days', value: 100 },
    rarity: 'legendary'
  },
  
  // Milestone Achievements
  {
    id: 'week_one',
    title: 'Week One Complete',
    description: 'Complete your first week of journaling',
    icon: 'Award',
    category: 'milestone',
    requirement: { type: 'consecutive_days', value: 7 },
    rarity: 'common'
  },
  {
    id: 'month_warrior',
    title: 'Month Warrior',
    description: 'Journal for an entire month',
    icon: 'Gem',
    category: 'milestone',
    requirement: { type: 'consecutive_days', value: 30 },
    rarity: 'epic'
  }
]

const getIcon = (iconName: string) => {
  const icons: { [key: string]: React.ComponentType<any> } = {
    BookOpen,
    Target,
    Star,
    Crown,
    Flame,
    Calendar,
    Zap,
    Trophy,
    Award,
    Gem
  }
  
  const IconComponent = icons[iconName] || Trophy
  return IconComponent
}

const getRarityColor = (rarity: Achievement['rarity']) => {
  switch (rarity) {
    case 'common': return 'text-gray-600 bg-gray-100'
    case 'rare': return 'text-blue-600 bg-blue-100'
    case 'epic': return 'text-purple-600 bg-purple-100'
    case 'legendary': return 'text-yellow-600 bg-yellow-100'
    default: return 'text-gray-600 bg-gray-100'
  }
}

const getRarityIconBg = (rarity: Achievement['rarity']) => {
  switch (rarity) {
    case 'common': return 'bg-gradient-to-r from-gray-500 to-gray-600'
    case 'rare': return 'bg-gradient-to-r from-blue-500 to-blue-600'
    case 'epic': return 'bg-gradient-to-r from-purple-500 to-purple-600'
    case 'legendary': return 'bg-gradient-to-r from-yellow-500 to-yellow-600'
    default: return 'bg-gradient-to-r from-gray-500 to-gray-600'
  }
}

const getRarityBadgeColor = (rarity: Achievement['rarity']) => {
  switch (rarity) {
    case 'common': return 'bg-gray-500'
    case 'rare': return 'bg-blue-500'
    case 'epic': return 'bg-purple-500'
    case 'legendary': return 'bg-yellow-500'
    default: return 'bg-gray-500'
  }
}

export function AchievementBadges({ profile, className }: AchievementBadgesProps) {
  const { unlockedAchievements, lockedAchievements } = useMemo(() => {
    const unlocked: Achievement[] = []
    const locked: Achievement[] = []
    
    ACHIEVEMENTS.forEach(achievement => {
      let isUnlocked = false
      
      switch (achievement.requirement.type) {
        case 'entries_count':
          isUnlocked = profile.totalEntries >= achievement.requirement.value
          break
        case 'streak_days':
          isUnlocked = profile.longestStreak >= achievement.requirement.value
          break
        case 'consecutive_days':
          isUnlocked = profile.currentStreak >= achievement.requirement.value
          break
      }
      
      if (isUnlocked) {
        unlocked.push({
          ...achievement,
          unlockedAt: new Date().toISOString() // In real app, this would come from backend
        })
      } else {
        locked.push(achievement)
      }
    })
    
    // Sort by rarity and requirement value
    const rarityOrder = { 'common': 0, 'rare': 1, 'epic': 2, 'legendary': 3 }
    unlocked.sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity])
    locked.sort((a, b) => a.requirement.value - b.requirement.value)
    
    return { 
      unlockedAchievements: unlocked, 
      lockedAchievements: locked
    }
  }, [profile])

  const getProgress = (achievement: Achievement) => {
    let current = 0
    let target = achievement.requirement.value
    
    switch (achievement.requirement.type) {
      case 'entries_count':
        current = profile.totalEntries
        break
      case 'streak_days':
        current = profile.longestStreak
        break
      case 'consecutive_days':
        current = profile.currentStreak
        break
    }
    
    return Math.min((current / target) * 100, 100)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-50/50 to-blue-50/50 dark:from-purple-900/20 dark:via-indigo-900/10 dark:to-blue-900/10 border-0 shadow-lg dark:shadow-gray-900/50">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-blue-500/5 dark:from-purple-400/10 dark:via-indigo-400/10 dark:to-blue-400/10" />
        
        <CardHeader className="relative z-10">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">
                Achievement Badges
              </h3>
            </div>
            <div className="text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 text-purple-700 dark:text-purple-300 backdrop-blur-sm w-fit">
              <span className="font-mono">{unlockedAchievements.length}</span> / <span className="font-mono">{ACHIEVEMENTS.length}</span> <span>unlocked</span>
            </div>
          </div>
        </CardHeader>
        
  <CardContent className="relative z-10 bg-white/40 dark:bg-[#0b0f13]/40 backdrop-blur-sm">
          {/* Progress Overview */}
          <div className="mb-6 p-4 rounded-lg bg-white/60 dark:bg-[#0b0f13]/60 backdrop-blur-sm">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">
              <span>Overall Progress</span>
              <span>{Math.round((unlockedAchievements.length / ACHIEVEMENTS.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-[#1a1d20] rounded-full h-3 shadow-inner">
              <div 
                className="bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-500 h-3 rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${(unlockedAchievements.length / ACHIEVEMENTS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 shadow-md">
                  <Star className="h-3.5 w-3.5 text-white" />
                </div>
                Unlocked Achievements
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {unlockedAchievements.map((achievement) => {
                  const IconComponent = getIcon(achievement.icon)
                  return (
                    <div 
                      key={achievement.id}
                      className="p-3 sm:p-4 rounded-xl border backdrop-blur-sm hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-[#0b0f13]/80 dark:to-[#0b0f13]/80 border-gray-200/50 dark:border-gray-700/50"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className={`p-2 sm:p-2.5 rounded-lg ${getRarityIconBg(achievement.rarity)} shadow-md`}>
                          <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold ${getRarityBadgeColor(achievement.rarity)} text-white shadow-sm`}>
                          {achievement.rarity}
                        </div>
                      </div>
                      <h4 className="font-bold text-sm mb-2 text-gray-900 dark:text-white">{achievement.title}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{achievement.description}</p>
                      <div className="mt-3 text-xs text-green-600 dark:text-green-400 font-semibold bg-green-100/80 dark:bg-green-900/50 px-2 py-1 rounded-full backdrop-blur-sm">
                        ✓ Unlocked
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <div>
              <h4 className="text-sm font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-r from-gray-500 to-gray-600 shadow-md">
                  <Target className="h-3.5 w-3.5 text-white" />
                </div>
                Locked Achievements
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {lockedAchievements.map((achievement) => {
                  const IconComponent = getIcon(achievement.icon)
                  const progress = getProgress(achievement)
                  
                  return (
                    <div 
                      key={achievement.id}
                      className="p-4 rounded-xl border backdrop-blur-sm hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg bg-gradient-to-br from-gray-100/80 to-gray-200/60 dark:from-[#0b0f13]/60 dark:to-[#0b0f13]/80 border-gray-300/50 dark:border-gray-700/50 opacity-75 hover:opacity-90"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-lg bg-gray-400 dark:bg-[#1a1d20] shadow-md">
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-500 dark:bg-[#1a1d20] text-white shadow-sm">
                          {achievement.rarity}
                        </div>
                      </div>
                      <h4 className="font-bold text-sm mb-2 text-gray-700 dark:text-gray-300">{achievement.title}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">{achievement.description}</p>
                      
                      {/* Progress bar */}
                      <div className="space-y-2 p-3 rounded-lg bg-white/60 dark:bg-[#0b0f13]/60 backdrop-blur-sm">
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 font-medium">
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-300 dark:bg-[#1a1d20] rounded-full h-2 shadow-inner">
                          <div 
                            className="bg-gradient-to-r from-gray-400 to-gray-500 dark:from-gray-500 dark:to-gray-400 h-2 rounded-full transition-all duration-500 shadow-sm"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}