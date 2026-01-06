'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, Flame, Trophy, Star, Crown, Target, Zap, Award, Calendar,
  ExternalLink, PenTool, Sparkles, Heart, ArrowLeft, ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'

interface PublicProfile {
  displayName: string
  avatar?: string
  bio?: string
  totalEntries: number
  currentStreak: number
  longestStreak: number
  joinedDate: string
  achievements: string[]
  mood?: string
}

// Achievement definitions
const ACHIEVEMENTS_DATA: { [key: string]: { title: string; icon: string; rarity: string; description: string } } = {
  first_entry: { title: 'First Steps', icon: 'BookOpen', rarity: 'common', description: 'Write your first journal entry' },
  prolific_writer: { title: 'Prolific Writer', icon: 'Target', rarity: 'common', description: 'Write 10 journal entries' },
  seasoned_writer: { title: 'Seasoned Writer', icon: 'Star', rarity: 'rare', description: 'Write 50 journal entries' },
  master_writer: { title: 'Master Writer', icon: 'Crown', rarity: 'epic', description: 'Write 100 journal entries' },
  streak_starter: { title: 'Streak Starter', icon: 'Flame', rarity: 'common', description: 'Maintain a 3-day streak' },
  consistent_writer: { title: 'Consistent Writer', icon: 'Calendar', rarity: 'common', description: 'Maintain a 7-day streak' },
  streak_master: { title: 'Streak Master', icon: 'Zap', rarity: 'rare', description: 'Maintain a 30-day streak' },
  streak_legend: { title: 'Streak Legend', icon: 'Trophy', rarity: 'legendary', description: 'Maintain a 100-day streak' },
  week_one: { title: 'Week One Complete', icon: 'Award', rarity: 'common', description: 'Complete your first week' },
  month_warrior: { title: 'Month Warrior', icon: 'Star', rarity: 'epic', description: 'Journal for an entire month' },
}

