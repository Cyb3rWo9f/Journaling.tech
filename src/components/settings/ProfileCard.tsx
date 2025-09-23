'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { UserProfile } from '@/types'
import { Edit2, Save, X, MapPin, Calendar } from 'lucide-react'

interface ProfileCardProps {
  profile: UserProfile
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>
  isLoading?: boolean
}

export function ProfileCard({ profile, onUpdateProfile, isLoading }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    displayName: profile.displayName,
    bio: profile.bio || '',
    location: profile.location || '',
  })
  const [isSaving, setIsSaving] = useState(false)

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

  return (
    <Card className="w-full bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 border-0 shadow-lg dark:shadow-gray-900/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your personal information and preferences
          </p>
        </div>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            disabled={isLoading}
            className="bg-white/80 dark:bg-[#0b0f13]/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#0b0f13]/80 transition-all duration-200"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
              className="bg-white/80 dark:bg-[#0b0f13]/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#0b0f13]/80"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        )}
      </CardHeader>
  <CardContent className="space-y-6 bg-white/30 dark:bg-[#0b0f13]/30 backdrop-blur-sm">
        {/* Avatar and Basic Info */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4 space-y-4 sm:space-y-0">
          <div className="relative mx-auto sm:mx-0">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={`${profile.displayName}'s avatar`}
                className="h-20 w-20 rounded-full object-cover shadow-lg border-2 border-white dark:border-gray-700"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-lg font-semibold text-white shadow-lg ${profile.avatar ? 'hidden' : 'flex'}`}
            >
              {getInitials(profile.displayName)}
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            {!isEditing ? (
              <div className="space-y-2 text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{profile.displayName}</h3>
                {profile.bio && (
                  <p className="text-gray-600 dark:text-gray-300">{profile.bio}</p>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 dark:text-gray-400">
                  {profile.location && (
                    <div className="flex items-center justify-center sm:justify-start gap-1">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                      {profile.location}
                    </div>
                  )}
                  <div className="flex items-center justify-center sm:justify-start gap-1">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    Joined {formatJoinDate(profile.joinedDate)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 w-full px-2 sm:px-0">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Display Name</label>
                  <input
                    className="w-full px-3 py-2 bg-white/80 dark:bg-[#0b0f13]/80 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 text-gray-900 dark:text-white transition-all duration-200"
                    value={formData.displayName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="Enter your display name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                  <textarea
                    className="w-full px-3 py-2 bg-white/80 dark:bg-[#0b0f13]/80 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 text-gray-900 dark:text-white transition-all duration-200 resize-none"
                    value={formData.bio}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                  <input
                    className="w-full px-3 py-2 bg-white/80 dark:bg-[#0b0f13]/80 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 text-gray-900 dark:text-white transition-all duration-200"
                    value={formData.location}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Where are you located?"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="text-center p-2 sm:p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
            <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">{profile.totalEntries}</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Entries</div>
          </div>
          <div className="text-center p-2 sm:p-3 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30">
            <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">{profile.currentStreak}</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Current Streak</div>
          </div>
          <div className="text-center p-2 sm:p-3 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
            <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent">{profile.achievements.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Achievements</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}