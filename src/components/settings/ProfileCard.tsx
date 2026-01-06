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
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-[var(--border)]">
        <div>
          <p className="text-sm text-[var(--text-secondary)]">
            Manage your personal information
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 text-[var(--primary)] text-xs font-medium hover:from-[var(--primary)]/20 hover:to-[var(--secondary)]/20 active:scale-95 transition-all duration-200 shadow-sm"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit</span>
          </button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
              className="border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-md hover:shadow-lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar and Basic Info */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4 space-y-4 sm:space-y-0">
          <div className="relative mx-auto sm:mx-0">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={`${profile.displayName}'s avatar`}
                className="h-20 w-20 rounded-full object-cover shadow-md border-2 border-[var(--border)]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`h-20 w-20 rounded-full bg-[var(--primary)] flex items-center justify-center text-lg font-semibold text-white shadow-md ${profile.avatar ? 'hidden' : 'flex'}`}
            >
              {getInitials(profile.displayName)}
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            {!isEditing ? (
              <div className="space-y-2 text-center sm:text-left">
                <h3 className="text-xl font-semibold text-[var(--text-primary)]">{profile.displayName}</h3>
                {profile.bio && (
                  <p className="text-[var(--text-secondary)]">{profile.bio}</p>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-[var(--text-secondary)]">
                  {profile.location && (
                    <div className="flex items-center justify-center sm:justify-start gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </div>
                  )}
                  <div className="flex items-center justify-center sm:justify-start gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {formatJoinDate(profile.joinedDate)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 w-full">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-primary)]">Display Name</label>
                  <input
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 text-[var(--text-primary)] transition-colors"
                    value={formData.displayName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="Enter your display name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-primary)]">Bio</label>
                  <textarea
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 text-[var(--text-primary)] transition-colors resize-none"
                    value={formData.bio}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-primary)]">Location</label>
                  <input
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 text-[var(--text-primary)] transition-colors"
                    value={formData.location}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Your location"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[var(--border)]">
          <div className="text-center p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]">
            <div className="text-xl font-bold text-[var(--primary)] font-en">{profile.totalEntries}</div>
            <div className="text-xs text-[var(--text-secondary)]">Entries</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]">
            <div className="text-xl font-bold text-orange-500 font-en">{profile.currentStreak}</div>
            <div className="text-xs text-[var(--text-secondary)]">Streak</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]">
            <div className="text-xl font-bold text-[var(--secondary)] font-en">{profile.achievements.length}</div>
            <div className="text-xs text-[var(--text-secondary)]">Badges</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}