'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { FlippableProfileCard } from './FlippableProfileCard'
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
        // Use longest streak for streak achievements (ever achieved)
        isUnlocked = longestStreak >= achievement.requirement.value
        break
      case 'consecutive_days':
        // Use longest streak for milestone achievements too (Week One, Month Warrior, etc.)
        // These are "have you ever" achievements, not "currently" achievements
        isUnlocked = longestStreak >= achievement.requirement.value
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
  const [lastSavedStreak, setLastSavedStreak] = useState<{ current: number; longest: number } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [savedProfileData, setSavedProfileData] = useState<Partial<UserProfile> | null>(null)

  // Create profile data with calculated achievements and merge with saved data
  const profile: UserProfile = useMemo(() => {
    if (!user || !entries) {
      return {
        id: 'mock-profile',
        userId: user?.uid || 'mock-user',
        displayName: user?.displayName || 'Journal Writer',
        avatar: user?.photoURL || undefined,
        bio: '',
        location: '',
        language: 'en',
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
    
    // Merge with saved profile data (which includes username, bio, etc.)
    return {
      id: `profile-${user.uid}`,
      userId: user.uid,
      username: savedProfileData?.username, // Include saved username
      displayName: savedProfileData?.displayName || user.displayName || user.email?.split('@')[0] || 'Journal Writer',
      avatar: user.photoURL || savedProfileData?.avatar || undefined,
      bio: savedProfileData?.bio || 'Passionate journal writer on a journey of self-discovery.',
      location: savedProfileData?.location || '',
      language: savedProfileData?.language || 'en',
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      totalEntries: entries.length,
      joinedDate: user.metadata?.creationTime || new Date().toISOString(),
      lastEntryDate: streakData.lastEntryDate,
      achievements: earnedAchievements,
      updatedAt: new Date().toISOString()
    }
  }, [user, entries, savedProfileData])

  const streakData: StreakData = useMemo(() => {
    return calculateStreaks(entries)
  }, [entries])

  useEffect(() => {
    // Initialize Firebase service with user ID
    if (user?.uid) {
      firebaseJournalService.setUserId(user.uid)
      
      // Load existing profile to get current achievement count, streak data, and saved profile info
      const loadProfile = async () => {
        try {
          const existingProfile = await firebaseJournalService.getProfile()
          if (existingProfile) {
            // Save the full profile data to state (includes username, bio, etc.)
            setSavedProfileData(existingProfile)
            setLastAchievementCount(existingProfile.achievements?.length || 0)
            setLastSavedStreak({
              current: existingProfile.currentStreak || 0,
              longest: existingProfile.longestStreak || 0
            })
            console.log('📊 Loaded saved profile with username:', existingProfile.username)
          }
          
          // Always sync basic profile to publicProfiles on settings page load
          // This ensures the public profile has the latest data from Google Auth
          await firebaseJournalService.createOrUpdateProfile({
            displayName: existingProfile?.displayName || user.displayName || user.email?.split('@')[0] || 'Journal Writer',
            avatar: user.photoURL || undefined,
            joinedDate: user.metadata?.creationTime || new Date().toISOString(),
          })
          
          // Also sync entry count to public profile
          await firebaseJournalService.syncEntryCountToPublicProfile()
          
          console.log('✅ Profile synced to publicProfiles')
        } catch (error) {
          console.error('Error loading/syncing profile:', error)
        }
      }
      loadProfile()
    }
    
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [user])

  // Auto-save profile data when streaks or achievements change
  useEffect(() => {
    if (!user?.uid || !entries || entries.length === 0) return
    
    const hasNewAchievements = profile.achievements.length > lastAchievementCount && lastAchievementCount >= 0
    const hasStreakChange = lastSavedStreak && (
      profile.currentStreak !== lastSavedStreak.current ||
      profile.longestStreak !== lastSavedStreak.longest
    )
    const isInitialSave = lastSavedStreak === null && profile.totalEntries > 0
    
    // Always ensure public profile exists with basic info
    const shouldSaveProfile = hasNewAchievements || hasStreakChange || isInitialSave
    
    if (shouldSaveProfile || (user && !lastSavedStreak)) {
      const saveProfileData = async () => {
        try {
          await firebaseJournalService.createOrUpdateProfile({
            displayName: profile.displayName,
            avatar: profile.avatar,
            bio: profile.bio,
            achievements: profile.achievements,
            totalEntries: profile.totalEntries,
            currentStreak: profile.currentStreak,
            longestStreak: profile.longestStreak,
            lastEntryDate: profile.lastEntryDate,
            joinedDate: profile.joinedDate,
          })
          
          if (hasNewAchievements) {
            console.log(`🎉 New achievement unlocked! Total: ${profile.achievements.length}`)
          }
          if (hasStreakChange) {
            console.log(`🔥 Streak updated - Current: ${profile.currentStreak}, Longest: ${profile.longestStreak}`)
          }
          if (isInitialSave) {
            console.log(`📊 Initial profile data saved to Firebase`)
          }
          
          setLastAchievementCount(profile.achievements.length)
          setLastSavedStreak({
            current: profile.currentStreak,
            longest: profile.longestStreak
          })
        } catch (error) {
          console.error('Error saving profile data:', error)
        }
      }
      
      saveProfileData()
    }
  }, [user, entries, profile.achievements.length, profile.currentStreak, profile.longestStreak, profile.totalEntries, profile.lastEntryDate, lastAchievementCount, lastSavedStreak])

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
      
      // Update local saved profile data state to reflect changes immediately
      setSavedProfileData(prev => ({
        ...prev,
        ...updates,
      }))
      
      console.log('✅ Profile updated successfully!')
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
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 min-h-screen">
        {/* Loading skeletons */}
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-[var(--background)] rounded-xl border border-[var(--border)]"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-36 bg-[var(--background)] rounded-xl border border-[var(--border)]"></div>
            <div className="h-36 bg-[var(--background)] rounded-xl border border-[var(--border)]"></div>
          </div>
          <div className="h-64 bg-[var(--background)] rounded-xl border border-[var(--border)]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-0 md:pb-12 space-y-6 min-h-screen">
      {/* Profile Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-[var(--primary)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Profile</h2>
        </div>
        <FlippableProfileCard 
          profile={profile}
          onUpdateProfile={handleUpdateProfile}
          isLoading={isLoading}
          achievements={ACHIEVEMENTS}
          unlockedAchievementIds={profile.achievements}
          longestStreak={profile.longestStreak}
        />
      </section>

      {/* Streaks Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Flame className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Streaks</h2>
        </div>
        <StreakCard streakData={streakData} />
      </section>

      {/* Achievements Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Achievements</h2>
        </div>
        <AchievementBadges profile={profile} />
      </section>

      {/* Stats Summary */}
      <section className="bg-[var(--background)] rounded-xl p-4 sm:p-6 border border-[var(--border)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-[var(--primary)]/10">
            <BarChart3 className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Your Journey</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center p-4 rounded-xl bg-[var(--background)] border border-[var(--border)]">
            <div className="text-2xl font-bold text-[var(--primary)]">{profile.totalEntries}</div>
            <div className="text-sm text-[var(--text-secondary)]">Total Entries</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-[var(--background)] border border-[var(--border)]">
            <div className="text-2xl font-bold text-orange-500">{profile.currentStreak}</div>
            <div className="text-sm text-[var(--text-secondary)]">Current Streak</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-[var(--background)] border border-[var(--border)]">
            <div className="text-2xl font-bold text-yellow-500">{profile.longestStreak}</div>
            <div className="text-sm text-[var(--text-secondary)]">Best Streak</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-[var(--background)] border border-[var(--border)]">
            <div className="text-2xl font-bold text-[var(--secondary)]">{profile.achievements.length}</div>
            <div className="text-sm text-[var(--text-secondary)]">Achievements</div>
          </div>
        </div>
      </section>

      {/* Delete Account Section */}
      <section className="mt-8">
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
  
  // Get today and yesterday in user's timezone
  const now = new Date()
  const today = getLocalDateString(now)
  const yesterdayDate = new Date(now)
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = getLocalDateString(yesterdayDate)
  
  // Check if the most recent entry is today or yesterday
  const mostRecentDateString = uniqueDateStrings[0]
  
  // Current streak continues if the most recent entry is TODAY or YESTERDAY
  // This gives users until end of day to write without losing their streak
  if (mostRecentDateString === today || mostRecentDateString === yesterday) {
    // Determine starting point for counting
    let startIndex = 0
    let dayOffset = 0
    
    if (mostRecentDateString === today) {
      // Entry exists today, start counting from today
      dayOffset = 0
    } else {
      // Most recent is yesterday, start counting from yesterday
      dayOffset = 1
    }
    
    // Start counting consecutive days
    for (let i = 0; i < uniqueDateStrings.length; i++) {
      const currentDateString = uniqueDateStrings[i]
      
      // Calculate expected date string (starting point minus i days)
      const expectedDate = new Date(now)
      expectedDate.setDate(expectedDate.getDate() - dayOffset - i)
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
    // No entry today or yesterday = current streak is 0
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