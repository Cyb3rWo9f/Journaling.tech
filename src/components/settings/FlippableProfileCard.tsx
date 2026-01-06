'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserProfile, Achievement } from '@/types'
import { 
  Edit2, Save, X, MapPin, Calendar, Share2, Code, Copy, Check, 
  Flame, Trophy, BookOpen, Star, Award, Zap, Crown, Target,
  ExternalLink, ChevronDown, AtSign, AlertCircle, CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { firebaseJournalService } from '@/services/firebase'

interface FlippableProfileCardProps {
  profile: UserProfile
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>
  isLoading?: boolean
  achievements: Achievement[]
  unlockedAchievementIds: string[]
  longestStreak: number
}

export function FlippableProfileCard({ 
  profile, 
  onUpdateProfile, 
  isLoading,
  achievements,
  unlockedAchievementIds,
  longestStreak
}: FlippableProfileCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    displayName: profile.displayName,
    bio: profile.bio || '',
    location: profile.location || '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  
  // Username state
  const [username, setUsername] = useState(profile.username || '')
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'error'>('idle')
  const [usernameError, setUsernameError] = useState('')
  const [isSavingUsername, setIsSavingUsername] = useState(false)

  useEffect(() => {
    if (profile.username) {
      setUsername(profile.username)
    }
  }, [profile.username])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await onUpdateProfile({
        ...formData,
        updatedAt: new Date().toISOString(),
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      displayName: profile.displayName,
      bio: profile.bio || '',
      location: profile.location || '',
    })
    setIsEditing(false)
  }

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

  // Generate embed code
  const embedCode = `<iframe 
  src="${typeof window !== 'undefined' ? window.location.origin : ''}/embed/profile/${profile.id}" 
  width="320" 
  height="400" 
  frameborder="0" 
  style="border-radius: 16px; overflow: hidden;"
></iframe>`

  // Generate shareable link - use username if available, otherwise use profile ID
  const shareableLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/u/${username || profile.id}`

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Username validation and checking
  const validateUsername = (input: string): { valid: boolean; error?: string } => {
    const trimmed = input.toLowerCase().trim()
    
    if (trimmed.length < 3) {
      return { valid: false, error: 'Username must be at least 3 characters' }
    }
    if (trimmed.length > 20) {
      return { valid: false, error: 'Username must be 20 characters or less' }
    }
    if (!/^[a-z0-9_]+$/.test(trimmed)) {
      return { valid: false, error: 'Only letters, numbers, and underscores allowed' }
    }
    return { valid: true }
  }

  const checkUsernameAvailability = async (input: string) => {
    const validation = validateUsername(input)
    if (!validation.valid) {
      setUsernameStatus('invalid')
      setUsernameError(validation.error || 'Invalid username')
      return
    }
    
    // If it's the same as current username (case-insensitive), it's "available"
    if (input.toLowerCase().trim() === username?.toLowerCase()) {
      setUsernameStatus('available')
      return
    }
    
    setUsernameStatus('checking')
    try {
      const isAvailable = await firebaseJournalService.isUsernameAvailable(input)
      if (isAvailable) {
        setUsernameStatus('available')
        setUsernameError('')
      } else {
        setUsernameStatus('taken')
        setUsernameError('Username is already taken')
      }
    } catch (error) {
      setUsernameStatus('error')
      setUsernameError('Error checking availability')
    }
  }

  const handleUsernameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow both uppercase and lowercase letters, numbers, and underscores
    const value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '')
    setUsernameInput(value)
    
    // Debounce check
    if (value.length >= 3) {
      const timer = setTimeout(() => checkUsernameAvailability(value), 500)
      return () => clearTimeout(timer)
    } else if (value.length > 0) {
      setUsernameStatus('invalid')
      setUsernameError('Username must be at least 3 characters')
    } else {
      setUsernameStatus('idle')
      setUsernameError('')
    }
  }

  const handleSaveUsername = async () => {
    if (usernameStatus !== 'available' || !usernameInput) return
    
    setIsSavingUsername(true)
    try {
      const result = await firebaseJournalService.claimUsername(usernameInput)
      if (result.success) {
        // Keep the display username with original casing
        const displayUsername = usernameInput.trim()
        setUsername(displayUsername)
        setIsEditingUsername(false)
        setUsernameInput('')
        setUsernameStatus('idle')
        
        // Also call onUpdateProfile to sync the username to parent state
        // This ensures the username persists after page refresh
        await onUpdateProfile({ username: displayUsername })
        console.log('✅ Username saved and synced:', displayUsername)
      } else {
        setUsernameStatus('error')
        setUsernameError(result.error || 'Failed to save username')
      }
    } catch (error) {
      setUsernameStatus('error')
      setUsernameError('Failed to save username')
    } finally {
      setIsSavingUsername(false)
    }
  }

  // Get achievement icon component
  const getAchievementIcon = (iconName: string, size: number = 12) => {
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

  // Get rarity color
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-500'
      case 'rare': return 'from-blue-400 to-blue-600'
      case 'epic': return 'from-purple-400 to-purple-600'
      case 'legendary': return 'from-amber-400 to-orange-500'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  // Get unlocked achievements
  const unlockedAchievements = achievements.filter(a => unlockedAchievementIds.includes(a.id))

  return (
    <>
      {/* Profile Card */}
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-[var(--surface)] dark:bg-[var(--surface)] rounded-2xl border border-[var(--border)] dark:border-white/5"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--border)] dark:border-white/5">
            <p className="text-sm text-[var(--text-secondary)]">
              Personal Info
            </p>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 text-[var(--primary)] text-xs font-medium hover:from-[var(--primary)]/20 hover:to-[var(--secondary)]/20 active:scale-95 transition-all duration-200"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
              )}
              {isEditing && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-xs px-2 py-1"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white text-xs px-2 py-1"
                  >
                    <Save className="h-3.5 w-3.5 mr-1" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Clickable to expand */}
          <div 
            className={`p-4 sm:p-5 ${!isEditing ? 'cursor-pointer hover:bg-[var(--background)]/50 dark:hover:bg-white/[0.02] transition-colors' : ''}`}
            onClick={() => !isEditing && setShowShareModal(!showShareModal)}
          >
            {/* Avatar and Basic Info */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="relative mx-auto sm:mx-0">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={`${profile.displayName}'s avatar`}
                    className="h-20 w-20 rounded-full object-cover shadow-md border-2 border-[var(--border)] dark:border-purple-500/20"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`h-20 w-20 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-lg font-semibold text-white shadow-md ${profile.avatar ? 'hidden' : 'flex'}`}
                >
                  {getInitials(profile.displayName)}
                </div>
              </div>
              
              <div className="flex-1 space-y-3">
                {!isEditing ? (
                  <div className="space-y-2 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-between">
                      <h3 className="text-xl font-semibold text-[var(--text-primary)]">{profile.displayName}</h3>
                      <motion.div
                        animate={{ rotate: showShareModal ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="hidden sm:flex items-center justify-center w-6 h-6 rounded-full bg-[var(--background)] dark:bg-white/5"
                      >
                        <ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />
                      </motion.div>
                    </div>
                    {/* Username Display */}
                    {username && (
                      <div className="flex items-center justify-center sm:justify-start gap-1 text-sm text-[var(--primary)]">
                        <AtSign className="h-3.5 w-3.5" />
                        <span className="font-medium">{username}</span>
                      </div>
                    )}
                    {profile.bio && (
                      <p className="text-sm text-[var(--text-secondary)]">{profile.bio}</p>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-[var(--text-secondary)]">
                      {profile.location && (
                        <div className="flex items-center justify-center sm:justify-start gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {profile.location}
                        </div>
                      )}
                      <div className="flex items-center justify-center sm:justify-start gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Joined {formatJoinDate(profile.joinedDate)}
                      </div>
                    </div>
                    {/* Mobile expand indicator */}
                    <div className="flex sm:hidden items-center justify-center pt-2">
                      <motion.div
                        animate={{ rotate: showShareModal ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)]"
                      >
                        <span>{showShareModal ? 'Collapse' : 'Tap to share'}</span>
                        <ChevronDown className="h-3 w-3" />
                      </motion.div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 w-full" onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[var(--text-primary)]">Display Name</label>
                      <input
                        className="w-full px-3 py-2 bg-[var(--background)] dark:bg-white/5 border border-[var(--border)] dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 text-[var(--text-primary)] text-sm transition-colors"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        placeholder="Enter your display name"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[var(--text-primary)]">Bio</label>
                      <textarea
                        className="w-full px-3 py-2 bg-[var(--background)] dark:bg-white/5 border border-[var(--border)] dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 text-[var(--text-primary)] text-sm transition-colors resize-none"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                        rows={2}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[var(--text-primary)]">Location</label>
                      <input
                        className="w-full px-3 py-2 bg-[var(--background)] dark:bg-white/5 border border-[var(--border)] dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 text-[var(--text-primary)] text-sm transition-colors"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Your location"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Expandable Share Section */}
          <motion.div
            initial={false}
            animate={{ 
              height: showShareModal ? 'auto' : 0,
              opacity: showShareModal ? 1 : 0
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-5 pt-0 border-t border-[var(--border)] dark:border-white/5">
              <div className="pt-4 sm:pt-5 space-y-4">
                {/* Share Header */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Share2 className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">Share Your Journey</span>
                </div>

                {/* Card Preview */}
                <div className="rounded-xl overflow-hidden bg-[var(--background)] dark:bg-[#0f1419] border border-[var(--border)] dark:border-gray-700/50 p-3 sm:p-4">
                  {/* Profile Section */}
                  <div className="flex items-center gap-2.5 mb-3">
                    {profile.avatar ? (
                      <img 
                        src={profile.avatar} 
                        alt={profile.displayName}
                        className="w-10 h-10 rounded-xl object-cover border-2 border-[var(--primary)]/20 dark:border-gray-700/50"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-sm font-bold text-white">
                        {getInitials(profile.displayName)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[var(--text-primary)] font-bold text-xs truncate">{profile.displayName}</h4>
                      <p className="text-[var(--text-secondary)] text-[9px]">
                        Since {formatJoinDate(profile.joinedDate)}
                      </p>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between bg-[var(--surface)] dark:bg-white/5 rounded-lg p-2 mb-3 border border-[var(--border)] dark:border-transparent">
                    <div className="text-center flex-1">
                      <div className="text-sm font-bold text-[var(--text-primary)]">{profile.totalEntries}</div>
                      <div className="text-[8px] text-[var(--text-secondary)]">Entries</div>
                    </div>
                    <div className="w-px h-6 bg-[var(--border)] dark:bg-white/10" />
                    <div className="text-center flex-1">
                      <div className="text-sm font-bold text-orange-500 flex items-center justify-center gap-0.5">
                        {profile.currentStreak}
                        <Flame className="w-3 h-3" />
                      </div>
                      <div className="text-[8px] text-[var(--text-secondary)]">Streak</div>
                    </div>
                    <div className="w-px h-6 bg-[var(--border)] dark:bg-white/10" />
                    <div className="text-center flex-1">
                      <div className="text-sm font-bold text-amber-500">{longestStreak}</div>
                      <div className="text-[8px] text-[var(--text-secondary)]">Best</div>
                    </div>
                  </div>

                  {/* Achievements */}
                  {unlockedAchievements.length > 0 && (
                    <div className="flex gap-1 mb-2">
                      {unlockedAchievements.slice(0, 4).map((achievement) => (
                        <div
                          key={achievement.id}
                          className={`w-6 h-6 rounded bg-gradient-to-br ${getRarityColor(achievement.rarity)} flex items-center justify-center text-white`}
                          title={achievement.title}
                        >
                          {getAchievementIcon(achievement.icon, 10)}
                        </div>
                      ))}
                      {unlockedAchievements.length > 4 && (
                        <div className="w-6 h-6 rounded bg-[var(--surface)] dark:bg-white/5 flex items-center justify-center text-[9px] text-[var(--text-secondary)] font-medium">
                          +{unlockedAchievements.length - 4}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer Branding */}
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] dark:border-white/5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
                        <BookOpen className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="text-[10px] text-[var(--text-primary)] font-medium">Journaling</span>
                    </div>
                    <span className="text-[8px] text-[var(--primary)]">Visit →</span>
                  </div>
                </div>

                {/* Share Options */}
                <div className="space-y-3">
                  {/* Username Setting */}
                  <div>
                    <p className="text-xs font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-1.5">
                      <AtSign className="w-3.5 h-3.5" />
                      Username
                    </p>
                    {!isEditingUsername ? (
                      <div className="flex gap-2">
                        <div className="flex-1 px-3 py-2 bg-[var(--background)] dark:bg-white/5 border border-[var(--border)] dark:border-white/10 rounded-lg text-sm text-[var(--text-primary)] flex items-center gap-2">
                          {username ? (
                            <>
                              <span className="text-[var(--primary)] font-medium">@{username}</span>
                              <span className="text-xs text-green-500 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Claimed
                              </span>
                            </>
                          ) : (
                            <span className="text-[var(--text-secondary)] text-xs">No username set</span>
                          )}
                        </div>
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setIsEditingUsername(true); 
                            setUsernameInput(username || '');
                            setUsernameStatus('idle');
                          }}
                          className="px-3 py-2 rounded-lg text-xs font-medium bg-[var(--surface-elevated)] dark:bg-white/5 text-[var(--text-primary)] hover:bg-[var(--border)] transition-all active:scale-95"
                        >
                          {username ? 'Change' : 'Set'}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">@</div>
                            <input
                              type="text"
                              value={usernameInput}
                              onChange={handleUsernameInputChange}
                              placeholder="Enter username"
                              maxLength={20}
                              className="w-full pl-7 pr-10 py-2 bg-[var(--background)] dark:bg-white/5 border border-[var(--border)] dark:border-white/10 rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                            />
                            {usernameStatus !== 'idle' && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {usernameStatus === 'checking' && (
                                  <div className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                                )}
                                {usernameStatus === 'available' && (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                )}
                                {(usernameStatus === 'taken' || usernameStatus === 'invalid' || usernameStatus === 'error') && (
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        {usernameError && (
                          <p className="text-xs text-red-500">{usernameError}</p>
                        )}
                        {usernameStatus === 'available' && usernameInput && (
                          <p className="text-xs text-green-500">Username is available!</p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setIsEditingUsername(false);
                              setUsernameInput('');
                              setUsernameStatus('idle');
                              setUsernameError('');
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] dark:border-white/10 text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveUsername}
                            disabled={usernameStatus !== 'available' || isSavingUsername}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              usernameStatus === 'available' && !isSavingUsername
                                ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white hover:opacity-90 active:scale-95'
                                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {isSavingUsername ? 'Saving...' : 'Save Username'}
                          </button>
                        </div>
                        <p className="text-[10px] text-[var(--text-secondary)]">
                          3-20 characters. Letters, numbers, and underscores only.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Profile Link */}
                  <div>
                    <p className="text-xs font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Profile Link
                    </p>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={shareableLink}
                        className="flex-1 px-3 py-2 bg-[var(--background)] dark:bg-white/5 border border-[var(--border)] dark:border-white/10 rounded-lg text-xs text-[var(--text-primary)] truncate"
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); copyToClipboard(shareableLink, 'link'); }}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                          copied === 'link' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-[var(--primary)] text-white hover:opacity-90'
                        }`}
                      >
                        {copied === 'link' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Embed Code */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1.5">
                        <Code className="w-3.5 h-3.5" />
                        Embed Code
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); copyToClipboard(embedCode, 'embed'); }}
                        className={`px-2 py-1 rounded text-[10px] font-medium transition-all active:scale-95 ${
                          copied === 'embed' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-[var(--surface-elevated)] dark:bg-white/5 text-[var(--text-secondary)] hover:bg-[var(--border)]'
                        }`}
                      >
                        {copied === 'embed' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <pre className="p-3 bg-[var(--background)] dark:bg-white/5 border border-[var(--border)] dark:border-white/10 rounded-lg text-[10px] text-[var(--text-secondary)] overflow-x-auto whitespace-pre-wrap break-all">
                      {embedCode}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}