export default function PublicProfilePage() {
  const router = useRouter()
  const { id } = router.query
  const [profile, setProfile] = useState<PublicProfile | null>(null)
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
              console.log('Found username mapping:', profileId, '->', userId)
            } else {
              console.log('Username not found in usernames collection:', profileId)
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

        console.log('Fetching public profile for userId:', userId)
        
        // Fetch profile directly from publicProfiles collection (public read access)
        const profileDoc = await getDoc(doc(db, 'publicProfiles', userId))
        
        if (!profileDoc.exists()) {
          console.log('Public profile document does not exist for userId:', userId)
          setError('Profile not found')
          setLoading(false)
          return
        }

        const data = profileDoc.data()
        console.log('Public profile data:', data)
        
        setProfile({
          displayName: data.displayName || 'Anonymous Writer',
          avatar: data.avatar,
          bio: data.bio,
          totalEntries: data.totalEntries || 0,
          currentStreak: data.currentStreak || 0,
          longestStreak: data.longestStreak || 0,
          joinedDate: data.joinedDate || new Date().toISOString(),
          achievements: data.achievements || [],
          mood: data.mood,
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

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-500'
      case 'rare': return 'from-blue-400 to-blue-600'
      case 'epic': return 'from-purple-400 to-purple-600'
      case 'legendary': return 'from-amber-400 to-orange-500'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 dark:border-gray-600'
      case 'rare': return 'border-blue-300 dark:border-blue-600'
      case 'epic': return 'border-purple-300 dark:border-purple-600'
      case 'legendary': return 'border-amber-300 dark:border-amber-600'
      default: return 'border-gray-300 dark:border-gray-600'
    }
  }

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-50 dark:bg-gray-800/50'
      case 'rare': return 'bg-blue-50 dark:bg-blue-900/20'
      case 'epic': return 'bg-purple-50 dark:bg-purple-900/20'
      case 'legendary': return 'bg-amber-50 dark:bg-amber-900/20'
      default: return 'bg-gray-50 dark:bg-gray-800/50'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0b0f13] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-500 dark:text-gray-400 font-['Space_Grotesk']">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0b0f13] flex flex-col items-center justify-center gap-4">
        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
          <BookOpen className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-['Space_Grotesk']">Profile not found</h1>
        <p className="text-gray-500 dark:text-gray-400">This profile doesn't exist or has been made private.</p>
        <Link 
          href="/" 
          className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300"
        >
          <ArrowLeft size={18} />
          Go to Homepage
        </Link>
      </div>
    )
  }

  const unlockedAchievements = profile.achievements
    .filter(id => ACHIEVEMENTS_DATA[id])
    .map(id => ({ id, ...ACHIEVEMENTS_DATA[id] }))

  return (
    <>
      <Head>
        <title>{profile.displayName} - Journaling Profile</title>
        <meta name="description" content={`Check out ${profile.displayName}'s journaling journey - ${profile.totalEntries} entries, ${profile.longestStreak} day best streak!`} />
        <meta property="og:title" content={`${profile.displayName} - Journaling Profile`} />
        <meta property="og:description" content={`${profile.totalEntries} entries • ${profile.currentStreak} day streak • ${unlockedAchievements.length} achievements`} />
      </Head>

      <div className="min-h-screen bg-white dark:bg-[#0b0f13] text-gray-900 dark:text-gray-100">
        {/* Gradient Background Effects - Enhanced */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 via-transparent to-purple-500/5 dark:from-[var(--primary)]/3 dark:via-transparent dark:to-purple-500/3" />
          <div className="absolute top-0 right-0 w-[300px] sm:w-[400px] lg:w-[600px] h-[300px] sm:h-[400px] lg:h-[600px] bg-gradient-to-bl from-[var(--primary)]/15 to-transparent dark:from-[var(--primary)]/8 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-0 left-0 w-[300px] sm:w-[400px] lg:w-[600px] h-[300px] sm:h-[400px] lg:h-[600px] bg-gradient-to-tr from-purple-500/15 to-transparent dark:from-purple-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] sm:w-[300px] lg:w-[400px] h-[200px] sm:h-[300px] lg:h-[400px] bg-gradient-radial from-blue-500/10 to-transparent dark:from-blue-500/5 rounded-full blur-3xl" />
        </div>

        {/* Back to Home Button - Floating on Desktop */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="fixed top-4 left-4 z-50 hidden lg:block"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg transition-all duration-300 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back
          </Link>
        </motion.div>

        {/* Profile Content */}
        <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Profile Card - Enhanced Design */}
            <div className="bg-white/70 dark:bg-gray-800/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-200/60 dark:border-gray-700/40 overflow-hidden shadow-2xl shadow-gray-200/40 dark:shadow-black/20">
              {/* Decorative Top Bar */}
              <div className="h-1.5 sm:h-2 bg-gradient-to-r from-[var(--primary)] via-purple-500 to-blue-500" />
              
              {/* Profile Info */}
              <div className="px-5 sm:px-8 lg:px-10 py-6 sm:py-8 lg:py-10">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8 mb-8 sm:mb-10">
                  {/* Avatar - Enhanced */}
                  {profile.avatar ? (
                    <motion.img
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                      src={profile.avatar}
                      alt={profile.displayName}
                      className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl sm:rounded-3xl object-cover ring-4 ring-white dark:ring-gray-700 shadow-2xl mx-auto sm:mx-0"
                    />
                  ) : (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                      className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[var(--primary)] via-[var(--primary-dark)] to-purple-600 flex items-center justify-center text-3xl sm:text-4xl lg:text-5xl font-bold text-white shadow-2xl shadow-[var(--primary)]/30 ring-4 ring-white dark:ring-gray-700 mx-auto sm:mx-0 flex-shrink-0"
                    >
                      {getInitials(profile.displayName)}
                    </motion.div>
                  )}
                  
                  <div className="text-center sm:text-left flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <motion.h1 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white font-['Space_Grotesk'] tracking-tight"
                      >
                        {profile.displayName}
                      </motion.h1>
                      <motion.span 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-medium rounded-full mx-auto sm:mx-0 border border-emerald-200 dark:border-emerald-500/30"
                      >
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        Active Writer
                      </motion.span>
                    </div>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-gray-500 dark:text-gray-400 text-sm sm:text-base flex items-center justify-center sm:justify-start gap-2"
                    >
                      <Calendar size={16} className="text-[var(--primary)]" />
                      Journaling since {formatJoinDate(profile.joinedDate)}
                    </motion.p>
                  </div>
                </div>

                {/* Stats Grid - Enhanced for All Screens */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="group bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-500/10 dark:to-blue-600/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 text-center border border-blue-200/60 dark:border-blue-500/20 hover:border-blue-300 dark:hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 cursor-default"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg shadow-blue-500/30 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all">
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                    </div>
                    <div className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white font-['Space_Grotesk'] tracking-tight">
                      {profile.totalEntries}
                    </div>
                    <div className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 font-medium">
                      Entries
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="group bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-500/10 dark:to-orange-600/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 text-center border border-orange-200/60 dark:border-orange-500/20 hover:border-orange-300 dark:hover:border-orange-500/40 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 cursor-default"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg shadow-orange-500/30 group-hover:shadow-xl group-hover:shadow-orange-500/40 transition-all">
                      <Flame className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                    </div>
                    <div className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white font-['Space_Grotesk'] tracking-tight">
                      {profile.currentStreak}
                    </div>
                    <div className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 font-medium">
                      Streak 🔥
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="group bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-500/10 dark:to-amber-600/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 text-center border border-amber-200/60 dark:border-amber-500/20 hover:border-amber-300 dark:hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 cursor-default"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg shadow-amber-500/30 group-hover:shadow-xl group-hover:shadow-amber-500/40 transition-all">
                      <Trophy className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                    </div>
                    <div className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white font-['Space_Grotesk'] tracking-tight">
                      {profile.longestStreak}
                    </div>
                    <div className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 font-medium">
                      Best 🏆
                    </div>
                  </motion.div>
                </div>

                {/* Achievements Section - Enhanced */}
                {unlockedAchievements.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 sm:mt-10"
                  >
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 font-['Space_Grotesk']">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        Achievements
                        <span className="text-sm sm:text-base font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                          {unlockedAchievements.length}
                        </span>
                      </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {unlockedAchievements.map((achievement, index) => (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + index * 0.05 }}
                          whileHover={{ scale: 1.01, x: 4 }}
                          className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 ${getRarityBorder(achievement.rarity)} ${getRarityBg(achievement.rarity)} hover:shadow-lg transition-all duration-200 cursor-default group`}
                        >
                          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${getRarityColor(achievement.rarity)} flex items-center justify-center text-white shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform`}>
                            {getAchievementIcon(achievement.icon, 20)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-gray-900 dark:text-white font-bold text-sm sm:text-base font-['Space_Grotesk'] truncate">
                              {achievement.title}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-0.5 line-clamp-1">
                              {achievement.description}
                            </p>
                          </div>
                          <div className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold capitalize flex-shrink-0 ${
                            achievement.rarity === 'legendary' ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30' :
                            achievement.rarity === 'epic' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30' :
                            achievement.rarity === 'rare' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' :
                            'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                          }`}>
                            {achievement.rarity}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-8 sm:mt-10 lg:mt-14"
            >
              <div className="relative overflow-hidden bg-gradient-to-br from-[var(--primary)] via-purple-600 to-blue-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 text-center shadow-2xl shadow-[var(--primary)]/20">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-40 h-40 sm:w-56 sm:h-56 bg-blue-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                
                <div className="relative z-10">
                  <motion.div 
                    className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl border border-white/20"
                    whileHover={{ rotate: 5, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <PenTool className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
                  </motion.div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3 font-['Space_Grotesk']">
                    Start Your Journaling Journey
                  </h3>
                  <p className="text-white/80 mb-6 sm:mb-8 max-w-lg mx-auto text-sm sm:text-base lg:text-lg">
                    Join thousands of writers documenting their thoughts, tracking moods, and unlocking achievements.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                    <Link 
                      href="/"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3 sm:py-4 bg-white text-[var(--primary)] font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
                    >
                      <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      Get Started Free
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                    <Link 
                      href="/landing"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm text-white font-semibold text-sm sm:text-base rounded-xl sm:rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </main>

        {/* Footer - Enhanced */}
        <footer className="relative z-10 border-t border-gray-200/50 dark:border-gray-800/50 py-6 sm:py-8 lg:py-10 mt-8 sm:mt-10 lg:mt-14 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
                <PenTool size={18} className="text-white sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-900 dark:text-white font-bold text-sm sm:text-base font-['Space_Grotesk']">Journaling</span>
                <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Your digital sanctuary</span>
              </div>
            </motion.div>
            <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              <span>Made with</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Heart size={16} className="text-red-500 fill-red-500 sm:w-5 sm:h-5" />
              </motion.div>
              <span>for writers everywhere</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

// Custom layout without app navigation
PublicProfilePage.getLayout = (page: React.ReactElement) => page
