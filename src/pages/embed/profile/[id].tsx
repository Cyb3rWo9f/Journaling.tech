'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import Head from 'next/head'
import { 
  BookOpen, Flame, Trophy, Star, Crown, Target, Zap, Award, Calendar
} from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'

interface EmbedProfile {
  displayName: string
  avatar?: string
  bio?: string
  totalEntries: number
  currentStreak: number
  longestStreak: number
  joinedDate: string
  achievements: string[]
}

// Achievement definitions with proper names and descriptions
const ACHIEVEMENT_DATA: { [key: string]: { icon: string; name: string; description: string; rarity: string } } = {
  first_entry: { icon: 'BookOpen', name: 'First Steps', description: 'Write your first journal entry', rarity: 'common' },
  prolific_writer: { icon: 'Target', name: 'Prolific Writer', description: 'Write 10 journal entries', rarity: 'common' },
  seasoned_writer: { icon: 'Star', name: 'Seasoned Writer', description: 'Write 50 journal entries', rarity: 'rare' },
  master_writer: { icon: 'Crown', name: 'Master Writer', description: 'Write 100 journal entries', rarity: 'epic' },
  streak_starter: { icon: 'Flame', name: 'Streak Starter', description: 'Maintain a 3-day streak', rarity: 'common' },
  consistent_writer: { icon: 'Calendar', name: 'Consistent Writer', description: 'Maintain a 7-day streak', rarity: 'common' },
  streak_master: { icon: 'Zap', name: 'Streak Master', description: 'Maintain a 30-day streak', rarity: 'rare' },
  streak_legend: { icon: 'Trophy', name: 'Streak Legend', description: 'Maintain a 100-day streak', rarity: 'legendary' },
  week_one: { icon: 'Award', name: 'Week One', description: 'Complete your first week', rarity: 'common' },
  month_warrior: { icon: 'Star', name: 'Month Warrior', description: 'Journal for a full month', rarity: 'epic' },
}

