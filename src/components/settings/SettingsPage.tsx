'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { ProfileCard } from './ProfileCard'
import { StreakCard } from './StreakCard'
import { AchievementBadges } from './AchievementBadges'
import { DeleteAccountSection } from './DeleteAccountSection'
import { UserProfile, StreakData, Achievement } from '@/types'
import { useJournal } from '@/context/JournalContext'
import { useAuth } from '@/context/AuthContext'
import { firebaseJournalService } from '@/services/firebase'
import { Settings, User, Trophy, Flame, BarChart3 } from 'lucide-react'

// Import achievements from AchievementBadges
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

// Function to calculate earned achievements
const calculateEarnedAchievements = (totalEntries: number, longestStreak: number, currentStreak: number): string[] => {
  const earnedIds: string[] = []
  
  ACHIEVEMENTS.forEach(achievement => {
    let isUnlocked = false
    
    switch (achievement.requirement.type) {
      case 'entries_count':
        isUnlocked = totalEntries >= achievement.requirement.value
        break
      case 'streak_days':
        isUnlocked = longestStreak >= achievement.requirement.value
        break
      case 'consecutive_days':
        isUnlocked = currentStreak >= achievement.requirement.value
        break
    }
    
    if (isUnlocked) {
      earnedIds.push(achievement.id)
    }
  })
  
  return earnedIds
}