export default function EmbedProfilePage() {
  const router = useRouter()
  const { id } = router.query
  const [profile, setProfile] = useState<EmbedProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)

        const profileId = id as string
        let userId: string | null = null
        
        // Check if it's a legacy format with 'profile-' prefix
        if (profileId.startsWith('profile-')) {
          userId = profileId.replace('profile-', '')
        } 
        // Check if it looks like a Firebase UID (alphanumeric, typically 28 chars)
        else if (/^[a-zA-Z0-9]{20,}$/.test(profileId)) {
          userId = profileId
        } 
        // Otherwise, treat it as a username
        else {
          // Look up username in usernames collection
          try {
            const usernameDoc = await getDoc(doc(db, 'usernames', profileId.toLowerCase()))
            if (usernameDoc.exists()) {
              userId = usernameDoc.data().userId
            }
          } catch (lookupErr) {
            console.log('Error looking up username:', lookupErr)
          }
        }

        if (!userId) {
          setError('Profile not found')
          setLoading(false)
          return
        }

        // Fetch profile directly from publicProfiles collection (public read access)
        const profileDoc = await getDoc(doc(db, 'publicProfiles', userId))
        
        if (!profileDoc.exists()) {
          setError('Profile not found')
          setLoading(false)
          return
        }

        const data = profileDoc.data()
        setProfile({
          displayName: data.displayName || 'Anonymous Writer',
          avatar: data.avatar,
          bio: data.bio,
          totalEntries: data.totalEntries || 0,
          currentStreak: data.currentStreak || 0,
          longestStreak: data.longestStreak || 0,
          joinedDate: data.joinedDate || new Date().toISOString(),
          achievements: data.achievements || [],
        })
      } catch (err: any) {
        // Log error internally but don't expose details to user
        console.error('Error fetching profile:', err)
        // Always show generic message to user - don't leak internal error details
        setError('Profile not found')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [id])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    })
  }

  const getAchievementIcon = (iconName: string, size: number = 16) => {
    const icons: { [key: string]: React.ReactNode } = {
      BookOpen: <BookOpen size={size} />,
      Target: <Target size={size} />,
      Star: <Star size={size} />,
      Crown: <Crown size={size} />,
      Flame: <Flame size={size} />,
      Calendar: <Calendar size={size} />,
      Zap: <Zap size={size} />,
      Trophy: <Trophy size={size} />,
      Award: <Award size={size} />,
    }
    return icons[iconName] || <Star size={size} />
  }

  const getIconBgColor = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen': return 'bg-blue-500/20 text-blue-400'
      case 'Target': return 'bg-purple-500/20 text-purple-400'
      case 'Flame': return 'bg-orange-500/20 text-orange-400'
      case 'Calendar': return 'bg-green-500/20 text-green-400'
      case 'Trophy': return 'bg-yellow-500/20 text-yellow-400'
      case 'Crown': return 'bg-amber-500/20 text-amber-400'
      case 'Star': return 'bg-pink-500/20 text-pink-400'
      case 'Zap': return 'bg-cyan-500/20 text-cyan-400'
      case 'Award': return 'bg-emerald-500/20 text-emerald-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-[#2a2f38] text-gray-300 border border-gray-700/50'
      case 'rare': return 'bg-blue-900/40 text-blue-300 border border-blue-700/50'
      case 'epic': return 'bg-purple-900/40 text-purple-300 border border-purple-700/50'
      case 'legendary': return 'bg-amber-900/40 text-amber-300 border border-amber-700/50'
      default: return 'bg-[#2a2f38] text-gray-300 border border-gray-700/50'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-3 border-[#6366f1] border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#161b22] flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-gray-400 text-lg">Profile not found</p>
        </div>
      </div>
    )
  }

  const unlockedAchievements = profile.achievements
    .filter(id => ACHIEVEMENT_DATA[id])
    .map(id => ({ id, ...ACHIEVEMENT_DATA[id] }))

  return (
    <>
      <Head>
        <title>{profile.displayName} - Journaling Profile</title>
        <meta name="description" content={profile.bio || `${profile.displayName}'s journaling profile`} />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-[#0d1117] font-['Space_Grotesk',sans-serif]">
        {/* Main Content - No Header */}
        <div className="max-w-3xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Profile Card - No Banner, Clean Design */}
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#21262d] bg-[#161b22]">
              {/* Profile Info Section */}
              <div className="p-5 sm:p-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                  {/* Avatar */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative flex-shrink-0"
                  >
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.displayName}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-dashed border-[#30363d] shadow-xl"
                      />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#6366f1] via-[#818cf8] to-[#4f46e5] flex items-center justify-center text-xl sm:text-2xl font-bold text-white border-2 border-dashed border-[#30363d] shadow-xl">
                        {getInitials(profile.displayName)}
                      </div>
                    )}
                  </motion.div>

                  {/* Name, Status, and Bio */}
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
                      <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        {profile.displayName}
                      </h1>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Active Writer
                      </span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-gray-400 text-sm">
                      <Calendar size={14} />
                      <span>Journaling since {formatJoinDate(profile.joinedDate)}</span>
                    </div>
                    
                    {/* Bio */}
                    {profile.bio && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4 text-gray-400 text-sm sm:text-base leading-relaxed"
                      >
                        {profile.bio}
                      </motion.p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards - Matching main website exactly */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6">
              {/* Total Entries */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[#161b22] rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-[#21262d] text-center"
              >
                <div className="w-8 h-8 sm:w-11 sm:h-11 mx-auto mb-2 sm:mb-3 rounded-lg sm:rounded-xl bg-blue-500/15 flex items-center justify-center border border-blue-500/20">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                </div>
                <div className="text-xl sm:text-3xl font-bold text-white mb-0.5 sm:mb-1">{profile.totalEntries}</div>
                <div className="text-[10px] sm:text-sm text-gray-500">Total Entries</div>
              </motion.div>

              {/* Current Streak */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-[#161b22] rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-[#21262d] text-center"
              >
                <div className="w-8 h-8 sm:w-11 sm:h-11 mx-auto mb-2 sm:mb-3 rounded-lg sm:rounded-xl bg-orange-500/15 flex items-center justify-center border border-orange-500/20">
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                </div>
                <div className="text-xl sm:text-3xl font-bold text-white mb-0.5 sm:mb-1">{profile.currentStreak}</div>
                <div className="text-[10px] sm:text-sm text-gray-500">Current Streak</div>
              </motion.div>

              {/* Best Streak */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-[#161b22] rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-[#21262d] text-center"
              >
                <div className="w-8 h-8 sm:w-11 sm:h-11 mx-auto mb-2 sm:mb-3 rounded-lg sm:rounded-xl bg-yellow-500/15 flex items-center justify-center border border-yellow-500/20">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                </div>
                <div className="text-xl sm:text-3xl font-bold text-white mb-0.5 sm:mb-1">{profile.longestStreak}</div>
                <div className="text-[10px] sm:text-sm text-gray-500">Best Streak</div>
              </motion.div>
            </div>

            {/* Achievements Section */}
            {unlockedAchievements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-5 sm:mt-8"
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-5">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-yellow-500/15 flex items-center justify-center border border-yellow-500/20">
                    <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-white">Achievements</h2>
                  <span className="text-xs sm:text-sm text-gray-500">({unlockedAchievements.length})</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {unlockedAchievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="bg-[#161b22] rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#21262d] flex items-center gap-3 sm:gap-4 hover:border-[#30363d] transition-colors"
                    >
                      <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${getIconBgColor(achievement.icon)}`}>
                        {getAchievementIcon(achievement.icon, 18)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-white text-sm truncate">{achievement.name}</span>
                          <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full ${getRarityBadge(achievement.rarity)} capitalize`}>
                            {achievement.rarity}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{achievement.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Powered by Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 sm:mt-12 text-center"
            >
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-400 transition-colors text-xs sm:text-sm"
              >
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#ff6b6b] to-[#ff8e8e] flex items-center justify-center shadow-lg shadow-[#ff6b6b]/20">
                  <BookOpen className="w-3 h-3 text-white" />
                </div>
                <span>Powered by Journaling</span>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

// Remove default layout for embed page
EmbedProfilePage.getLayout = (page: React.ReactElement) => page