export function SettingsPage() {
  const { user } = useAuth()
  const { entries } = useJournal()
  const [isLoading, setIsLoading] = useState(true)
  const [lastAchievementCount, setLastAchievementCount] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  // Create profile data with calculated achievements
  const profile: UserProfile = useMemo(() => {
    if (!user || !entries) {
      return {
        id: 'mock-profile',
        userId: user?.uid || 'mock-user',
        displayName: user?.displayName || 'Journal Writer',
        avatar: user?.photoURL || undefined,
        bio: '',
        location: '',
        currentStreak: 0,
        longestStreak: 0,
        totalEntries: 0,
        joinedDate: new Date().toISOString(),
        achievements: [],
        updatedAt: new Date().toISOString()
      }
    }

    // Calculate streaks
    const streakData = calculateStreaks(entries)
    
    // Calculate earned achievements
    const earnedAchievements = calculateEarnedAchievements(
      entries.length,
      streakData.longestStreak,
      streakData.currentStreak
    )
    
    return {
      id: `profile-${user.uid}`,
      userId: user.uid,
      displayName: user.displayName || user.email?.split('@')[0] || 'Journal Writer',
      avatar: user.photoURL || undefined,
      bio: 'Passionate journal writer on a journey of self-discovery.',
      location: '',
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      totalEntries: entries.length,
      joinedDate: user.metadata?.creationTime || new Date().toISOString(),
      lastEntryDate: streakData.lastEntryDate,
      achievements: earnedAchievements, // Now calculated dynamically
      updatedAt: new Date().toISOString()
    }
  }, [user, entries])

  const streakData: StreakData = useMemo(() => {
    return calculateStreaks(entries)
  }, [entries])

  useEffect(() => {
    // Initialize Firebase service with user ID
    if (user?.uid) {
      firebaseJournalService.setUserId(user.uid)
      
      // Load existing profile to get current achievement count
      const loadProfile = async () => {
        try {
          const existingProfile = await firebaseJournalService.getProfile()
          if (existingProfile) {
            setLastAchievementCount(existingProfile.achievements.length)
          }
        } catch (error) {
          console.error('Error loading profile:', error)
        }
      }
      loadProfile()
    }
    
    // Auto-save achievements when they change
    if (profile.achievements.length > lastAchievementCount && user?.uid && lastAchievementCount > 0) {
      const saveAchievements = async () => {
        try {
          await firebaseJournalService.createOrUpdateProfile({
            achievements: profile.achievements,
            totalEntries: profile.totalEntries,
            currentStreak: profile.currentStreak,
            longestStreak: profile.longestStreak,
          })
          console.log(`🎉 New achievement unlocked! Total: ${profile.achievements.length}`)
        } catch (error) {
          console.error('Error saving achievements:', error)
        }
      }
      
      saveAchievements()
      setLastAchievementCount(profile.achievements.length)
    }
    
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [user, profile.achievements.length, lastAchievementCount, profile.totalEntries, profile.currentStreak, profile.longestStreak])

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      // Update Firebase Auth profile if displayName changed
      if (updates.displayName && updates.displayName !== user.displayName) {
        await firebaseJournalService.updateAuthProfile(
          { displayName: updates.displayName },
          user
        )
      }
      
      // Update user profile in Firestore
      await firebaseJournalService.createOrUpdateProfile({
        ...updates,
        userId: user.uid,
        updatedAt: new Date().toISOString(),
      })
      
      // Force re-render by updating the user context if needed
      // In a real app, you might want to refetch user data or trigger a context update
      console.log('Profile updated successfully!')
      
      // You might want to show a success toast here
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  const handleDeleteAccount = async () => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      console.log('Starting account deletion process...')
      setIsDeleting(true)
      
      // Delete all user data and account
      await firebaseJournalService.deleteUserAccount(user)
      
      // The user will be automatically signed out when the auth account is deleted
      // and redirected to login page by the auth context
      console.log('Account successfully deleted')
      
    } catch (error) {
      console.error('Error deleting account:', error)
      setIsDeleting(false)
      
      // Show user-friendly error message
      alert(`Failed to delete account: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6 min-h-screen bg-[var(--background)] dark:bg-[#0b0f13]">
        {/* Loading skeletons */}
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-gray-200 dark:bg-[#0b0f13] rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-48 bg-gray-200 dark:bg-[#0b0f13] rounded-lg"></div>
            <div className="h-48 bg-gray-200 dark:bg-[#0b0f13] rounded-lg"></div>
          </div>
          <div className="h-96 bg-gray-200 dark:bg-[#0b0f13] rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-6 pb-28 sm:pb-16 space-y-4 sm:space-y-6 min-h-screen bg-[var(--background)] dark:bg-[#0b0f13]">
      {/* Profile Section */}
      <section>
        <div className="flex items-center gap-2 mb-2 sm:mb-4">
          <User className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--text-secondary)]" />
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-[var(--text-primary)]">Profile</h2>
        </div>
        <ProfileCard 
          profile={profile}
          onUpdateProfile={handleUpdateProfile}
          isLoading={isLoading}
        />
      </section>

      {/* Streaks Section */}
      <section>
        <div className="flex items-center gap-2 mb-2 sm:mb-4">
          <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-[var(--text-primary)]">Writing Streaks</h2>
        </div>
        <StreakCard streakData={streakData} />
      </section>

      {/* Achievements Section */}
      <section>
        <div className="flex items-center gap-2 mb-2 sm:mb-4">
          <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-[var(--text-primary)]">Achievements</h2>
        </div>
        <AchievementBadges profile={profile} />
      </section>

      {/* Stats Summary */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-400/10 dark:to-purple-400/10" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-md sm:shadow-lg">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-white" />
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-[var(--text-primary)]">Your Journaling Journey</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <div className="text-center p-2 sm:p-4 rounded-lg bg-white/60 dark:bg-[#0b0f13]/60 backdrop-blur-sm">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">{profile.totalEntries}</div>
              <div className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">Total Entries</div>
            </div>
            <div className="text-center p-2 sm:p-4 rounded-lg bg-white/60 dark:bg-[#0b0f13]/60 backdrop-blur-sm">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">{profile.currentStreak}</div>
              <div className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">Current Streak</div>
            </div>
            <div className="text-center p-2 sm:p-4 rounded-lg bg-white/60 dark:bg-[#0b0f13]/60 backdrop-blur-sm">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">{profile.longestStreak}</div>
              <div className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">Best Streak</div>
            </div>
            <div className="text-center p-2 sm:p-4 rounded-lg bg-white/60 dark:bg-[#0b0f13]/60 backdrop-blur-sm">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">{profile.achievements.length}</div>
              <div className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">Achievements</div>
            </div>
          </div>
        </div>
      </section>

      {/* Delete Account Section */}
      <section className="mt-8 sm:mt-10">
        <DeleteAccountSection 
          onDeleteAccount={handleDeleteAccount}
          isDeleting={isDeleting}
        />
      </section>
    </div>
  )
}

// Helper function to calculate streaks from journal entries
function calculateStreaks(entries: any[]): StreakData {
  if (!entries || entries.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastEntryDate: undefined,
      streakStartDate: undefined
    }
  }

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const lastEntryDate = sortedEntries[0]?.createdAt
  
  // Get user's timezone for consistent date calculations
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  
  // Helper function to get date in user's timezone as YYYY-MM-DD
  const getLocalDateString = (date: Date): string => {
    return date.toLocaleDateString('en-CA', { // en-CA gives YYYY-MM-DD format
      timeZone: userTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }
  
  // Group entries by date in user's timezone
  const entriesByDate = new Map<string, any[]>()
  entries.forEach(entry => {
    const entryDate = new Date(entry.createdAt)
    const dateKey = getLocalDateString(entryDate)
    if (!entriesByDate.has(dateKey)) {
      entriesByDate.set(dateKey, [])
    }
    entriesByDate.get(dateKey)?.push(entry)
  })

  // Get unique dates and sort them
  const uniqueDateStrings = Array.from(entriesByDate.keys()).sort((a, b) => b.localeCompare(a))

  if (uniqueDateStrings.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastEntryDate,
      streakStartDate: undefined
    }
  }

  // Calculate current streak
  let currentStreak = 0
  let streakStartDate: string | undefined
  
  // Get today in user's timezone
  const now = new Date()
  const today = getLocalDateString(now)
  
  // Check if the most recent entry is today (strict streak requirement)
  const mostRecentDateString = uniqueDateStrings[0]
  
  // Current streak only continues if the most recent entry is TODAY
  // If you miss even one day, current streak becomes 0
  if (mostRecentDateString === today) {
    // Start counting consecutive days from today backwards
    for (let i = 0; i < uniqueDateStrings.length; i++) {
      const currentDateString = uniqueDateStrings[i]
      
      // Calculate expected date string (today minus i days)
      const expectedDate = new Date(now)
      expectedDate.setDate(expectedDate.getDate() - i)
      const expectedDateString = getLocalDateString(expectedDate)
      
      if (currentDateString === expectedDateString) {
        currentStreak++
        // Convert back to ISO string for consistency
        const streakDate = new Date(currentDateString + 'T12:00:00')
        streakStartDate = streakDate.toISOString()
      } else {
        break // Break on first missing day
      }
    }
  } else {
    // No entry today = current streak is 0
    currentStreak = 0
  }

  // Calculate longest streak
  let longestStreak = 0
  let tempStreak = 1
  
  for (let i = 1; i < uniqueDateStrings.length; i++) {
    const currentDateString = uniqueDateStrings[i]
    const previousDateString = uniqueDateStrings[i - 1]
    
    // Parse dates from YYYY-MM-DD strings
    const currentDate = new Date(currentDateString + 'T12:00:00')
    const previousDate = new Date(previousDateString + 'T12:00:00')
    
    // Check if dates are consecutive (1 day apart)
    const diffTime = previousDate.getTime() - currentDate.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      tempStreak++
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak)

  return {
    currentStreak,
    longestStreak,
    lastEntryDate,
    streakStartDate
  }
}